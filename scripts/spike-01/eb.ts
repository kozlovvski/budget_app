// SPIKE-01 throwaway tooling (PRD Appendix B, Tooling): signed Enable Banking requests, raw
// responses kept gpg-encrypted outside the repo, diffs between fetches. It decides nothing about
// the product's technical design. Usage: scripts/spike-01/README.md.
import { spawnSync } from 'node:child_process';
import { randomUUID, sign } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { parseArgs } from 'node:util';

const API = 'https://api.enablebanking.com';
const PSU_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

export type Call = {
  at: string;
  method: string;
  path: string;
  status: number;
  ms: number;
  body: unknown;
};
export type Fetch = { at: string; bank: string; strategy: string; mode: string; calls: Call[] };
export type Tx = Record<string, unknown>;
type Session = {
  id: string;
  bank: string;
  country: string;
  approvedAt: string;
  accounts: string[];
};

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set (see scripts/spike-01/README.md)`);
  return value;
}

const dir = () => process.env.SPIKE_DIR ?? join(homedir(), 'spike-01');
const statePath = () => join(dir(), 'state.json');
const readState = (): Session[] =>
  existsSync(statePath()) ? JSON.parse(readFileSync(statePath(), 'utf8')) : [];

function jwt(): string {
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url');
  const iat = Math.floor(Date.now() / 1000);
  const header = part({ typ: 'JWT', alg: 'RS256', kid: env('EB_APP_ID') });
  const claims = part({
    iss: 'enablebanking.com',
    aud: 'api.enablebanking.com',
    iat,
    exp: iat + 3600,
  });
  const signature = sign(
    'sha256',
    Buffer.from(`${header}.${claims}`),
    readFileSync(env('EB_KEY_PATH')),
  );
  return `${header}.${claims}.${signature.toString('base64url')}`;
}

// Every call is logged with its full response: errors are findings too (items 13, 14, 21).
async function api(
  calls: Call[],
  method: string,
  path: string,
  opts: { body?: unknown; present?: boolean } = {},
): Promise<Call> {
  const headers = {
    Authorization: `Bearer ${jwt()}`,
    'Content-Type': 'application/json',
    // Psu-* headers tell the bank a member is at the keyboard, so the fetch isn't unattended.
    ...(opts.present ? { 'Psu-Ip-Address': env('PSU_IP'), 'Psu-User-Agent': PSU_USER_AGENT } : {}),
  };
  const started = Date.now();
  let status = 0;
  let body: unknown;
  try {
    const res = await fetch(API + path, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    status = res.status;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  } catch (err) {
    body = String(err);
  }
  const call = {
    at: new Date(started).toISOString(),
    method,
    path,
    status,
    ms: Date.now() - started,
    body,
  };
  calls.push(call);
  return call;
}

async function fetchSession(
  calls: Call[],
  s: Session,
  strategy: string,
  present: boolean,
  from?: string,
) {
  await api(calls, 'GET', `/sessions/${s.id}`, { present });
  for (const uid of s.accounts) {
    await api(calls, 'GET', `/accounts/${uid}/details`, { present });
    await api(calls, 'GET', `/accounts/${uid}/balances`, { present });
    let key: string | undefined;
    do {
      const query = new URLSearchParams({ strategy });
      if (from) query.set('date_from', from);
      if (key) query.set('continuation_key', key);
      const call = await api(calls, 'GET', `/accounts/${uid}/transactions?${query}`, { present });
      key = (call.body as { continuation_key?: string } | null)?.continuation_key ?? undefined;
      // The guard stops a pagination loop from spending the bank's daily fetch limit.
    } while (key && calls.length < 1000);
  }
}

function save(f: Fetch): string {
  mkdirSync(join(dir(), 'raw'), { recursive: true });
  const name = `${f.at.replace(/[:.]/g, '-')}_${f.bank.replace(/[^A-Za-z0-9]+/g, '-')}_${f.strategy}_${f.mode}.json`;
  const file = join(dir(), 'raw', `${name}.gpg`);
  const gpg = spawnSync(
    'gpg',
    ['--batch', '--yes', '--encrypt', '--recipient', env('SPIKE_GPG_KEY'), '--output', file],
    { input: JSON.stringify(f) },
  );
  if (gpg.status === 0) return file;
  // Some history can't be fetched again, so keep it unencrypted rather than lose it.
  writeFileSync(join(dir(), 'raw', name), JSON.stringify(f));
  throw new Error(
    `gpg failed, kept ${name} UNENCRYPTED in ${dir()}/raw, encrypt it by hand: ${gpg.stderr}`,
  );
}

function load(file: string): Fetch {
  if (!file.endsWith('.gpg')) return JSON.parse(readFileSync(file, 'utf8'));
  const gpg = spawnSync('gpg', ['--quiet', '--decrypt', file], {
    maxBuffer: 2 ** 30,
    stdio: ['ignore', 'pipe', 'inherit'],
  });
  if (gpg.status !== 0) throw new Error(`gpg could not decrypt ${file}`);
  return JSON.parse(gpg.stdout.toString());
}

export function transactions(f: Fetch): Tx[] {
  return f.calls.flatMap((call) => {
    const account = /^\/accounts\/([^/]+)\/transactions/.exec(call.path)?.[1];
    const list = (call.body as { transactions?: Tx[] } | null)?.transactions;
    return account && call.status === 200 && list ? list.map((t) => ({ ...t, account })) : [];
  });
}

const txKey = (t: Tx) =>
  ((t.transaction_id ?? t.entry_reference) as string | undefined) ?? JSON.stringify(t);
const txDate = (t: Tx) =>
  ((t.booking_date ?? t.transaction_date ?? t.value_date) as string | undefined) ?? '';

// Pairs transactions by bank identifier. One without an identifier shows as gone + added when it changes.
export function diff(a: Fetch, b: Fetch) {
  const before = Map.groupBy(transactions(a), txKey);
  const after = Map.groupBy(transactions(b), txKey);
  const oldest = new Map(
    [...Map.groupBy(transactions(b), (t) => String(t.account))].map(([account, list]) => [
      account,
      list.map(txDate).filter(Boolean).sort()[0] ?? '',
    ]),
  );
  return {
    added: [...after].filter(([key]) => !before.has(key)).map(([, [t]]) => t),
    // Skip items that only fell out of the bank's date window, or whose account returned nothing.
    gone: [...before]
      .filter(([key, [t]]) => {
        const since = oldest.get(String(t.account));
        return !after.has(key) && since !== undefined && txDate(t) >= since;
      })
      .map(([, [t]]) => t),
    changed: [...after].flatMap(([key, [t]]) => {
      const old = before.get(key)?.[0];
      if (!old) return [];
      const fields = [...new Set([...Object.keys(old), ...Object.keys(t)])].filter(
        (f) => JSON.stringify(old[f]) !== JSON.stringify(t[f]),
      );
      return fields.length
        ? [{ key, fields: Object.fromEntries(fields.map((f) => [f, [old[f], t[f]]])) }]
        : [];
    }),
    duplicates: [...after]
      .filter(([, list]) => list.length > 1)
      .map(([key, list]) => ({ key, count: list.length })),
  };
}

// Share (%) of transactions with each field filled, nested fields as dotted paths (item 6).
export function fieldShare(txs: Tx[]): Record<string, number> {
  const counts: Record<string, number> = {};
  const walk = (value: unknown, path: string): void => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value)) walk(v, path ? `${path}.${k}` : k);
      return;
    }
    const filled =
      value !== null &&
      value !== undefined &&
      value !== '' &&
      !(Array.isArray(value) && !value.length);
    counts[path] = (counts[path] ?? 0) + (filled ? 1 : 0);
  };
  for (const t of txs) walk(t, '');
  const paths = Object.keys(counts);
  return Object.fromEntries(
    Object.entries(counts)
      .filter(([path]) => !paths.some((p) => p.startsWith(`${path}.`)))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, n]) => [path, Math.round((100 * n) / txs.length)]),
  );
}

function report(f: Fetch, file: string) {
  console.log(`${f.bank} ${f.strategy} ${f.mode}: ${f.calls.length} requests, ${file}`);
  for (const c of f.calls.filter((c) => c.status !== 200)) {
    console.log(`  ${c.status} ${c.method} ${c.path}: ${JSON.stringify(c.body)}`);
  }
  for (const [account, list] of Map.groupBy(transactions(f), (t) => String(t.account))) {
    const dates = list.map(txDate).filter(Boolean).sort();
    const statuses = [...Map.groupBy(list, (t) => String(t.status))].map(
      ([s, l]) => `${s} ${l.length}`,
    );
    console.log(
      `  ${account}: ${list.length} transactions (${statuses.join(', ')}), ${dates[0]} to ${dates.at(-1)}`,
    );
  }
}

const line = (t: Tx) =>
  JSON.stringify({
    account: t.account,
    status: t.status,
    date: txDate(t),
    amount: t.transaction_amount,
    sign: t.credit_debit_indicator,
    text: t.remittance_information,
  });

async function main() {
  const { positionals, values: opts } = parseArgs({
    allowPositionals: true,
    options: {
      bank: { type: 'string' },
      country: { type: 'string', default: 'PL' },
      days: { type: 'string', default: '180' },
      session: { type: 'string' },
      strategy: { type: 'string', default: 'default' },
      from: { type: 'string' },
      present: { type: 'boolean', default: false },
    },
  });
  const [command, ...args] = positionals;
  const now = () => new Date().toISOString();

  switch (command) {
    case 'aspsps': {
      const call = await api([], 'GET', `/aspsps?country=${opts.country}`);
      const list = (call.body as { aspsps?: { name: string }[] }).aspsps ?? [];
      const bank = opts.bank?.toLowerCase();
      // With --bank, the full entry shows the bank's maximum consent length (item 1).
      console.log(
        JSON.stringify(
          bank ? list.filter((a) => a.name.toLowerCase().includes(bank)) : list.map((a) => a.name),
          null,
          2,
        ),
      );
      break;
    }
    case 'application': {
      console.log(JSON.stringify((await api([], 'GET', '/application')).body, null, 2));
      break;
    }
    case 'connect': {
      env('SPIKE_GPG_KEY');
      if (!opts.bank) throw new Error('connect needs --bank (exact name from aspsps)');
      const f: Fetch = {
        at: now(),
        bank: opts.bank,
        strategy: 'longest',
        mode: 'connect',
        calls: [],
      };
      const auth = await api(f.calls, 'POST', '/auth', {
        body: {
          access: { valid_until: new Date(Date.now() + Number(opts.days) * 864e5).toISOString() },
          aspsp: { name: opts.bank, country: opts.country },
          state: randomUUID(),
          redirect_url: env('EB_REDIRECT_URL'),
          psu_type: 'personal',
        },
      });
      const url = (auth.body as { url?: string }).url;
      if (!url) throw new Error(`No authorisation URL: ${JSON.stringify(auth.body)}`);
      console.log(`Open this and approve at the bank:\n${url}\n`);
      const rl = createInterface({ input: process.stdin, output: process.stdout });
      const pasted = (await rl.question('Paste the URL the bank redirected you to: ')).trim();
      rl.close();
      const code = pasted.startsWith('http') ? new URL(pasted).searchParams.get('code') : pasted;
      const created = await api(f.calls, 'POST', '/sessions', { body: { code } });
      const body = created.body as { session_id?: string; accounts?: { uid: string }[] };
      if (!body.session_id) {
        report(f, save(f));
        throw new Error('No session was created');
      }
      const s: Session = {
        id: body.session_id,
        bank: opts.bank,
        country: opts.country,
        approvedAt: created.at,
        accounts: body.accounts?.map((a) => a.uid) ?? [],
      };
      mkdirSync(dir(), { recursive: true });
      writeFileSync(statePath(), JSON.stringify([...readState(), s], null, 2));
      console.log(`Session ${s.id}, ${s.accounts.length} accounts. Fetching "longest" now.`);
      // At once: the extended-history window may close minutes after approval (step 2, G13).
      await fetchSession(f.calls, s, 'longest', true, opts.from);
      report(f, save(f));
      break;
    }
    case 'fetch': {
      env('SPIKE_GPG_KEY');
      const sessions = readState().filter((s) => !opts.session || s.id === opts.session);
      if (!sessions.length) throw new Error('No matching session: run connect first');
      for (const s of sessions) {
        const mode = opts.present ? 'present' : 'unattended';
        const f: Fetch = { at: now(), bank: s.bank, strategy: opts.strategy, mode, calls: [] };
        await fetchSession(f.calls, s, f.strategy, opts.present, opts.from);
        const minutes = Math.round((Date.parse(f.at) - Date.parse(s.approvedAt)) / 6e4);
        console.log(`Session ${s.id}, approved ${minutes} minutes before this fetch`);
        report(f, save(f));
      }
      break;
    }
    case 'diff': {
      const raw = join(dir(), 'raw');
      // No files given: the newest two fetches of each bank and strategy.
      const pairs =
        args.length === 2
          ? [args]
          : [
              ...Map.groupBy(
                readdirSync(raw)
                  .filter((n) => n.endsWith('.gpg'))
                  .sort(),
                (n) => n.split('_').slice(1, 3).join('_'),
              ).values(),
            ]
              .filter((names) => names.length > 1)
              .map((names) => names.slice(-2).map((n) => join(raw, n)));
      for (const [fileA, fileB] of pairs) {
        const b = load(fileB);
        const d = diff(load(fileA), b);
        console.log(`\nfrom ${fileA}`);
        report(b, fileB);
        for (const t of d.added) console.log(`  + ${line(t)}`);
        for (const t of d.gone) console.log(`  - ${line(t)}`);
        for (const c of d.changed) console.log(`  ~ ${c.key} ${JSON.stringify(c.fields)}`);
        for (const x of d.duplicates) console.log(`  = ${x.key} appears ${x.count} times`);
      }
      break;
    }
    case 'fields': {
      for (const file of args) {
        console.log(file);
        console.table(fieldShare(transactions(load(file))));
      }
      break;
    }
    case 'close': {
      const s = readState().find((x) => x.id === opts.session);
      if (!s) throw new Error('close needs --session <id> from state.json');
      const f: Fetch = { at: now(), bank: s.bank, strategy: 'none', mode: 'close', calls: [] };
      await api(f.calls, 'DELETE', `/sessions/${s.id}`);
      report(f, save(f));
      break;
    }
    default:
      console.log(
        'Commands: aspsps, application, connect, fetch, diff, fields, close. See scripts/spike-01/README.md.',
      );
  }
}

if (import.meta.main) await main();
