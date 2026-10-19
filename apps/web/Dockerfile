# The static SPA on unprivileged nginx (architecture §6, §9). Build from the repo root:
#   docker build -f apps/web/Dockerfile .
# Same recipe as apps/api/Dockerfile; the prune keeps @budget/api, whose build feeds the generated client.
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS prune
COPY . .
RUN pnpm dlx turbo@$(node -p "require('./package.json').devDependencies.turbo") prune @budget/web --docker

FROM base AS build
COPY --from=prune /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=prune /app/out/full/ .
COPY tsconfig.base.json .
RUN pnpm turbo run build --filter @budget/web

FROM nginxinc/nginx-unprivileged:1.30-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
RUN nginx -t
