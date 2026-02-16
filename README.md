# Luxury Auto Detailz

Production-ready Next.js + Supabase + Google Calendar web app for a mobile detailing business.

## Features
- Marketing pages: Home, Pricing, Gallery, Contact
- Custom 5-step booking flow at `/book`
- Live availability from Google Calendar (`freeBusy.query`)
- Booking creation with race-condition re-check and event insertion (`events.insert`)
- Supabase-backed admin dashboard with auth-protected `/admin` routes
- Optional email notifications via Resend
- Tailwind premium dark UI and sticky Book Now CTA

## Tech Stack
- Next.js App Router + TypeScript + TailwindCSS
- Supabase (Postgres + Auth + RLS)
- Google Calendar API (service account)
- Resend (optional)

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env template:
   ```bash
   cp .env.example .env.local
   ```
3. Fill required env vars (see `.env.example`).
4. Run migration in Supabase SQL editor: `supabase/migrations/202506060001_init.sql`.
5. Create your first Supabase Auth admin user and capture the UUID.
6. Seed service/add-on catalog for that owner:
   ```sql
   select public.seed_default_catalog('<ADMIN_USER_UUID>'::uuid);
   ```
7. Set `DEFAULT_OWNER_ID` in env to the same admin UUID.
8. Run app:
   ```bash
   npm run dev
   ```

## Google Calendar Service Account Setup
1. Create a new Google Cloud project.
2. Enable **Google Calendar API**.
3. Create a **Service Account** and generate a JSON key.
4. Share your target Google Calendar with the service-account email and grant **Make changes to events**.
5. Set these environment variables in local + Vercel and redeploy:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`
   - `GOOGLE_PRIVATE_KEY` (preserve newline escapes)
   - `GOOGLE_CALENDAR_ID`

> The app can run **before** Google Calendar is connected. In that mode, booking conflict checks still use your Supabase `bookings` table so you can test end-to-end flows. Once Google vars are added, Google free/busy + event creation are used automatically.

## Supabase & Security
- All business tables have RLS enabled.
- CRUD policies enforce `owner_id = auth.uid()`.
- Public visitors never write directly to Supabase; booking uses server API route at `/api/bookings` with service role key.
- Admin auth uses Supabase SSR cookies + middleware on `/admin/*`.

## Admin Access
- `/admin/login` signs in with Supabase Auth email/password.
- `/admin/dashboard` shows bookings + summary stats.
- `/admin/customers` shows customers and booking history counts.
- `/admin/bookings/[id]` shows booking details including internal fields.

## Pre‑Vercel Deployment Debug Checklist (Must Pass)
1. **Environment vars configured in Vercel**
   - Required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DEFAULT_OWNER_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_CALENDAR_ID`.
   - Optional: `RESEND_API_KEY`, `OWNER_NOTIFICATION_EMAIL`.
2. **Supabase migration applied** and `seed_default_catalog()` executed with the real owner UUID.
3. **Google Calendar shared correctly** with service account email and edit permission.
4. **Admin login test**
   - Login at `/admin/login`
   - Confirm navigation to `/admin/dashboard` succeeds without redirect loops.
5. **Booking availability test**
   - `/book` should return slots only inside Mon–Sat 9:00–18:00 (America/Chicago).
   - Sundays should return no slots.
6. **No-overlap test**
   - Book one slot.
   - Try booking overlapping slot; API should return: `That time was just booked—please choose another slot.`
7. **Google event test** (after calendar credentials are connected)
   - Confirm inserted event title format: `Luxury Auto Detailz — {Service} ({Vehicle Size})`.
   - Confirm description includes customer details, address, add-ons, notes, estimated total.
8. **Production build check**
   ```bash
   npm run build
   ```
9. **Post-deploy smoke tests**
   - Home/pricing/gallery/contact render
   - Booking submission creates Supabase row + Google event
   - Admin dashboard sees booking data

## Common Deployment Mistakes to Avoid
- Using a placeholder/incorrect `DEFAULT_OWNER_ID` (breaks catalog lookup and booking inserts).
- Forgetting to run `seed_default_catalog` for the real owner.
- Private key formatting issues (`GOOGLE_PRIVATE_KEY` must keep escaped newlines).
- Not sharing the calendar with service account write permissions.
- Missing SSR middleware causing admin auth session mismatch.

## Scripts
- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run typecheck`
