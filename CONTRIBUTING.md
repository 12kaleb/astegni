# Developer workflow

Create a focused branch for each change: `codex/<short-topic>` for Codex work or `feature/<short-topic>` for product work. Open a pull request to `main`; CI runs lint, Prisma validation, unit and browser tests, and a production build. Use the pull request template to describe data migrations and how the UI was checked with a keyboard and mobile viewport.

## Staging Supabase

Create a separate Supabase project for staging. Set its pooled database URL as `DATABASE_URL`, its direct database URL as `DIRECT_URL`, and use that same staging project's URL, publishable key, and service key in the staging deployment. Never reuse production database, auth, storage, Chapa, Stripe, email, or Sentry secrets in staging. Apply migrations to staging first with `npm run db:deploy`. Add `E2E_*` credentials to CI only for dedicated staging test users; do not commit them. Production deployment should use protected GitHub environment secrets and a reviewed PR.

## Demo data

Use `npm run db:seed:demo` only against a disposable development or staging database after explicitly setting `ALLOW_DEMO_SEED=true` and `SEED_DATABASE_URL`. The script creates fictional student, tutor, administrator, lesson, assignment, and review records. Do not point it at production.

## Tests

`npm test -- --run` runs Vitest. `npm run test:e2e` runs Playwright against the local app; the signup UI test uses a mocked signup response, while booking and tutor approval tests require a dedicated staging account and tutor fixture. Set `E2E_STUDENT_EMAIL`, `E2E_TUTOR_ID`, `E2E_ADMIN_EMAIL`, and `E2E_PASSWORD` to enable those tests.
