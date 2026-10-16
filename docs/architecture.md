# Technical architecture

The high-level technical design for the budget app. `docs/PRD.md` says *what* the app must do; this document says *how* it is built. If the two disagree, the PRD wins and this document is corrected. Requirement IDs such as `BANK-04` and `NFR-12` point into the PRD.

**Status:** agreed, before any application code exists. Items marked **prove in the walking skeleton** are assumptions the first M1 work must test before anything is built on them. Requirements marked `Depends on: SPIKE-01` stay unbuilt until the spike reports; the design keeps their open details in configuration, so the spike's findings change settings rather than code.

## 1. What shapes the design

| PRD driver | What it means for the architecture |
|---|---|
| Enable Banking in restricted mode: one registration and private key per member (BANK-16), about 4 unattended fetches a day per connection (BANK-06), a first-history window of about an hour that can't be repeated (BANK-04), consents that lapse or are revoked without warning (BANK-10) | A background worker with per-connection schedules, retries and limits. Per-member secrets, encrypted. A connection state machine |
| Ingestion: pending → booked, duplicates kept and flagged, member edits always win, nothing silently dropped (TXN-04, TXN-06, TXN-07, TXN-09, TXN-10, NFR-05) | A pure ingestion engine whose tests are the PRD's worked examples. Versioned transactions |
| Every derived number shows how fresh and complete it is (INS-01, NFR-06) and follows one counting rulebook (BUD-02, INS-02) | Figures travel as `{ value, markers }`. The counting rules live in one pure module that every report calls |
| Security and privacy: ASVS L2 baseline (NFR-01), protected bank data (NFR-02), no outside parties beyond the listed ones (NFR-03), append-only audit (NFR-04) | Own session handling, envelope encryption for bank secrets, scrubbed logs, no third-party scripts or fonts |
| Backups: 24 h recovery point, first imports backed up at once, a restore never gives back removed access (NFR-12) | Continuous WAL archiving, and an access journal kept outside the database and replayed after a restore |
| Dashboard within 2 s on a mid-range phone over slow 4G with 25,000 transactions (NFR-07); WCAG 2.2 AA (NFR-08); from 360 px (NFR-09); translatable (NFR-13) | Server-side rendering, small payloads, accessible components, i18n from the first screen |
| One household, built so it could grow | `household_id` on every household-owned row, and every command and query scoped by it |

## 2. Decisions at a glance

| Topic | Decision |
|---|---|
| Backend | NestJS **modular monolith** with CQRS: `@nestjs/cqrs` command and query buses |
| Frontend | React with **TanStack Start** (server-side rendering), TanStack Query and **shadcn/ui** |
| Database | PostgreSQL in its own CloudNativePG cluster. The single source of truth |
| ORM | **MikroORM v7**. Domain classes are plain TypeScript, mapped in infrastructure with `defineEntity({ class })`. Read queries that need SQL use MikroORM's built-in Kysely (`em.getKysely()`) |
| Background work | **BullMQ on Redis**. Events are queued after commit; every consumer also has a **sweep** that finds work it missed |
| Read side | **Computed on request** from the write tables. No stored projections. Slow queries are optimised when a measurement shows the need |
| Clients | The application layer is the API. Thin adapters per consumer: REST with OpenAPI for the web app now, MCP later. Queries take **named includes**. No GraphQL |
| Encryption (NFR-02) | Encrypted volumes and backups, plus app-level envelope encryption for Enable Banking secrets |
| Hosting (NFR-03, PRD §10 question 6) | Oracle Cloud Infrastructure, region eu-frankfurt-1: the developer's Kubernetes cluster, deployed with ArgoCD |
| Tenancy | One household. The PRD non-goal of multiple households stands; the data model only avoids closing that door |
| Observability | Grafana Cloud, with Grafana Faro in the browser, both scrubbed. **Needs a PRD change first** (§14) |
| Machine-learning categoriser | A separate Python service, **Later** (PRD §10 question 4), behind a port that exists from M2 |

