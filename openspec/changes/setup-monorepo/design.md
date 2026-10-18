# Design

## Context

The repo holds only `docs/`, `openspec/` and agent config. `docs/architecture.md` fixes the stack (§2) and the layout (§4, §5.3) but leaves workspace tooling open. Choices taken with the user for this change:
- oxlint and oxfmt for linting and formatting;
- Vitest everywhere, without unplugin-swc unless it proves necessary;
- in the api, Nest's own tools and packages before any custom code;
- `apps/api` starts from the `nestjs/typescript-starter` repo.

Versions checked on the registry on 2026-10-18 that constrain the design:
- `@nestjs/cli` 12 depends on `typescript ~6.0.2`, and `@nestjs/swagger` 12 accepts `^5.5 || ^6`. TypeScript 7 is out, but Nest doesn't support it yet.
- `@tanstack/react-start` needs Node ≥ 22.12 and Vite ≥ 8. MikroORM 7 needs Node ≥ 22.17.
- Nest has two official starting points, and they differ:
  - the `nestjs/typescript-starter` repo: ESM (`"type": "module"`, `nodenext`), Vitest with no SWC plugin, and oxlint;
  - `nest new` from `@nestjs/schematics` 12.0.7: ESM, but Jest, `oxlint --type-aware` and Prettier.

  Both include `@nestjs/mau`.
- oxfmt is at 0.73, which is pre-1.0.

## Goals / Non-Goals

**Goals:**
- `pnpm install && pnpm build` works from a clean clone, as do `pnpm dev`, `pnpm test`, `pnpm typecheck` and `pnpm lint`.
- The web → generated client → api path works end to end in SSR and in the browser, so the first real endpoint only needs a controller.
- The layout and naming rules in architecture §5.3 hold from the first file.

**Non-Goals:**
- No shared config packages (`packages/tsconfig`, `packages/eslint-config`). Architecture §4 says a package is created only when two apps share something, and root-level config files cover what is shared.
- No tests in `apps/web` yet. Vitest is added there with the first component that has logic, which will probably be `<Figure>`.
- No Swagger UI. The API isn't public (NFR-01 notes), and the document is only an input to code generation.
- No cookie forwarding from SSR loaders yet, because sessions don't exist. The fetcher is where it will go (see Open Questions).

## Decisions

### Runtime and package manager
Use Node 24 LTS, set in `.nvmrc` and in `engines`. Pin pnpm with the root `packageManager` field; pnpm switches to that version by itself and CI reads it. Pin `typescript` at `~6.0` across the workspace, because Nest's CLI and swagger allow nothing newer. pnpm 10 and later block dependency build scripts by default, so `pnpm-workspace.yaml` allow-lists only the packages that fail without them.
*Alternatives:* Node 26 doesn't become LTS until late October 2026. TypeScript 7 waits for Nest.

### Config at the root, not in packages
`tsconfig.base.json` sits at the root and each workspace extends it, adding only what differs: the api needs decorators and `nodenext`, and the web app needs `jsx` and `bundler` resolution. oxlint (`.oxlintrc.json`), oxfmt (`.oxfmtrc.json`) and dependency-cruiser (`.dependency-cruiser.cjs`) each run once over the whole repo.

### Turborepo tasks
| Task | Depends on | Outputs | Notes |
|---|---|---|---|
| `build` | `^build`, `^generate` | `dist/**`, `.output/**` | |
| `typecheck` | `^generate`, `generate` | none | `tsc --noEmit` |
| `test` | `^generate`, `generate` | none | `vitest run` (unit specs) |
| `test:e2e` (api) | none | none | `vitest run --config vitest.config.e2e.ts` |
| `dev` | `^generate` | none | persistent, not cached |
| `dev` (api) | `openapi` | none | waits so `nest start --watch` does not empty `dist/` while the export reads it |
| `openapi` (api) | `build` | `openapi.json` | runs the CLI command |
| `generate` (api-client) | `^openapi` | `src/generated/**` | runs orval |

`@budget/api-client` lists `@budget/api` as a `workspace:*` devDependency. That one edge is how `^openapi` finds the api; nothing imports it. `typecheck` and `test` also depend on the package's own `generate`, because `@budget/api-client` checks and tests its own generated code. Linting stays outside Turborepo: root `pnpm lint` runs `oxlint && oxfmt --check && depcruise`. These tools take seconds over the whole repo, so per-package caching would add config and save nothing.
*Alternative:* commit `openapi.json` and the generated client so API changes show in review. Rejected for now because it needs a drift check in CI; this can be revisited if reviewing API changes becomes painful.

