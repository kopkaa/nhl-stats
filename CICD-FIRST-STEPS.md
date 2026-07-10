# CI/CD — First Steps

Konkrétní postup pro **nejtenčí učební řez**: dostat `apps/api` přes CI/CD na App Runner end-to-end. Žádný sync, žádné Lambdy, žádné path filtry — to se vrstvi až potom. Tohle je „CI/CD smyčka poprvé žije".

> Plný cílový stav CI/CD je v [INFRA-ROADMAP.md](./INFRA-ROADMAP.md) sekce 2.6. Tenhle dokument je úmyslně menší podmnožina, seřazená podle závislostí pro první průchod.

## Rozhodnutí (potvrzeno 2026-06-09)

- **Budget:** $20/měs soft cap je OK. App Runner je jediná položka, co o ceně rozhoduje (~$5-8 běžící 24/7); zbytek je dohromady ~$2-3.
- **Scope startu:** jen `apps/api` → App Runner. Ne všech 6 workflows najednou.
- **Lambda-sync refaktor NENÍ prerekvizita** — jede se z aktuálního stavu repa (`apps/api` + `apps/web`).
- **Remote state až nakonec** (krok 8) — start s lokálním state, migrace `init -migrate-state` jako cvičení.
- **App Runner sizing:** `0.25 vCPU / 0.5 GB` (ne 1vCPU/2GB z roadmapy — předimenzované pro tenhle workload). Zvedne se jedním řádkem v HCL, až bude memory pressure.
- **`tofu apply` lokálně** z mého stroje. Z CI jen `tofu plan` na PR. Auto-apply z CI odložené.

## Kritická cesta

Seřazeno podle závislostí. Každý krok ≈ jeden commit/branch.

| # | Krok | Co se naučím | Effort |
|---|---|---|---|
| 1 | AWS account + IAM user `terraform-admin` + billing alerts ($5/$10/$20) | Account hygiene, root vs IAM separace, MFA na root pak nepoužívat | ~2h |
| 2 | OpenTofu install + `apps/api/Dockerfile` (multi-stage) + lokální `docker build` | HCL základy, multi-stage build pro NestJS, pnpm workspace v Dockeru | ~3h |
| 3 | ECR repo přes Terraform (**lokální state** zatím) + lifecycle policy | `aws_ecr_repository`, `tofu init/plan/apply/destroy`, state inspection | ~1h |
| 4 | Manuální první `docker push` do ECR (placeholder image) | Proč existuje chicken-and-egg (viz Pasti) | ~30m |
| 5 | App Runner service přes Terraform, ukazuje na ten image, `0.25/0.5` | Managed container deploy, healthcheck na `/health`, instance config | ~2h |
| 6 | OIDC provider + IAM role `github-actions-deploy` (trust omezený na repo+ref) | Federated identity, short-lived credentials — **klíčová lekce** | ~3h |
| 7 | `api.yml`: build → push ECR → `aws apprunner start-deployment` → smoke test | Celá CI/CD smyčka, OIDC v GitHub Actions, immutable tag `${{ github.sha }}` | ~3h |
| 8 | Migrace state local → S3 + DynamoDB (`tofu init -migrate-state`) | Remote state, locking, encryption at rest — na živém stacku | ~2h |

Krok 1 (AWS account) jde dělat paralelně. **Začít se dá krokem 2** — jediný čistě v repu, nepotřebuje AWS, ověří se hned.

## Dvě ordering pasti

**1. Chicken-and-egg s image (krok 4).**
App Runner se nenastartuje bez image v ECR. Ale image normálně pushuje CI, které deployuje na App Runner, který ještě neexistuje. Řešení: jeden ruční `docker push` placeholder → `tofu apply` vytvoří App Runner → pak CI převezme. Jednorázová operace.

**2. App Runner ARN je Terraform output → GitHub variable.**
`api.yml` volá `aws apprunner start-deployment --service-arn ${{ secrets.APP_RUNNER_ARN }}`. Ten ARN vznikne až `tofu apply`. Tok: `tofu apply` → `tofu output service_arn` → nastav jako GitHub Actions variable → teprve pak CI deployuje. Ruční můstek mezi Terraformem a CI; v učební fázi OK, později automatizovat (SSM, ze kterého CI ARN čte za běhu).

## Otevřené otázky před krokem 2

- [ ] Existuje `apps/api/Dockerfile`? Pokud ne, krok 2 ho zakládá.
- [ ] Build z **root kontextu** kvůli `libs/shared` workspace dependency (jinak Docker neuvidí sdílený package).
- [ ] První deploy proti Neon/Upstash (→ krok 5 potřebuje SSM parametry s connection stringy), nebo stačí, aby healthcheck odpovídal a DB řešit až potom?
- [ ] Má `apps/api` healthcheck endpoint `/health`? App Runner ho potřebuje (roadmap počítá s `health/` modulem).

## Reference

- [INFRA-ROADMAP.md](./INFRA-ROADMAP.md) — plný infra plán (sekce 2.6 = cílový CI/CD stav)
- [LAMBDA-SYNC.md](./LAMBDA-SYNC.md) — sync refaktor (až po tomhle slice)
- [CLAUDE.md](./CLAUDE.md) — project conventions
