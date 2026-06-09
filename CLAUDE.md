# NHL App

Monorepo pro hokejovou aplikaci postavenou nad veřejným NHL API. Cílem je vytvořit kompletní full-stack řešení pro vizualizaci NHL statistik, zápasů, hráčů a tabulek.

## Struktura monorepa

```
apps/
  api/    - Backend (NestJS, GraphQL, Apollo Server)
  web/    - Frontend (Vue 3, Vite, Apollo Client)
libs/
  shared/ - Doménové enumy a konstanty (source of truth, viz Architektura)
```

## Technologie

- **Runtime**: Node.js, TypeScript (strict mode)
- **Backend**: NestJS 11, Apollo Server 5, @nestjs/graphql
- **Frontend**: Vue 3, Vite 7, @vue/apollo-composable
- **Package manager**: pnpm (workspaces)
- **Codegen**: GraphQL Code Generator (schema -> TypeScript typy)
- **Databáze**: PostgreSQL (plánováno)
- **Cache**: Redis (plánováno)

## Konvence

- **Žádné single-char proměnné** — vždy celý popisný název (`player`, `skater`, `goalie`, `game`), včetně v-for, sort callbacků a filtrů
- Moderní TypeScript — strict mode, žádné `any`, preferuj typovou bezpečnost
- NestJS moduly — každá doména (teams, players, games, standings) má vlastní modul s resolver, service a model
- GraphQL **code first** — schema se generuje automaticky z TypeScript tříd s dekorátory (`@ObjectType`, `@Field`, `@Query`, `@Mutation`)
- Frontend používá Apollo composables (`useQuery`, `useMutation`) pro komunikaci s API

## Příkazy

```bash
pnpm dev:api     # Spustí API server (watch mode, port 3000)
pnpm dev:web     # Spustí frontend dev server
pnpm codegen     # Vygeneruje TypeScript typy z GraphQL schema
```

## Architektura

### Backend (apps/api)

GraphQL je jediný entrypoint pro frontend. Schema se automaticky generuje do `libs/shared/graphql/schema.gql`.

#### Datová strategie — dual source

Resolver nerovná se zdroj dat. Resolver jen rozhoduje, odkud data vzít, skládá výsledek a hlídá konzistenci. Zdroje dat jsou dva:

**Cold data (PostgreSQL)** — data, co se nemění často nebo vůbec:
- týmy (název, divize, konference, logo)
- hráči (bio, pozice, draft info)
- sezóny, historické zápasy
- agregované statistiky (per season, career)
- aktualizace přes pravidelný sync (cron)

**Hot data (NHL API live)** — data, co se rychle mění:
- live zápas, aktuální skóre
- time-on-ice v reálném čase
- live standings
- dnešní / zítřejší zápasy

#### Resolver pattern

```
GraphQL Query
  └─ Resolver
       ├─ cold data → DB repository (PostgreSQL přes Drizzle ORM)
       └─ hot data  → NHL API client (axios)
```

Resolver rozhoduje podle povahy dotazu. Frontend neví a neřeší, odkud data pochází — GraphQL schema je jednotné.

#### Cache strategie

- **Redis** — cache pro semi-statická data (standings, roster) s TTL
- **PostgreSQL** — trvalé úložiště pro historii a agregace
- **NHL API** — vždy pro live data, bez cache

Plánované moduly:
- `teams` — seznam týmů, detail týmu (implementováno)
- `players` — detail hráče, statistiky
- `games` — zápasy podle data, live skóre
- `standings` — tabulky divizí a konferencí

### Frontend (apps/web)

Vue 3 SPA s Apollo Client pro GraphQL dotazy. Plánované stránky:
- `/teams` — seznam a detail týmů
- `/players/:id` — statistiky hráče, grafy výkonu
- `/games/:date` — přehled zápasů
- `/standings` — ligové tabulky

### Sdílený kód (`libs/shared`)

`libs/shared` je **doménový source of truth** — ručně psaný originál, ze kterého se vše ostatní odvozuje. Žádný build step, exportuje rovnou `src/index.ts` (oba konzumenti si TS kompilují sami).

Obsahuje:
- **doménové enumy** (`Conference`, `Division`, `GameState`, `PositionCode`, `StreakCode`) — api je registruje do GraphQL schématu přes `registerEnumType`
- **doménové konstanty/helpery, co schéma nemodeluje** (`PLAYOFF_SPOTS_*`, `formatSeason`)

#### Tok dat pro enumy

```
shared/index.ts  →  api registerEnumType  →  schema.gql  →  codegen  →  web/generated.ts
   (originál)         (kontrakt)              (kontrakt)                 (kopie pro FE)
```

Enum se napíše jednou v `shared`, api z něj postaví GraphQL schéma, codegen ho propíše do `generated.ts`. Jediná cesta dat → nejde rozsynchronizovat.

