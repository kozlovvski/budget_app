# Proposal

## Why

The repo has requirements and an agreed design but no code. Every M1 change (the walking skeleton in `docs/architecture.md` §11, then bank data) needs the workspace that §4 describes: one place to install, build, lint, type-check and test the web app, the api and the generated client. Setting it up once, on its own, keeps later changes about behaviour rather than tooling.

## What Changes

- A pnpm workspace driven by Turborepo at the repo root, with the layout from architecture §4:
  - `apps/web`: TanStack Start (SSR) with Tailwind and shadcn/ui initialised, TanStack Query wired into the router, and one page that shows the api's health through the generated client.
  - `apps/api`: NestJS with the three entrypoints and their root modules: `main.ts` (HTTP under `/api`, one `GET /api/health` route), `main.worker.ts` (an application context with nothing to run yet) and `main.cli.ts` (nest-commander, with one command that writes the OpenAPI document). It starts from Nest's official starter and uses Nest's own packages wherever one fits: `@nestjs/terminus` for health, `@nestjs/config` for settings, and the `@nestjs/swagger` CLI plugin for schemas. Custom code is written only when Nest has nothing suitable.
  - `packages/api-client`: an orval-generated typed fetch client, TanStack Query hooks and zod schemas, built from the api's OpenAPI document. Generated code is not committed.
- Shared tooling at the root: one base TypeScript config, oxlint (with `react/no-danger`, architecture §6) and oxfmt, Vitest, and dependency-cruiser with the boundary rules architecture §5.1 states.
- A GitHub Actions workflow that runs lint, format check, dependency rules, type-check, tests and build on pull requests and pushes to `main`. This adds a file only; there is no GitHub remote yet and none is created.
- `docs/architecture.md` §4 records the tooling choices made here (Node 24, pnpm, TypeScript 6, oxlint and oxfmt, Vitest), and §5.1 gains a "Nest first" rule. `AGENTS.md` gets its status line and the everyday commands updated.

**Not in this change:** Dockerfiles, image builds, `deploy/`, ArgoCD, CloudNativePG, Redis, MikroORM, BullMQ, the command/query/event plumbing, sessions, i18n, Faro, CSP and `<Figure>`. Those are later walking-skeleton changes.

## Capabilities

### New Capabilities

None. This change sets up tooling and adds no product behaviour, so it sets `skip_specs: true`. The health route is an operational check, not a PRD requirement.

### Modified Capabilities

None.

## Impact

- **New code:** `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `tsconfig.base.json`, lint, format and dependency-cruiser configs, `.gitignore`, `apps/web`, `apps/api`, `packages/api-client`, `.github/workflows/ci.yml`.
- **Docs:** `docs/architecture.md` §4 and §5.1, `AGENTS.md`.
- **Dependencies:** first install of the stack's packages. No hosted services: no Turborepo remote cache, no outside fonts or scripts in the web app (NFR-03).
- **Later changes** build on the root-module-per-entrypoint layout (architecture §5.3), the client generation pipeline and the CI workflow.
