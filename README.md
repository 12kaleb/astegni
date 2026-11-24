# Astegni

Astegni is a tutoring marketplace built with Next.js 16, React 19, Supabase Auth, and Prisma 6. It includes tutor discovery, student and tutor dashboards, weekly tutor availability, lesson booking requests, assignments, and admin review tools.

## Requirements

- Node.js 20.9 or newer
- npm
- A PostgreSQL database
- A Supabase project for authentication

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in the database and Supabase values. The server validates required values during startup.

3. Generate the Prisma client and apply local migrations:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   `db:migrate` creates a migration when the schema has changed and applies it to the configured development database. For an already-created migration in a deployment environment, use `npm run db:deploy`.

4. Start the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection used by the app. Use Supabase's pooled connection string in serverless deployments. |
| `DIRECT_URL` | Direct PostgreSQL connection used by Prisma for migrations. For local development, it can be the same URL as `DATABASE_URL`. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key used by the browser and server auth clients. |
| `NEXT_PUBLIC_SITE_URL` | Canonical public origin used for metadata and the sitemap (for example, `https://your-domain.example`). |
| `SUPABASE_SECRET_KEY` | Optional until uploads are enabled; server-only secret key for Storage operations. Never expose it to the browser. |
| `RESEND_API_KEY`, `EMAIL_FROM` | Optional booking, confirmation, and reminder email delivery. Configure a verified sender domain in Resend. |
| `JITSI_DOMAIN` | Optional Jitsi host (defaults to `meet.jit.si`). |
| `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET` | Optional local ETB checkout and webhook verification. Register `/api/webhooks/chapa` in Chapa. |
| `CRON_SECRET`, `LESSON_REMINDER_WINDOW_MINUTES` | Protect and configure the reminder job. Call `/api/cron/lesson-reminders` hourly with `Authorization: Bearer <CRON_SECRET>`. |

Booking emails and payment providers remain inactive until their optional credentials are configured. Payment completion is recorded only after a signed webhook or a server-side Chapa transaction verification. Student review submissions are limited to completed lessons; public tutor reviews do not expose the student's name.

Application data access stays in server-side code. The RLS migration enables RLS with no public policies; the Prisma database owner can bypass RLS, so server route authorization remains the active control. See [SECURITY.md](SECURITY.md) for the full access model, invitation flow, and rate limits.

## Create the first admin

First, register and sign in with the account you want to promote so Supabase creates its Astegni profile. Then, with a development database configured in `.env.local`, run:

```bash
npm run bootstrap-admin -- your-email@example.com --confirm-dev
```

The script refuses to run when `NODE_ENV=production` and requires `--confirm-dev`. It promotes an existing account only; it does not create an account or change its Supabase credentials. Never point this command at production.

## Useful commands

```bash
npm run dev             # Start Next.js locally
npm run lint            # Run ESLint
npm run db:generate     # Generate the Prisma client
npm run db:migrate      # Apply development migrations
npm run db:deploy       # Apply committed migrations
```

## Deployment notes

- The browser UI and API are currently one Next.js application. The UI lives under `src/app` and `src/views`; API route handlers live under `src/app/api`. Authentication, database access, and some page data loading are shared, so this repository does not yet have a separately deployable API service.
- For the simplest production deployment, build and run the included Docker image. It uses Next.js standalone output and contains the UI and API in one small production server. Set the public Supabase URL, publishable key, and canonical site URL at **build time**; they are embedded in browser assets. Set all server secrets in `.env.production` at runtime.

  ```bash
  Copy-Item .env.example .env.production
  # Edit .env.production with production values, then:
  docker compose --env-file .env.production build
  docker compose --env-file .env.production --profile release run --rm migrate
  docker compose --env-file .env.production up -d app
  ```

- Use Supabase's pooled connection string for `DATABASE_URL` and the direct database connection for `DIRECT_URL`. Run the migration command once for each release before starting the updated app.
- To host the UI and API as independent services later, first move the API handlers and their authorization/data dependencies into a standalone backend, then point the frontend API calls at that service and configure CORS and Supabase token verification there. The current Docker setup keeps them together to avoid breaking the shared auth and server-rendered data flows.
- Keep user data access and role checks in server code; Prisma queries do not inherit Supabase RLS policies.
- Configure Supabase Auth rate limits and CAPTCHA/bot protection as well as Astegni's application rate limits.
- Before enabling uploads, create a private `verification-documents` bucket (8 MB, PDF/JPEG/PNG) and a public `avatars` bucket (2 MB, JPEG/PNG/WebP), then set `SUPABASE_SECRET_KEY`. Upload endpoints return `503` until this configuration exists.
- Terms and privacy pages are drafts that require qualified local legal review before production use. Guardian consent currently requires documented, manual admin verification; no guardian email verification service is connected.
- Tutor availability and the booking flow require the Phase 5 Prisma migration. Tutors should set weekly windows and a valid IANA time zone before students can request lessons.