### Nest first in `apps/api`
**Rule.** Before writing code in the api, look in this order:
1. the Nest CLI and schematics;
2. official `@nestjs/*` packages;
3. libraries the Nest docs recommend (nest-commander, `@mikro-orm/nestjs`).

Write custom code only when none of these fits. Keep what Nest generates unless it conflicts with an agreed decision, and say so here when it does.

**Applied in this change:**
- **Starting point:** `nestjs/typescript-starter`, copying its files but not its git history. It is ESM with `nodenext`, `experimentalDecorators` and `emitDecoratorMetadata`, and already uses Vitest and oxlint. Remove only:
  - `@nestjs/mau`, a hosted deploy service;
  - `@nestjs/observe`, which is unvetted against NFR-03;
  - Prettier, because oxfmt formats;
  - the sample `app.controller` and `app.service`;
  - its own lint config, because the root config applies.

  Keep `@nestjs/cli` and `@nestjs/schematics` so `nest g` works.
- **Build and run:** with the Nest CLI only. `nest build` (tsc), `nest start --watch`, and `--entryFile main.worker` or `--entryFile main.cli` for the other entrypoints; no custom runner scripts.
- **Health:** `@nestjs/terminus` (`HealthCheckService`, `@HealthCheck()`). It shapes the response, documents the route for OpenAPI, and takes Postgres and Redis checks later.
- **Settings:** `@nestjs/config` (`ConfigModule.forRoot({ isGlobal: true })`) for `PORT` now, and the database and Redis settings later.
- **OpenAPI:** `@nestjs/swagger` with its CLI plugin in `nest-cli.json`, so schemas come from TypeScript types and not from hand-written `@ApiProperty` decorators.
- **Tests:** `@nestjs/testing` with the starter's layout. Unit `*.spec.ts` files sit beside the code; end-to-end tests sit in `test/*.e2e-spec.ts` under `vitest.config.e2e.ts`.
- **Logging and shutdown:** Nest's `Logger` and `enableShutdownHooks()`. The observability change swaps the logger for pino (§7).