## 3. System overview

```
 Browser (React, TanStack Start, shadcn/ui, Faro scrubbed)          MCP client (Later)
        │ https://budget.<domain>  one origin, __Host- session cookie       │
 ingress-nginx ──/api/*──► api   NestJS: REST adapter (MCP adapter Later) ◄──/mcp──┘
        └──────/*──────► web   TanStack Start SSR; loaders call api in-cluster with the cookie
                              │ commands and queries           │ after commit: enqueue IDs only
                              ▼                                ▼
                 PostgreSQL (dedicated CNPG cluster)        Redis (BullMQ)
                 schemas: core · audit                         │
                              ▲                                ▼
                              └────────────────────── worker   NestJS, same image as api
   OCI Object Storage ◄── WAL + base backups                 · bank sync, first import
   (another region)   ◄── access-journal shipper             · ingest → categorise → recurring
                                                             · sweeps, purges, auto-settle, FX rates
                                                             · CSV import and export, emails
                                                             ├──► Enable Banking (JWT per member registration)
                                                             ├──► email service (links and invites only)
                                                             └──► categoriser (Later, in-cluster only)
```

| Process | Job |
|---|---|
| `web` | Renders pages. Its loaders call `api` inside the cluster and pass the session cookie on. No business logic and no database access |
| `api` | The HTTP entrypoint. Runs commands and queries; queues background work after commit |
| `worker` | The same image with another entrypoint. Runs job processors and schedules. The only process that talks to Enable Banking, the email service and (later) the categoriser |
| PostgreSQL | All state that matters, including history, audit and job bookkeeping such as refresh counters |
| Redis | BullMQ queues only. Jobs carry IDs, never financial data, so Redis can be wiped at any time |

## 4. Repository layout

pnpm workspaces with Turborepo:

```
apps/web/             TanStack Start
apps/api/             NestJS: main.ts (HTTP), main.worker.ts (BullMQ), main.cli.ts (nest-commander)
apps/categoriser/     Python FastAPI service, Later. Not created until needed
packages/api-client/  generated from the api's OpenAPI document (orval: typed fetch, TanStack Query hooks, zod)
deploy/               kustomize base and overlay, ArgoCD Application
```

`api` and `worker` ship as one image with two Deployments. A shared package is created only when two apps really share something.

## 5. Backend

### 5.1 Patterns

- **Modular monolith.** Modules follow the PRD's areas. They talk to each other only through commands, queries and events, never through another module's tables. dependency-cruiser enforces this in CI.
- **Domain-driven design where it pays.** Module boundaries and names come from the PRD glossary (Appendix C). Aggregates, value objects and domain events are used only where the logic is hard: banking (the connection state machine), transactions (ingestion and edits), budgeting (periods and Settle) and recurring items. Simple modules are plain handlers over tables.
- **Hexagonal, with the clean-architecture dependency rule.** `domain` ← `application` ← adapters and infrastructure.
  - The domain imports nothing from Nest or MikroORM.
  - Handlers keep their Nest decorators; they are still plain classes in tests.
  - Handlers are the use cases. There are no extra presenter or use-case interface layers.
- **CQRS without event sourcing or projections.**
  - Commands load an aggregate, call it and save it.
  - Queries read tables directly and return DTOs. They never load aggregates.
  - The history the PRD asks for is kept in explicit append-only tables: transaction versions and edit history (TXN-03), duplicate decisions (TXN-10), plan history (BUD-16), settle snapshots (BUD-19) and the audit log (NFR-04). Erasure (HH-08) stays an ordinary delete or pseudonymisation, which event sourcing would make hard.
- **Functional core, imperative shell.** The ingestion engine, categorisation precedence (CAT-05), the counting rulebook (BUD-02, INS-02), the flex formula and the freshness and marker rules are pure functions. Handlers load data, call them and save the result. The PRD's must-behave examples become their tests.

