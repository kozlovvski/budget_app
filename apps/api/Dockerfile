# One image for api, worker and CLI (architecture §9). Build from the repo root:
#   docker build -f apps/api/Dockerfile .
# Turborepo's Docker recipe: dependencies install from package.json files alone, so that layer
# stays cached until they change.
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS prune
COPY . .
# The repo's own turbo version, so the pruned lockfile matches.
RUN pnpm dlx turbo@$(node -p "require('./package.json').devDependencies.turbo") prune @budget/api --docker

FROM base AS build
COPY --from=prune /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
COPY tsconfig.base.json .
RUN pnpm turbo run build --filter @budget/api
RUN pnpm --filter @budget/api deploy --prod /out

FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /out/package.json ./
COPY --from=build /out/node_modules ./node_modules
COPY --from=build /out/dist ./dist
# The image's `node` user, numeric so Kubernetes' runAsNonRoot can check it.
USER 1000
EXPOSE 3001
CMD ["node", "dist/main.js"]