**Where an agreed decision wins over a Nest default:**
- Nest's monorepo mode (`nest g app`, `nest g lib`) isn't used. Turborepo owns the workspace, and §5.3 is one Nest project with three entrypoints.
- File names follow §5.3's adapter suffixes (`.http.controller.ts`, `.jobs.ts`, `.cli.ts`), not the schematic defaults. Nest's `.command.ts` for CLI commands would clash with CQRS command files. Generate code with `nest g`, then rename it.
- oxfmt formats instead of Prettier, and Vitest runs the tests instead of Jest (the user's choices).

**Later changes follow the same rule.** The expected picks:
- `@nestjs/cqrs` (already chosen);
- `@nestjs/bullmq`;
- `@mikro-orm/nestjs`;
- `ValidationPipe` with class-validator for request bodies;
- terminus checks for Postgres and Redis.

**Root modules, one per entrypoint (§5.3):**
- `app.module.ts` for `main.ts`, the HTTP app. It sets the global prefix `api` (the ingress sends `/api/*` without rewriting, §3) and listens on `PORT` (default 3001). It holds `health.http.controller.ts`, which answers `GET /api/health` through terminus with no checks yet.
- `worker.module.ts` for `main.worker.ts`, a `createApplicationContext` with shutdown hooks. BullMQ arrives with the event plumbing.
- `cli.module.ts` for `main.cli.ts`, run by nest-commander's `CommandFactory`. Its one command, `openapi`, builds the document from `AppModule` with `SwaggerModule.createDocument` and writes `openapi.json`.

*Alternative:* a separate export script. Rejected because it would be a fourth entrypoint, and a CLI with a real command also proves that entrypoint works.

### `packages/api-client`: generated source package
A "just-in-time" internal package: `exports` points at TypeScript source, and the consumer's bundler compiles it, so there is no build step. Orval (`orval.config.ts`) has two outputs:
- `react-query` with fetch: typed functions, query options and hooks;
- `zod`: schemas for TanStack Form later (§6).

A hand-written mutator, `src/fetcher.ts`, picks the base URL. On the server (`typeof window === "undefined"`) it uses `process.env.API_URL`, defaulting to `http://localhost:3001`. In the browser it uses the same origin. On a 4xx or 5xx it throws an `Error` with `status` and the parsed body as `info`, the shape orval's own fetch client uses, so TanStack Query enters its error state; `forceSuccessResponse` narrows the generated return types to match. The same file exports `shouldRetry`, the web app's `QueryClient` retry policy: in the browser it retries network errors and 5xx up to three times, never a 4xx; the server keeps TanStack's default of no retries. These are the only non-generated logic, and they get Vitest tests.

### `apps/web`: TanStack Start with Query and shadcn
- TanStack Start on Vite 8 with Tailwind v4 (`@tailwindcss/vite`). Run `shadcn init` (`components.json`, `cn` utility, theme tokens) without adding any components.
- `QueryClient` lives in the router context through `@tanstack/react-router-ssr-query`. The index route's loader calls `ensureQueryData` with the generated health query options, and the component reads them with `useSuspenseQuery`. That proves the SSR fetch, dehydration and the browser fetch in one page.
- In dev, Vite proxies `/api` to `localhost:3001`, matching production's single origin (§3). The web app serves on port 3000.
- Fonts are self-hosted or the system stack. No request leaves the origin (NFR-03); anything the templates add from other hosts is removed.

### Vitest without unplugin-swc
`nestjs/typescript-starter` runs Vitest with no SWC plugin, relying on Vite 8's Oxc transform to emit decorator metadata from the tsconfig. The api gets one spec in which a provider is injected **by type** through `Test.createTestingModule`. If metadata isn't emitted, that spec fails, so we find out now and not in the first handler test. The fallback is `unplugin-swc`, added to the api's Vitest config only.

### oxlint and oxfmt
oxlint uses the `typescript`, `react`, `import` and `oxc` plugins, with `react/no-danger` as an error (§6: bank text is only ever text, NFR-01). Type-aware rules are on (`--type-aware` with `oxlint-tsgolint`), as `nest new` sets them up. They catch promises that are never awaited, which `typecheck` doesn't. oxfmt is pinned to an exact version because it is pre-1.0. It formats code and config only. Markdown, `openspec/`, `.claude/` and generated code are ignored, because reformatting would realign every table in the PRD and architecture doc.

### dependency-cruiser rules
Only rules that architecture §5.1 and §4 state outright:
- `no-circular` across the repo.
- **Framework-free domain:** `apps/api/src/modules/*/domain/**` imports nothing from `@nestjs/*`, `@mikro-orm/*`, `bullmq`, or its module's `application/` or `infrastructure/`.
- **Dependency rule:** `application/**` doesn't import `infrastructure/**`.
- **Module boundaries:** a module doesn't import another module's `infrastructure/**`, so it can't reach another module's tables. Which other cross-module imports are allowed (command and query classes, event types) is decided with the first two modules.
- **Web stays thin:** `apps/web` imports nothing from `apps/api`; it goes through `@budget/api-client`.

With no modules yet, the module rules match nothing. A task checks each rule against a throwaway violating file before relying on it.

### CI
`.github/workflows/ci.yml` runs on `pull_request` and on `push` to `main` in one job: checkout, `pnpm/action-setup`, `actions/setup-node` with the pnpm cache, `pnpm install --frozen-lockfile`, `pnpm lint`, then `pnpm turbo run typecheck test test:e2e build`. There is no Turborepo remote cache, since that would add a hosted service and the build is small. Concurrency cancels superseded runs on the same ref.

## Risks / Trade-offs

- [Once MikroORM lands, booting `AppModule` for the OpenAPI export may open a database connection that CI lacks] → The plumbing change must keep `pnpm openapi` working with no database, for example with MikroORM's `connect: false` for the export or Nest's preview mode. Its tasks need to say so.
- [Vite's Oxc transform may not emit decorator metadata the way tsc does] → The by-type injection spec catches it; fall back to `unplugin-swc`.
- [oxfmt is pre-1.0, so output may shift between versions] → Pin the exact version. Because oxfmt targets Prettier's output, Prettier is a low-cost way out.
- [dependency-cruiser must resolve ESM `.js` specifiers to `.ts` files] → Point it at the workspace tsconfigs and check with the throwaway violation.
- [Generated code is not committed, so a fresh `pnpm dev` first builds the api and generates the client] → Turborepo caches both, so only the first run pays.
- [The Nest starter and `shadcn init` move fast, so their output may differ from this design] → Keep what they generate and remove only what conflicts with a decision here. Record each removal in the task that makes it.
- [The swagger CLI plugin runs only in `nest build`, not under Vitest] → Tests don't check the schema, and the OpenAPI export runs from `dist`.
- [`oxlint-tsgolint` runs TypeScript 7 internals against a TypeScript 6 project] → If it misreads the tsconfigs, turn `--type-aware` off and note it here.

## Migration Plan

None. This is the first code in the repo, and nothing is deployed.

## Open Questions

- **Cookie forwarding from SSR loaders:** the identity change will add it to `src/fetcher.ts`, probably by reading the incoming request's headers through TanStack Start's server utilities. It doesn't change this change's layout.