### 5.2 Modules

| Module | PRD area | Notes |
|---|---|---|
| `identity` | AUTH | Sign-in, sessions, 2FA, re-authentication |
| `household` | HH | Members, roles, invites, removal and erasure |
| `banking` | BANK | Registrations, connections (aggregate), sync scheduling |
| `accounts` | ACC | Bank, CSV and manual accounts, coverage |
| `transactions` | TXN | Transaction aggregate, ingestion engine, CSV import |
| `categorisation` | CAT | Categories, rules, learned patterns, the `CategorySuggester` port |
| `budgeting` | BUD | Plans, budget periods (aggregate), Settle |
| `recurring` | REC | Recurring items (aggregate), detection |
| `forecast` | FC | Cash-flow forecast, computed on request |
| `net-worth` | NW | Manual assets and liabilities, snapshots |
| `insights` | INS | Dashboard, reports, recap, insights |
| `settings` | SET | Household settings, FX rule |
| `data-lifecycle` | SET-08, SET-09, SET-11, HH-08 | Export, Recently deleted, erasure, household deletion |
| `audit` | NFR-04 | Append-only audit log |

**Shared kernel** (`shared/`): `Money`, `BudgetDate` and `Period`, `HouseholdContext`, `Markers`, a small `AggregateRoot` base that collects domain events, the after-commit publisher and a sweep helper. Nothing else goes there without a second user.

### 5.3 Module layout and naming

```
apps/api/src/
  main.ts · main.worker.ts · main.cli.ts         one root module per entrypoint
  shared/
  modules/transactions/
    domain/
      transaction.ts                             plain class, no framework imports
      ingestion/*.ts                             pure functions
      events.ts
    application/
      commands/edit-transaction.command.ts       Command<Result> and its @CommandHandler
      queries/get-transactions.query.ts          Query<Result>, its @QueryHandler and allowed includes
      ports.ts                                   abstract classes used as DI tokens
    infrastructure/
      transaction.schema.ts                      defineEntity({ class: Transaction })
      transaction.repository.ts
    transactions.http.controller.ts              REST adapter
    transactions.jobs.ts                         BullMQ processors
    transactions.cli.ts                          nest-commander commands
    transactions.mcp.tools.ts                    MCP tools (Later)
    transactions.module.ts                       handlers, repositories, port bindings, HTTP controller
    transactions.worker.module.ts                job processors; imported only by the worker root module
```

- A command or query and its handler share one file.
- **Domain classes** use TypeScript `private`, not native `#` fields, which MikroORM can only fill through the constructor. A private constructor (creation only through a factory method) is mapped with `defineEntity<Transaction>({ class: Transaction as any, … })`, as the v7 upgrade guide shows. MikroORM hydrates loaded rows without calling the constructor.
- **Ports are abstract classes**, so they work as Nest DI tokens without string tokens. Implementations live in `infrastructure/`.
- **Adapter files are named by consumer:** `.http.controller.ts`, `.jobs.ts`, `.cli.ts`, `.mcp.tools.ts`. They only translate between the transport and the buses.
- **Each entrypoint's root module picks its adapters.** The feature module carries the HTTP controller, which is inert in the worker and CLI because they start no HTTP server. Job processors and CLI commands start work by themselves, so they sit in modules that only the worker or CLI root imports.

### 5.4 Commands and queries

- **The application layer is the API.** Every handler receives the `HouseholdContext`, the acting member and the parameters, and returns a plain DTO. Typed results come from `Command<T>` and `Query<T>`.
- **Checks live in the application layer, never in a controller:** household scoping, Owner-only actions, and recent re-authentication for destructive or access-changing actions (AUTH-10). That way every transport gets them.
- **Writes** run in one MikroORM transaction: load the aggregate through its repository, call a domain method, save. Aggregates carry a `version`, which MikroORM checks on flush. A conflict returns HTTP 409 with the current state, which gives the "changed since you opened it" flow (NFR-05).
- **Reads** never load aggregates. Query handlers use `em.getKysely()` for joins and reports (typed from the same entity definitions, inside the same transaction context) or `em.find` with `fields` and `disableIdentityMap: true` for simple lookups, which returns detached entities that a flush ignores.
- **Scoping.** Every repository method and every read query takes the household ID. There are no unscoped finders.

