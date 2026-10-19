# SPIKE-01 tooling

Throwaway scripts for SPIKE-01 (`docs/PRD.md` Appendix B, issue #8). They run on the developer's machine and decide nothing about the product's technical design. One file, `eb.ts`: Node 24, no dependencies, plus `gpg`.

Findings go in `docs/research/spike-01-enable-banking.md`, anonymised by the Appendix B rules. Raw responses never go in the repo.

## Setup (once)

1. **Enable Banking applications.** In the Control Panel, create a sandbox application and a production application (restricted mode). For each, keep its private key outside the repo and note its application ID. Redirect URLs:
   - Sandbox: register `http://localhost:5173/bank-callback` (plain http is accepted for localhost). `connect` listens there and takes the code from the bank's redirect itself. Port 5173 must be free, so stop any Vite dev server first.
   - Production needs https on a real domain; use one you own, so the code only ever reaches you. Nothing needs to answer there: the page fails to load, and you copy the code from the address bar into `connect --code`.
2. **A gpg key for the raw history.** Fetches are encrypted to its public key, so unattended runs need no passphrase.
   ```sh
   gpg --quick-gen-key spike-01 default default never
   gpg --export-secret-keys --armor spike-01 > /mnt/<separate-drive>/spike-01-secret-key.asc
   ```
   Keep the exported key on the separate media and its passphrase in your password manager. Without both, the encrypted history can't be read.
3. **One env file per application**, outside the repo, for example `~/spike-01/prod.env`:
   ```sh
   EB_APP_ID=<application id>
   EB_KEY_PATH=/home/<you>/spike-01/prod.pem
   EB_REDIRECT_URL=http://localhost:5173/bank-callback
   SPIKE_GPG_KEY=spike-01                  # unset: fetches stay plain JSON, until the gpg key exists
   SPIKE_DIR=/home/<you>/spike-01          # sandbox: /home/<you>/spike-01-sandbox
   PSU_IP=<your public IP>                 # for --present; curl -s https://api.ipify.org
   ```
   Then `alias eb='node --env-file=$HOME/spike-01/prod.env <repo>/scripts/spike-01/eb.ts'` (and `eb-sandbox` for the sandbox file).

## Commands

| Command | What it does | Method step, item |
|---|---|---|
| `eb aspsps [--country PL] [--bank Erste]` | Lists banks. With `--bank`, the full entry, including the maximum consent length | 1, item 1 |
| `eb application` | Shows the application and its linked accounts | 3, item 17 |
| `eb connect --bank <name> [--country PL] [--days 180]` | Starts a consent and prints the bank's URL. With a localhost `EB_REDIRECT_URL`, waits for the redirect after you approve, creates the session, then fetches "longest" at once as a member-present request. With any other, stops there | 1, 2 |
| `eb connect --code '<address>'` | Production: run straight after approving, with the address the bank sent you to (the code expires within minutes). Creates the session and fetches "longest" | 2 |
| `eb fetch [--present] [--strategy default\|longest] [--session <id>] [--from YYYY-MM-DD]` | For each session (or the one named): session status, then details, balances and every transaction page per account. Unattended unless `--present`. Prints minutes since approval, every failed request and, per account, the count, statuses and oldest and newest date | 2, 5, 6 |
| `eb diff [<fileA> <fileB>]` | Changes between two fetches: `+` added, `-` gone, `~` changed fields, `=` identifier seen more than once. With no files, the newest two of each bank and strategy | 5, items 9–11, 15 |
| `eb fields <file>...` | Share of transactions with each field filled | item 6 |
| `eb close --session <id>` | Ends the session from the tooling | 7, item 21 |

Every request and its full response, errors included, is kept in `$SPIKE_DIR/raw/<time>_<bank>_<strategy>_<mode>.json.gpg`. `$SPIKE_DIR/state.json` holds only session IDs, approval times and Enable Banking's account UIDs. Read a fetch with `gpg -d <file> | jq`. Unit tests: `node --test scripts/spike-01/eb.test.ts`.

## Running the method

- **Step 1, sandbox.** `eb-sandbox aspsps --country FI` to find the mock bank, then `connect`, `fetch`, `fetch --strategy longest`. For the error cases: `close` a session and fetch again (revoked), connect with `--days 1` and fetch the next day (expired), and fetch repeatedly until it's refused (rate limit). Sandbox data is synthetic: no data-richness evidence.
- **Step 2, own banks.** For an account already linked in the Control Panel, `connect` creates a new app session on the existing link; the printed oldest date shows whether the full history still comes back. For each new bank: link it in the Control Panel and note the time (approval 1), then `connect` straight away (approval 2). Window probes, only on an account named as expendable: `fetch --present --strategy longest --session <id>` at about 5, 30, 60 and 90 minutes.
- **Step 5, observation.** Four unattended fetches a day, and a second copy after the last one. Use a checkout that will stay (the main checkout once this is merged, not a worktree):
  ```cron
  0 6,11,16,21 * * * /path/to/node --env-file=$HOME/spike-01/prod.env /path/to/repo/scripts/spike-01/eb.ts fetch >> $HOME/spike-01/cron.log 2>&1
  30 21 * * * rsync -a $HOME/spike-01/ /mnt/<separate-drive>/spike-01/
  ```
  On WSL, start cron (`sudo service cron start`) and keep a WSL terminal open: WSL stops when idle. If the machine can't stay on, fetch by hand at 4 set times and record that unattended limits were only partly tested. Review each day with `eb diff` (about 15 minutes).
- **Step 6, limits.** One deliberate 5th unattended `fetch --session <id>` at one bank in a day, then stop. Then `fetch --present` beyond 4 a day.
- **Step 7, revocation.** Revoke the consent in the bank's own app, then `fetch --session <id>`. Re-consent with `connect`, then `eb diff` compares the old and new "longest" fetches: the same transaction keys mean stable identifiers, and a changed `account` means a new account UID. Finally, `close --session <id>`, check the bank's own app, and `fetch --session <id>` with the old session.
- **Step 8, write-up.** `eb fields` on each bank's newest "longest" fetch, then fill in `docs/research/spike-01-enable-banking.md`. Anonymise every extract before it goes in the repo, and have a second read check it.

## Day 1, optional: email to Enable Banking

A draft for the developer to send from their own address (Appendix B, Prerequisites):

> **Subject:** Restricted mode: household use, joint accounts and linked-account limit
>
> Hello,
>
> I use an Enable Banking application in restricted mode for my own household's budgeting. Your terms say that restricted production use "is limited to Linked Accounts and is available solely for evaluation purposes or for the personal use of private individuals", that a user may not "make accessible to any third party" the Control Panel or the API, and that "the number of Linked Accounts per Application may be limited". Could you tell me:
>
> 1. Is it within "personal use of private individuals" for one member's registration, linking their own and joint accounts, to feed one cloud-hosted household app that both members of the household use?
> 2. Does the clause against making the API "accessible to any third party" apply to the other member of the household seeing the data?
> 3. What is the linked-account limit per application?
> 4. Can either holder link a joint account?
>
> Thank you,
> [name]
