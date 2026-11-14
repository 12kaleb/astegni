# Security model

## Data access and Row Level Security

Application data is read and written by server-side Next.js pages and Route Handlers through Prisma. Supabase Auth provides identity; `requireUser` resolves that identity to an Astegni user and enforces the database role before protected operations. The browser uses only the Supabase publishable key.

The Prisma connection uses the database owner role, which can bypass PostgreSQL RLS. This is intentional for the current server-only access model: route authorization is the active access control, and RLS is a backstop that blocks the Supabase Data API roles. The Phase 3 migration enables RLS on each application table and creates no `anon` or `authenticated` policies. Do not add browser-side Supabase reads or writes unless narrowly scoped RLS policies are designed and reviewed first. RLS does not replace the server role checks.

## Sessions and authorization

Next.js Proxy verifies Supabase claims before serving `/dashboard` and protected API paths. Route Handlers still call `requireUser` and check the required role; the Proxy check is only an early session gate and does not make role decisions.

Public signup accepts only student or tutor roles. Admin, manager, and support specialist roles are assigned only when a signed-in user accepts an unexpired invitation for the same verified email address. Admins may invite all three internal roles. Managers may invite support specialists only. The development-only `bootstrap-admin` script remains an explicit local bootstrap path.

## Rate limits

Signup, tutor profile updates, lesson booking requests, tutor lesson scheduling, verification uploads, avatar uploads, and safety reports use atomic fixed-window counters in PostgreSQL. The signup route limits both source IP and normalized email; other writes limit by authenticated user. `Retry-After` is returned when a limit is reached. If the rate-limit table is unavailable, these writes fail closed with `503`.

The signup IP limit reads `x-real-ip` or the first `x-forwarded-for` value. Deploy behind a trusted proxy that overwrites these headers; otherwise clients may spoof their IP bucket.

Supabase Auth remains directly reachable using the public project URL and publishable key. Configure Supabase Auth's own rate limits and CAPTCHA/bot protection in the Supabase project as well; the application route limiter only covers requests routed through Astegni.

When a student booking endpoint is added, it must use the shared `consumeRateLimit` helper before creating lessons.

## Database connections and environment

- Production `DATABASE_URL` must use the Supabase pooled connection host for app traffic.
- `DIRECT_URL` must use the direct database host for Prisma migrations.
- Production also requires `NEXT_PUBLIC_SITE_URL` for canonical metadata, invitation links, and the sitemap.
- Startup validates the database URLs and Supabase settings and reports missing or malformed values before accepting requests.

Never put database URLs, Supabase secret keys, or service-role keys in `NEXT_PUBLIC_*` variables or client code.

## Phase 4 trust and safety

- Tutor evidence is stored in the private `verification-documents` Storage bucket. Uploads accept signature-checked PDF, JPEG, or PNG files up to 8 MB. Admin preview links expire after 60 seconds. The app requires both an approved national ID and degree certificate before the tutor verification route can approve a tutor.
- Avatars are stored in the public `avatars` bucket and accept signature-checked JPEG, PNG, or WebP files up to 2 MB. Do not upload sensitive information as an avatar.
- Configure both buckets in Supabase before enabling uploads: `verification-documents` private with an 8 MB limit and allowed PDF/JPEG/PNG types; `avatars` public with a 2 MB limit and allowed JPEG/PNG/WebP types. Set the server-only `SUPABASE_SECRET_KEY` (or legacy service role key) in the deployment environment. Upload routes return `503` until it is set.
- Reports and blocks are limited to student/tutor pairs. Blocks prevent new tutor selections and tutor-created lessons in either direction. Admins can review reports in the dashboard. Existing lessons and records are retained.
- Signup records a self-declared under-18 status and guardian contact as a pending consent request. Admin approval should happen only after authorization is independently confirmed with the guardian. Pending requests cannot select tutors or be scheduled by tutors. This workflow is manual because the app has no trusted guardian email verification service yet; the declaration is not age verification, so design an age-assurance process before launch.
- Terms and privacy pages are working drafts. Complete the operator identity, retention periods, contact and data-transfer details, and obtain Ethiopian legal review before launch. The pages do not by themselves establish legal compliance.
- Admin actions for tutor verification, invitation issuance and acceptance, document review, guardian consent review, and report handling are written to `AuditLog`. Admins can read the latest 100 events from `/api/admin/audit-logs`.

## Phase 5 booking flow

- Tutors publish recurring weekly windows in an IANA time zone. Student booking requests are accepted only inside those windows for verified, open tutors.
- `Lesson.scheduledAt` is an absolute timestamp stored from an ISO value with an offset. Each user has a saved IANA `timeZone`; the dashboard shows lesson times in the viewer’s zone and labels it explicitly.
- Booking creation, tutor confirmation, and rescheduling serialize on advisory locks for both participants and check overlapping active lessons inside the same database transaction. A pending reschedule temporarily blocks both the proposed slot and the original slot.
- Tutors confirm or decline student requests. Either participant can propose a new time; the other must accept or decline. Cancellation and rescheduling are blocked within 24 hours of the active session start, and each lesson may be rescheduled at most three times.
- The old `activeDays` and `typicalHours` profile columns remain as unused legacy data. New scheduling reads only the `Availability` table.