### 5.5 Clients and transports

| Adapter | Consumer | When |
|---|---|---|
| `.http.controller.ts` | The web app, through REST and an OpenAPI document from `@nestjs/swagger` | M1 |
| `.jobs.ts` | The worker | M1 |
| `.cli.ts` | The operator: replay the access journal, rotate the key-encryption key, seed test data | M1 |
| `.mcp.tools.ts` | An MCP client | Later, and only after a PRD change (§13) |

**Named includes.** Queries stay extendable and the consumer decides what it needs:

- Entity list and detail queries declare the includes they allow, for example `GetTransactions({ filter, page, include: ['category', 'account'] })`. REST exposes this as `?include=category,account`. Unknown includes are rejected.
- The default response is small. Included sections are optional fields in the result type.
- Screen-shaped queries (dashboard, period summary, reports) have a fixed shape.
- **Markers are never optional.** A figure always travels as `{ value, markers }`, whatever the consumer asks for.
- A separate query is added only when the meaning differs, such as a plain-language summary for an agent.

**No GraphQL.** It doesn't serve MCP, which exposes tools rather than a schema; field selection would let a client leave out markers; and no client needs free-form selection.

### 5.6 Reads and performance

- **Computed on request.** Reports load the period's rows and apply the pure counting rules in TypeScript, so every report, the recap and the dashboard share one rulebook. Markers that depend on the clock, such as "stale", are worked out at query time.
- **Read-your-writes is automatic**, because a query reads the same tables the command just wrote.
- **Indexes** such as `(household_id, budget_date)` keep a period to a few hundred rows and a 12-period report to a few thousand.
- **Measure, then optimise.** NFR-07's targets are measured against the reference dataset of 25,000 transactions. Only a query that misses its target gets more:
  1. better SQL or an index;
  2. a cache keyed by `(query, parameters, household data version)`, where the data version is a counter increased in the same transaction as every write, so nothing needs invalidating and nothing stale is served;
  3. a stored projection, as a last resort.

### 5.7 Events and background work

- **Publishing.** Aggregates collect domain events. A MikroORM event subscriber takes them from the flushed aggregates in `onFlush`, holds them until commit, and in `afterTransactionCommit` sends them straight to BullMQ, with no in-memory event bus in between. `afterTransactionRollback` drops them. The job ID is the event ID, so the same event is not queued twice while its job is kept. Payloads carry IDs only.
- **One event per batch.** Ingestion emits `transactions.ingested { ids[] }` per sync or import, so a first import of 2,000 transactions is one job and one batched categorisation call. A manual edit emits a single event.
- **Sweeps close the gap.** A crash between commit and enqueue loses the event. So every consumer must be able to find missed work from the data, and runs a repeating sweep job:

  | Consumer | How its sweep finds missed work |
  |---|---|
  | Categorise | Rows that are uncategorised and not in progress |
  | Recurring match | Rows not yet checked |
  | Access-journal shipper | Journal rows not yet copied to object storage |

- **Handlers are idempotent.** They check the current state before acting, so a job run twice, or by both the event and a sweep, does no harm (NFR-05 "Repeat-safe imports").
- **What must never be lost is written in the same transaction, never only sent as an event.** The access journal (§8) is the example.
- **Example flow:** sync → ingest (pure engine) → `transactions.ingested` → categorise (the CAT-05 chain) → `transactions.categorised` → recurring match.
- **Redis can be thrown away.** After a restore or a Redis failure: wipe Redis, let the schedules re-register at startup and let the sweeps pick up pending work.

