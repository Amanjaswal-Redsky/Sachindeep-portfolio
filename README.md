# Sachindeep Portfolio

React, Vite, and Three.js portfolio with Supabase-backed content and administration.

## Requirements

Node.js 20.19+ is recommended. The Vite dev/build toolchain also starts on Node 18+.

## Admin setup

The frontend connects directly to Supabase for projects, skills, experience, services, contact messages, admin authentication, and project image storage. Configure only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the frontend. Keep Row Level Security enabled; admin writes require a Supabase Auth session and the configured RLS policies.

Create the admin account in Supabase Dashboard → Authentication → Users. Never put a Supabase service-role key in frontend code or any `VITE_` variable.

Run the SQL in `supabase/schema.sql` for a new project, then apply `supabase/migrations/20261007000000_services_category_color.sql`, `supabase/migrations/20261007000001_seed_existing_skills.sql`, and `supabase/migrations/20261007000002_seed_existing_experience.sql` in order. The migrations restore the existing Services cards, Skills cards, and Experience timeline as Supabase rows; matching database records are preserved.

Contact messages are inserted directly into `contact_messages`. Email notifications are optional and use the `contact-notification` Supabase Edge Function. Set `RESEND_API_KEY`, `CONTACT_EMAIL_TO`, and `CONTACT_EMAIL_FROM` with `supabase secrets set`, then deploy with `supabase functions deploy contact-notification`. These are Supabase secrets, not frontend variables. No Express server is required.

## Run locally

Start the Vite site:

```sh
npm run dev
```

Open `/admin` to sign in. Successful login redirects to `/admin/dashboard`. Project reads and changes use Supabase Auth and the `projects` table's Row Level Security policies.

Only the Vite frontend and Supabase project need to be deployed.