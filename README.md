# NHL App

Full-stack app to show NHL stats. NestJS GraphQL backend, Nuxt frontend, PostgreSQL, Redis.

## Prerekvizity

- Node.js 22+
- pnpm 10+
- Docker 

## Setup

```bash
# install dependencies
pnpm install

# run docker compose
docker compose up -d

# run migrations to create tables
pnpm db:migrate

# generate TypeScript types from GraphQL schema
pnpm codegen
```

## Spuštění

```bash
# Backend
pnpm dev:api

# Frontend 
pnpm dev:web
```

Backend GraphQL playground: http://localhost:3000/graphql
Frontend: http://localhost:3001


## Structure

```
apps/
  api/    — NestJS, Apollo Server, Drizzle ORM
  web/    — Nuxt 3, Vue 3, Apollo Client, PrimeVue
libs/
  shared/ — GraphQL schema a generované typy
```