### 5.8 Bank sync scheduling

- **Scheduled sync (BANK-06):** a BullMQ job scheduler per connection with three slots a day in the household time zone, one of them finishing before 07:00. That leaves room in the 4-a-day allowance for a manual refresh.
- **First import (BANK-04):** a high-priority job, retried within the history window. Scheduled syncs for that connection wait until it ends.
- **Manual refresh (BANK-07):** limits and their messages come from counters in PostgreSQL, not from the queue.
- **One sync per connection at a time:** a PostgreSQL advisory lock. BullMQ's per-group concurrency is a paid feature, and the lock is enough.
- **Connection health (BANK-10):** worked out on request from the last sync result and the consent's expiry date.
- **Long processes are state columns plus delayed jobs.** Household deletion is a `deletion_scheduled_at` column and a delayed job that checks it before acting (SET-09). Purges after 7 days work the same way (HH-07, SET-11).

### 5.9 Bank data and ingestion

- **One port, two adapters.** `BankDataProvider` has an Enable Banking adapter, which signs an RS256 JWT with the key of the member who holds the connection (BANK-16), and a CSV adapter. Both produce the same `IncomingTransaction` shape, so there is one ingestion path.
- **Raw data is kept** per transaction version as JSONB (TXN-03).
- **The ingestion engine** is pure functions. The PRD's must-behave examples are its test suite.
- **Bank profiles are configuration.** What SPIKE-01 is still to find out (Appendix B gates G5–G11, G13 and G14) lives as per-bank settings. The conservative defaults in Appendix B ship first.
- **Secrets.** Enable Banking private keys are encrypted with AES-256-GCM. Each data key is wrapped by a key-encryption key held in a Kubernetes Secret, outside the database and its backups, so a backup alone can't fetch bank data (NFR-02).

### 5.10 Categorisation and the future ML service

- **Precedence (CAT-05)** is a chain of `CategorySource`s: Manual > Rule > Recurring > Transfer > Learned > Bank. In v1 the Learned source is CAT-10's pattern learner, running in the worker.
- **The ML service (Later):** a Python FastAPI service behind the same `CategorySuggester` port, with a batched `/predict` endpoint. The model file lives in object storage and a Kubernetes CronJob retrains it from a training view. A NetworkPolicy makes it reachable only from the worker. No hosted ML or LLM APIs (NFR-03).

## 6. Frontend

- **TanStack Start with server-side rendering.** Loaders call `api` inside the cluster and forward the cookie; in the browser the same calls go to `/api` on the same origin. Start's server functions are not used, so all logic stays in `api`. SPA mode is the fallback if SSR causes trouble.
- **Data and forms:** TanStack Query with the generated client from `packages/api-client`; TanStack Form with zod.
- **UI:** shadcn/ui and Tailwind. Charts are shadcn charts, and each has a table equivalent (NFR-08). Fonts are self-hosted; nothing is loaded from another origin (NFR-03).
- **One `<Figure>` component** renders `{ value, markers }`: the number with its markers as text and icon, never colour alone (INS-01, NFR-08).
- **i18n:** Lingui with ICU messages (Polish plurals included) and a pseudo-locale to catch untranslated text (NFR-13). Numbers, money and dates are formatted with `Intl`.
- **Text from banks is only ever text.** `dangerouslySetInnerHTML` is banned by lint. A strict Content Security Policy uses nonces, and `connect-src` allows only `'self'` and the Faro collector (NFR-01).

## 7. Identity, sessions and security

