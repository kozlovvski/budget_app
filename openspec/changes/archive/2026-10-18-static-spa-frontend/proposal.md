# Proposal

## Why

Architecture §2 and §6 chose TanStack Start with server-side rendering, with SPA mode named as the fallback. The household lead has decided against SSR: the web app will be a fully static single-page app. The app sits behind sign-in, so SSR gains nothing for search engines. It would also add a Node process to run, secure and observe, along with cookie forwarding from loaders, hydration and per-request CSP nonces, all for one household. Changing now is cheapest, because `apps/web` is still one page.

## What Changes

- **BREAKING (dev and build only):** `apps/web` stops being a TanStack Start app. It becomes a Vite app with TanStack Router's file-based routing, and its build is static files only: `dist/index.html` and hashed `dist/assets/*`. There is no server bundle.
  - `@tanstack/react-start` and `@tanstack/react-router-ssr-query` are removed, and `@tanstack/router-plugin` is added.
  - File-based routes, the router context with TanStack Query, Tailwind and shadcn/ui all stay.
  - The index route still shows the api's health through the generated client, now fetched only by the browser from same-origin `/api`.
- `packages/api-client`: the fetcher loses its server branch and the `API_URL` setting, so every call is a same-origin relative URL. If `shouldRetry` has landed from PR #1, its "no retries on the server" check goes too.
- Leftover `.output` entries from Start's old build output are removed from `turbo.json`, `.gitignore` and `.dependency-cruiser.cjs`.
- `docs/architecture.md` records the decision:
  - §1, §2 and §6: a static SPA. The CSP drops nonces for `script-src 'self'`, sent as a header by the static server.
  - §3 and §9: `web` serves static files from unprivileged nginx and never calls `api`.
  - §4: the layout line for `apps/web`.
  - §12: a decision-log row.
- `AGENTS.md` gets its stack line updated.

**Not in this change:** the Dockerfile, the nginx config and `deploy/`. They belong to the deploy change, which follows the pattern recorded in architecture §9. No PRD change is needed, because the PRD names no technology.

## Capabilities

### New Capabilities

None. This change swaps the frontend's rendering model and adds no product behaviour, so it sets `skip_specs: true`.

### Modified Capabilities

None. `openspec/specs/` is empty.

## Impact

- **Code:** in `apps/web`, `package.json`, `vite.config.ts`, a new `index.html` and `src/main.tsx`, `src/router.tsx` (folded into `main.tsx`), `src/routes/__root.tsx` and the regenerated `src/routeTree.gen.ts`. Also `packages/api-client/src/fetcher.ts` and its spec, `turbo.json`, `.gitignore`, `.dependency-cruiser.cjs` and `pnpm-lock.yaml`.
- **Docs:** `docs/architecture.md` §1, §2, §3, §4, §6, §9 and §12; `AGENTS.md`.
- **Dependencies:** two removed and one added, all TanStack packages, with no new outside party (NFR-03).
- **NFR-07:** without SSR, the first paint waits for the JavaScript and then one API call. Dashboard timings are already a walking-skeleton measurement (architecture §11), and they now measure this path.
- **`setup-monorepo`:** this supersedes that change's SSR parts and closes its open question on forwarding cookies from SSR loaders. Its artifacts are left as the record of what was done.