#### Pravidlo: odkud importovat

- **Je to v GraphQL schématu?** → frontend bere z `~/graphql/generated`, **nikdy** ze `shared` (jinak obchází kontrakt a vznikají dva zdroje pravdy)
- **Není ve schématu, ale potřebují to obě strany?** → `shared`
- **Potřebuje to jen jedna appka a není ve schématu?** → zůstává v té appce

Backend importuje enumy ze `shared` přímo (je producent schématu). api musí `@nhl-app/shared` deklarovat jako `workspace:*` dependency (ne jen přes tsconfig `paths`) — jinak o závislosti neví pnpm při deploy/prune.

### Data pipeline (plánováno)

- Cron job / worker pro pravidelný sync cold dat z NHL API do PostgreSQL
- Background jobs přes BullMQ
- Redis cache s TTL pro semi-statická data (standings, roster, schedule)

## Datový model (plánováno)

- `teams` (id, name, division, conference)
- `players` (id, name, team_id, position, stats)
- `games` (id, date, home_team_id, away_team_id, score_home, score_away, status)
- `standings` (team_id, wins, losses, points, ...)

## Features

### Základní

- Seznam týmů — logo, jméno, divize/konference
- Detail týmu — soupiska, statistiky, poslední a nadcházející zápasy
- Seznam zápasů — přehled denních zápasů se skóre a stavem (LIVE / FINAL / Upcoming)
- Detail zápasu — skóre po třetinách, střely, statistiky, soupisky hráčů
- Tabulka (standings) — konference/divize, W-L, body, streak
- Leaders — žebříčky hráčů (góly, asistence, body, trestné minuty)
- Detail hráče — sezónní a kariérní statistiky, graf výkonu

### Rozšířené

- Live scores — real-time aktualizace přes GraphQL Subscriptions nebo polling
- Timeline zápasu — góly, asistence, tresty, šance na časové ose
- Porovnání hráčů — side-by-side statistiky dvou hráčů
- Historie formy týmu — graf vývoje za posledních X zápasů
- Kalendář zápasů — interaktivní kalendář s možností prokliknout na detail dne

### Fan features

- Oblíbené týmy — uložení favoritů, personalizovaná homepage s jejich výsledky
- Dark mode / team theme — barvy stránky podle vybraného týmu
- Notifikace — upozornění na začátek zápasu oblíbeného týmu (budoucnost)

## Stránky (layout)

### Homepage
- Hero sekce s dnešními zápasy (carousel / cards se skóre)
- Top players (góly, asistence, body)
- Aktuální standings

### /games
- Denní přehled zápasů (list/grid)
- Filtr podle data (datepicker)

### /games/[id]
- Skóre + stav (LIVE / Final / Upcoming)
- Timeline zápasu (góly, asistence, tresty)
- Statistiky týmů (střely, přesilovky, face-off %)
- Soupisky obou týmů

### /teams
- Grid s logy a názvy týmů
- Filtr podle konference/divize

### /teams/[id]
- Info o týmu, soupiska s linky na hráče
- Poslední výsledky + nadcházející zápasy

### /players/[id]
- Fotka, pozice, číslo dresu
- Statistiky: góly, asistence, body, +/-
- Line chart vývoje výkonu

### /standings
- Tabulka konference/divize
- Řazení a filtrování

## UX/UI principy

- Cards pro zápasy a hráče
- Tabs u detailů (Season Stats / Career Stats)
- Charts pro vizualizaci trendů (Chart.js / ECharts)
- Responsive layout — mobile-first (sport = telefon)

## Styl kódu a UI — nevypadat jako AI

### Kod
- Žádné zbytečné komentáře — kód musí mluvit sám za sebe. Komentář jen tam kde je logika skutečně neintuitivní
- Naming podle domény — používej hokejový slovník (`streak`, `conferenceName`, `playoffs`), ne generický (`data`, `item`, `row`)
- Enumy pro opakované string hodnoty z NHL API (`Conference`, `Division`) — soubor `apps/web/constants/nhl.ts`
- Žádné `any`, žádné zbytečné type assertions

### UI
- Nepoužívat PrimeVue komponenty bez úprav — default Aura theme vypadá genericky. Customize přes design tokeny nebo vlastní třídy
- Sporty appky jsou husté a ostré — méně rounded corners, méně whitespace než default Tailwind
- Autentické detaily které znají fanoušci: playoff cut-off line ve standings, streak zbarvení (W/L), seed čísla v playoffs
- Barvy podle NHL identity tam kde to dává smysl, ne `gray-400/gray-800` všude
- Žádné dekorativní texty v UI ("NHL Stats", "Welcome to...") — data jsou obsah, ne text okolo nich

## Deployment

- **Backend**: Docker container (Render / Railway / Fly.io)
- **Frontend**: Vercel / Netlify (static build)
- **Databáze**: Supabase / Railway Postgres