- **Our own `identity` module.** No identity provider: sign-in is too small and too specific to justify one.
  - Email link and code (AUTH-16): a confirm button before sign-in, 15-minute expiry, at most 5 emails an hour, and the same response for unknown addresses.
  - Server-side sessions in PostgreSQL. The browser holds an opaque ID in a `__Host-` cookie that is HttpOnly, Secure and SameSite=Lax. Idle and absolute timeouts and remembered devices (AUTH-07).
  - Session list and sign out everywhere (AUTH-08). Throttling without permanent lockout (AUTH-09). A `reauthenticated_at` time drives re-authentication (AUTH-10).
  - Optional 2FA with TOTP (otplib) and hashed recovery codes.
  - CSRF protection: SameSite cookies plus an `Origin` check on every state-changing request.
- **Email:** OCI Email Delivery is preferred, since it adds no new outside party beyond the hosting provider (open question in §13).
- **Audit log (NFR-04, NFR-11):** an `audit` schema the app's database role can only INSERT into and SELECT from. A separate role runs retention and pseudonymisation.
- **Logs:** pino with redaction and an allow-list of fields. Logs never contain amounts, descriptions, counterparties, account numbers, sign-in links or codes (NFR-02).

## 8. Data, encryption and backups

- **A dedicated CloudNativePG cluster** (PostgreSQL 18), not shared with other apps. No role has `pg_read_all_data`; monitoring gets `pg_monitor` at most. Encryption at rest doesn't stop a role that can query, so access is limited instead.
- **Encryption at rest:** OCI block-volume encryption, optionally with a customer-managed key in OCI Vault. Backups go to encrypted OCI Object Storage in another region.
- **Backups (NFR-12)** use the CloudNativePG Barman Cloud plugin:
  - continuous WAL archiving plus a daily base backup, kept 30 days, so point-in-time recovery sits well inside the 24-hour recovery point;
  - "First history backed up" means the WAL containing the first import's commit has been archived (`pg_stat_archiver`). **Prove in the walking skeleton** that this is enough, or take an on-demand backup instead;
  - "Last successful backup" and the 48-hour warning come from the archiver and base-backup ages.
- **Access journal (NFR-12).** Every access-reducing event is written to a journal table in the same transaction as the change, then copied by a sweep to an object-storage bucket with a retention lock. After a restore the operator replays it with a CLI command, which re-applies each event and ends every session before sign-in reopens.
- **Money and dates.** Amounts are `bigint` in the currency's smallest unit with a currency code, wrapped in a `Money` value object (NFR-05 "Totals add up"). Budget dates are `date`, instants are `timestamptz`. Household-time-zone logic uses Temporal (with a polyfill if the runtime lacks it).

## 9. Deployment

- **Kubernetes manifests** in `deploy/` with kustomize:
  - `web`, `api` and `worker` Deployments;
  - one Ingress host, `/api` to `api` and everything else to `web`, with cert-manager TLS;
  - the `budget-pg` CloudNativePG Cluster and its ScheduledBackup;
  - a Redis StatefulSet with append-only persistence on a volume;
  - NetworkPolicies: only the worker may reach Enable Banking and the email service; only `api` and `worker` may reach PostgreSQL and Redis.
- **Delivery:** an ArgoCD Application watches `deploy/`. GitHub Actions builds images to ghcr.io and commits the new image tag back with `[skip ci]`. MikroORM migrations run as an ArgoCD PreSync hook Job.
- **Secrets** (the key-encryption key, database credentials, the email key) are created outside the repo or committed only in encrypted form (SOPS or Sealed Secrets). Never in plain text.

## 10. Observability

**Not switched on until NFR-03 is amended (§14).** Until then, nothing is sent to Grafana Cloud.

- **Backend:** OpenTelemetry to the cluster's collector, then Grafana Cloud. Span attributes are allow-listed. No request bodies, no query strings, parameterised SQL only.
- **Browser:** Grafana Faro, bundled from npm, limited to errors and web vitals. `beforeSend` strips query strings and IDs from URLs and replaces message text that could contain bank data. No console capture, user identity, session replay, action tracking or persistent session.
- **The NFR-02 log check extends to Grafana Cloud:** after running the main journeys with known test values, a search there finds none of them.

