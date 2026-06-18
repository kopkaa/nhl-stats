# NestJS API. Build from repo root: docker build -f apps/api/Dockerfile .
# (potřebuje vidět celý workspace kvůli libs/shared)

FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /repo

FROM base AS build
# Manifesty zvlášť → install se cachuje, dokud se nezmění dependencies.
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY libs/shared/package.json libs/shared/
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter api build
# Produkční node_modules jen pro api do /app.
# --legacy: shared je už zabundlovaný v dist, injected workspace packages netřeba.
RUN pnpm --filter api --prod --legacy deploy /app

FROM node:22-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /repo/apps/api/dist ./dist
EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
