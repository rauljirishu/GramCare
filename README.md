<<<<<<< HEAD
# GramSwasthya Doctor Dashboard

Offline-first rural-healthcare dashboard for SIH26133. The app is a Next.js/Tailwind client over Supabase Auth and Postgres.

## Start

1. Create a Supabase project and run [the migration](supabase/migrations/202609070001_gramswasthya.sql) in its SQL editor (or apply it with the Supabase CLI).
2. Copy `.env.example` to `.env.local` and add the project URL and anonymous key.
3. Install a current Node.js LTS release, then run `npm install` and `npm run dev`.
4. In Supabase Auth, create the clinician account. After the first sign-in/profile trigger, promote verified doctors through an admin-only server process, for example: `update public.users set role = 'doctor', facility_id = '<facility uuid>' where email = 'doctor@example.org';`

The browser only uses the Supabase anonymous key. Keep the service-role key exclusively in trusted backend/AI-service infrastructure. AI services can insert risk assessments through a server-side client; the RLS policies intentionally protect client-side access.

## API layer

`lib/api/doctor.ts` provides typed, reusable calls for dashboard metrics, patient lists, high-risk patients, patient detail/history, referrals, and follow-up updates. Both the Next.js dashboard and a separate Flutter client can use the same table contracts through Supabase’s generated REST API/client SDK.
=======
# GramCare
>>>>>>> f18516b49928d26f0594e92ff48a7571a3b1727c