## 11. Delivery plan

1. **M0:** SPIKE-01 runs outside the app. Raw bank data never enters the repo (Appendix B, Data handling). Its findings fill in the bank profiles.
2. **M1 walking skeleton:** monorepo, CI, ArgoCD deploy, CloudNativePG with backups, Redis; command, query and event plumbing (after-commit publishing, sweeps); identity, household, audit, settings, i18n and `<Figure>`. It must prove:
   - email-code sign-in end to end on the cluster;
   - command → after-commit job → handler;
   - killing the worker between commit and enqueue, after which the sweep picks the work up;
   - two browsers editing one item get the 409 flow (NFR-05);
   - a restore rehearsal: point-in-time restore, Redis wiped, access journal replayed (NFR-12);
   - the NFR-01 script-injection test text renders as plain text;
   - NFR-07 timings for computed-on-request reads against 25,000 seeded transactions;
   - the Grafana Cloud search for seeded test values finds nothing (NFR-02, NFR-03).
3. **M1 bank data:** the Enable Banking adapter, sync scheduling, the ingestion engine with the PRD's tests, CSV import, accounts, export, Recently deleted. Parts marked `Depends on: SPIKE-01` follow the spike's findings.
4. **M2:** categorisation, budgeting, recurring items, dashboard, recap, Settle.
5. **M3:** forecast, net worth, insights.
6. **Later:** the categoriser service, the MCP adapter.

## 12. Decision log

| Option | Decision and reason | Revisit when |
|---|---|---|
| GraphQL | Rejected. Doesn't serve MCP, lets clients drop markers, adds security work, and no client needs free-form selection | Third-party clients appear |
| `@nestjs/workflows` | Rejected for now. It would cover durable events and long processes, but it was at 0.0.x, and the app has few long processes | It reaches a stable release |
| Transactional outbox | Not needed. Without stored projections, publishing after commit plus sweeps covers every consumer | A consumer appears whose missed work can't be found from the data |
| Stored projections, separate read database | Not needed. At 25,000 transactions computing on request is fast enough, and it keeps one rulebook | A query misses its NFR-07 target after SQL and caching |
| Event sourcing | Rejected. Conflicts with erasure (HH-08); explicit history tables cover what the PRD asks | — |
| Drizzle | Considered for its `@nestjs/workflows` support; dropped with workflows. MikroORM's unit of work and version checks suit the aggregates | — |
| Microservices, Kafka or NATS, Nest sagas, presenter layers, PWA | Rejected as more than one household needs. PWA is out of scope in the PRD | — |

## 13. Open questions

None of these block M1's walking skeleton.

- **MCP is a PRD change when it's scheduled.** It is effectively "AI Q&A", which the PRD lists as Later. A hosted LLM client would be a new outside party (NFR-03), and the NFR-01 notes assume there is no public API.
- **Exchange-rate source** (PRD open question on ECB or NBP). Fetching public rates sends no household data, so it probably needs no NFR-03 change. Confirm when the source is chosen.
- **Faro's session tracking.** If it can't be switched off completely, send errors only or drop Faro.
- **Email provider:** OCI Email Delivery or another EU provider.
- **Event publisher edge cases, to test in the walking skeleton:** whether a bare `em.flush()` outside `em.transactional()` fires the transaction hooks, and whether nested transactions (savepoints) fire `afterTransactionCommit` before the outer commit. The publisher must send only on the outermost commit.

## 14. PRD changes this design needs

Per "PRD first", these PRD edits come before the work that depends on them:

- **NFR-03:** add Grafana Cloud as a receiver of scrubbed diagnostic data only (errors, traces, metrics and web vitals, with no household data), and allow the Faro script bundled with the app. Today NFR-03 rules out "tracking" and says "Metrics are computed in-app". Extend the NFR-02 log-search check to Grafana Cloud.
- **Later, for MCP:** see §13.
