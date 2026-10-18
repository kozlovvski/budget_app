# Design

## Context

See proposal.md for why. Current state, from the `setup-monorepo` change:
- `apps/web` is TanStack Start on Vite 8. `vite.config.ts` loads `tanstackStart()` and proxies `/api` to `localhost:3001` in dev.
  - `src/router.tsx` exports `getRouter()` (Start's required entry), which creates a `QueryClient` per router and calls `setupRouterSsrQueryIntegration`.
  - `src/routes/__root.tsx` renders the whole HTML document with `HeadContent` and `Scripts`.
  - The committed `src/routeTree.gen.ts` declares Start's `Register` with `ssr: true`.
  - The build writes `dist/client` and `dist/server/server.js`; there is no `start` script.
- `src/routes/index.tsx` loads the health query in its loader with `ensureQueryData` and reads it with `useSuspenseQuery`. Nothing in it is specific to Start.
- `packages/api-client/src/fetcher.ts` prefixes `process.env.API_URL` (default `http://localhost:3001`) when `window` is undefined, and uses the same origin in the browser. `@types/node` and `types: ["node"]` exist in that package only for this.
- Work in flight on other branches that touches the same files:
  - 6331a79 (PR #1 review) adds `shouldRetry` to `fetcher.ts`. In the browser it retries network errors and 5xx; when `window` is undefined it never retries. It also wires `shouldRetry` into `router.tsx`.
  - `chore/coverage-gate` fails `pnpm test` below 80 % coverage in `@budget/api-client`.
- The user's own cluster already serves a Vite SPA this way (`../argo-demo-vite-react`): unprivileged nginx, `/assets/` cached as immutable, `index.html` with `no-cache`, and `try_files $uri $uri/ /index.html`.

## Goals / Non-Goals

**Goals:**
- `pnpm build` for `@budget/web` produces only static files, which any static file server can serve.
- Route files, the generated client and the TanStack Query pattern (loader `ensureQueryData` plus `useSuspenseQuery`) stay as they are, so later screens are written the same way.
- `docs/architecture.md` and `AGENTS.md` describe the static SPA, including how it is served and the CSP that results.

**Non-Goals:**
- No Dockerfile, nginx config or manifests. The deploy change builds them from the §9 description written here.
- No per-route titles, pending components or not-found screens. Screens add them when they need them; TanStack Router supports `head` and `<HeadContent />` in a SPA.
- No prerendering of any route.

## Decisions

### Plain TanStack Router, not Start's SPA mode
Remove TanStack Start and use `@tanstack/router-plugin/vite` (`tanstackRouter({ target: 'react', autoCodeSplitting: true })`, placed before `viteReact()`), with a standard Vite `index.html` and `src/main.tsx`. Start is built on Router, so `createFileRoute`, loaders, router context and file-based route generation stay the same. `autoCodeSplitting` keeps one chunk per route, as Start did, which keeps the first load small (NFR-07).

*Alternative:* Start with `spa: { enabled: true }`, the fallback architecture §6 named. Rejected because it still builds a server bundle and keeps server functions and server routes. It also needs rewrites that allow-list `/_serverFn/*` around a `_shell.html`, all for a server the app won't run. Plain Router is the smaller, more common setup.

### Entry point and root route
- `apps/web/index.html` holds what `__root.tsx`'s `head` and document held: `lang="en"`, charset, viewport, `<title>Budget</title>`, `<div id="root">` and `<script type="module" src="/src/main.tsx">`.
- `src/main.tsx` imports `./styles.css` and creates one module-level `QueryClient`. With no server there are no requests to keep apart, so one client per tab is right. It then creates the router: `{ routeTree, context: { queryClient }, scrollRestoration: true, defaultPreloadStaleTime: 0, Wrap }`.
  - `Wrap` is a `QueryClientProvider`.
  - `defaultPreloadStaleTime: 0` lets Query own caching, as TanStack's Router + Query guide shows for client-only apps.
  - It declares `Register { router: typeof router }` and renders `<StrictMode><RouterProvider router={router} /></StrictMode>` into `#root`.
- `src/router.tsx` is deleted. `getRouter` existed only because Start requires it. If `shouldRetry` has landed, its `retry` default moves into `main.tsx`'s `QueryClient`.
- `__root.tsx` keeps `createRootRouteWithContext<{ queryClient: QueryClient }>()` and renders `<Outlet />`. `head`, `HeadContent`, `Scripts` and the `styles.css?url` link go away.
- The plugin regenerates `routeTree.gen.ts` without Start's module declaration. It stays committed, as before.

### Fetcher: same origin only
`fetcher` calls `fetch(url, init)` with the URL as orval generates it (`/api/...`). `baseUrl`, `API_URL` and the server default go away. `@types/node` and `types: ["node"]` leave `packages/api-client` if typecheck passes without them. The spec loses the two server cases and keeps a same-origin case and the 4xx/5xx cases.

If `shouldRetry` is present when this is applied, its `typeof window !== 'undefined'` check is dead code, so drop it along with the "server: no retries" assertion. Its other rules (network errors and 5xx, at most three tries) stay.

### Dev and local preview
`vite dev` is unchanged: port 3000 and the `/api` proxy. `vite preview` serves the built `dist/` with an `index.html` fallback, and its proxy defaults to `server.proxy`, so the built app can be checked locally against the api with no new script or config.

### Serving in production (recorded now, built in the deploy change)
The `web` Deployment is `nginxinc/nginx-unprivileged` with the built `dist/`, following `../argo-demo-vite-react`:
- `/assets/*` gets `Cache-Control: public, max-age=31536000, immutable` and `try_files $uri =404`, so a missing chunk is a real 404 and never `index.html` served as JavaScript.
- Every other path gets `Cache-Control: no-cache` and `try_files $uri $uri/ /index.html`, so deep links and refreshes reach the router.
- nginx sends the security headers, CSP included.

The Ingress is unchanged: `/api` goes to `api` and everything else to `web`. `web` makes no outbound calls, so its NetworkPolicy allows ingress from the ingress controller only.

*Alternatives:*
- `api` serves the files with `@nestjs/serve-static`. Rejected because it would tie web releases to the api image and put static traffic and the SPA fallback in the api process.
- Object storage behind a CDN. Rejected because it adds an outside party (NFR-03) and a second origin.

### CSP without nonces
Nonces need an HTML response rendered per request, and a static `index.html` has none. Vite's build references its entry with `<script type="module" src>` and emits no inline scripts, so the policy is `script-src 'self'` and `style-src 'self'`. `connect-src` stays `'self'` plus the Faro collector (§6, NFR-01). nginx sends the policy as a header, not a `<meta>` tag, because `frame-ancestors` only works in a header. This change only updates §6's wording. The deploy change writes the header and checks the browser console for violations.

### Static files are public; data is not
Anyone can fetch the shell and bundles, as with any SPA. They contain code only. Every household figure comes from `api`, which checks the `__Host-` session cookie the browser sends on same-origin `/api` calls. Route guards (the identity change) run in `beforeLoad` against a session endpoint and redirect to sign-in, but they only affect UX. The api's checks are the security boundary (§5.4).

## Risks / Trade-offs

- [NFR-07: with no server-rendered HTML, the dashboard number waits for the JavaScript, then one API call] → Per-route code splitting; immutable assets, so a repeat visit (the 2.0 s case) revalidates only `index.html`. The first-visit 4.0 s case needs a small entry bundle. The walking skeleton already measures NFR-07 timings (§11), and the §12 row names a missed target as the reason to revisit.
- [A user with a tab open across a deploy asks for a route chunk that no longer exists] → The 404 surfaces as a failed navigation, and a reload fixes it. That is acceptable for one household. Handle Vite's `vite:preloadError` with a reload only if it happens in practice.
- [A later library or Vite option adds an inline script, which `script-src 'self'` blocks] → The apply task checks that `dist/index.html` has no inline script. The deploy change checks the console for CSP violations.
- [The base branch moves under this change: the skeleton is still in review in PR #1, and 6331a79 and the coverage gate touch the same files] → Rebase onto the skeleton's branch before applying. The fetcher task is written to work whether or not `shouldRetry` has landed. Removed code lowers covered and total lines alike, so the 80 % gate holds.

## Migration Plan

Nothing is deployed, so there is no rollout or data migration. Rollback is a git revert. The `setup-monorepo` artifacts stay as they are, as the record of what that change built.
