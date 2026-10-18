# Tasks

## 1. Base and decision record

- [x] 1.1 Rebase `chore/static-spa-frontend` onto the branch that carries the monorepo skeleton and PR #1's review fixes (the skeleton is not on `main` yet). Verify that `git log` shows them below this change's commit, and that `pnpm install && pnpm build` passes before any code changes.
  - Done differently: PR #1 had merged by then, so the change was applied on `chore/remove-ssr`, cut from `main` with this proposal cherry-picked onto it. `shouldRetry` was present; the coverage gate was not.
- [x] 1.2 Update `docs/architecture.md` to the static SPA, following design.md:
  - §1, the NFR-07 row: per-route code splitting and long-cached assets replace "Server-side rendering".
  - §2, the Frontend row: a React SPA with TanStack Router (static files, no server-side rendering), TanStack Query and shadcn/ui.
  - §3: the diagram's browser and `web` lines, and the `web` process row. It serves the built files from nginx with `index.html` as the fallback, and has no logic, no api calls and no database access.
  - §4: the `apps/web` layout line.
  - §6: replace the first bullet (a static SPA calling same-origin `/api` with the session cookie). The CSP bullet becomes `script-src 'self'` sent as a header by the static server, with no nonces.
  - §9: the `web` Deployment is unprivileged nginx (immutable `/assets/`, `no-cache` `index.html`, SPA fallback, security headers). Its NetworkPolicy allows ingress from the ingress controller only.
  - §12: add a row rejecting SSR and Start's SPA mode, to revisit if NFR-07's first-visit target is missed after code splitting and caching.

  Verify that `grep -n -i -E "tanstack start|server-side render|ssr|nonce" docs/architecture.md` matches only the §2 "no server-side rendering" wording and the §12 row.
- [x] 1.3 Update `AGENTS.md`'s Technical design stack line to "React SPA with TanStack Router and shadcn/ui". Verify that `grep -n -i "start" AGENTS.md` no longer names TanStack Start.

## 2. `packages/api-client`: same origin only

- [x] 2.1 Make `src/fetcher.ts` call `fetch(url, init)` directly, removing `baseUrl`, `API_URL` and the server default and updating its header comment. If `shouldRetry` is present, drop its `typeof window` check and the comment line about the server. In `fetcher.spec.ts`, drop the two server cases and the server assertion in the `shouldRetry` test, and keep a case showing the URL is passed through unchanged. Verify that `pnpm --filter @budget/api-client test` passes (including the coverage gate if it has landed) and that `git grep -n API_URL` finds nothing.
- [x] 2.2 Remove `@types/node` from `packages/api-client/package.json` and `"types": ["node"]` from its tsconfig. Verify that `pnpm --filter @budget/api-client typecheck` passes. If it fails, put both back and note why here.

## 3. `apps/web`: TanStack Router SPA

- [x] 3.1 Swap `@tanstack/react-start` and `@tanstack/react-router-ssr-query` for `@tanstack/router-plugin` (a devDependency). In `vite.config.ts`, replace `tanstackStart()` with `tanstackRouter({ target: 'react', autoCodeSplitting: true })` placed before `viteReact()`, and update the plugin-order comment. Add `index.html` and `src/main.tsx`, delete `src/router.tsx`, and reduce `src/routes/__root.tsx` to `<Outlet />`, all as design.md "Entry point and root route" describes. If `shouldRetry` is present, set it as the `QueryClient`'s `retry` default. Let the plugin regenerate `src/routeTree.gen.ts`. Verify:
  - `pnpm turbo run build typecheck --filter @budget/web` passes;
  - `apps/web/dist` holds only `index.html` and `assets/`, with no `server/`;
  - `git grep -n -E "react-start|ssr-query|getRouter" -- apps packages` finds nothing.
- [x] 3.2 Remove the `.output` leftovers: the `build` outputs in `turbo.json`, the `.gitignore` line and the `.dependency-cruiser.cjs` exclude. Verify that `pnpm lint` passes and that a second `pnpm build` is a full Turborepo cache hit.
- [x] 3.3 Check that the build is CSP-ready: every `<script>` in `apps/web/dist/index.html` has a `src`, so no inline script would need a nonce or hash. Verify with `grep -o "<script[^>]*>" apps/web/dist/index.html`. If Vite emits an inline script, record which and how it was removed.
- [x] 3.4 Check the app in a browser (headless Chromium is fine, as in `setup-monorepo` 4.4).
  - With `pnpm dev`: `localhost:3000` shows "API status: ok", the console has no errors, and `curl -s localhost:3000/` returns the shell without the status, which proves there is no SSR.
  - With the api running and `pnpm --filter @budget/web exec vite preview --port 3000` on the build: the page shows the status, and loading `localhost:3000/no-such-page` directly returns `index.html` and renders the router's not-found.
  - Every request goes to `localhost:3000` (NFR-03).

## 4. Integration

- [x] 4.1 Run the CI steps from a clean state: `pnpm install --frozen-lockfile`, `pnpm lint`, then `pnpm turbo run typecheck test test:e2e build`. Verify that all pass, and that `pnpm turbo run build --dry` still orders `@budget/api#build` → `@budget/api#openapi` → `@budget/api-client#generate` → `@budget/web#build`.

## Workflow follow-up

- Commit on `chore/static-spa-frontend` and open its PR once the skeleton's PR #1 has merged, so the diff shows only this change.
- The Dockerfile, the nginx config (cache headers, SPA fallback, CSP and other security headers) and the `web` manifests come in the deploy change, following design.md "Serving in production".
- Archive the change after review. It sets `skip_specs: true`, so archiving syncs no specs.
