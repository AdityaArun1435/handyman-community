# ECR Handyman Community

A local services directory and community platform for ECR, Chennai — built to
solve a real problem: finding a contactable, reasonably priced handyman
(AC repair, electrician, plumber, etc.) without going through expensive
aggregator apps.

Live at: https://handyman-community.vercel.app

## Features

- **Handyman directory** — browse by service category and locality, see
  ratings, experience, and bio.
- **Booking requests** — customers request a booking against a handyman's
  actual set availability; handymen confirm, complete, or cancel from their
  dashboard.
- **Real-time chat** — a per-booking chat thread between customer and
  handyman, powered by Supabase Realtime.
- **Reviews** — customers rate and review completed bookings; average
  rating shown on the directory and profile pages.
- **Location sharing** — customers can optionally share their exact
  location on a booking request; handymen get a direct map link.
- **Profile editing** — handymen can update their services, localities,
  bio, and upload a profile photo.
- **Community board** — a public Q&A/discussion space for the neighborhood,
  separate from bookings — ask questions, share recommendations, filter by
  locality.

## Tech stack

- **Next.js** (App Router) — frontend and server logic
- **Supabase** — Postgres database, authentication, Row Level Security,
  Realtime, and file storage (profile photos)
- **Tailwind CSS** — styling
- Deployed on **Vercel**

## Local setup

\`\`\`
npm install
\`\`\`

Create a `.env.local` file with:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_publishable_key
\`\`\`

Then run:

\`\`\`
npm run dev
\`\`\`

## Database

Schema and Row Level Security policies are managed directly in Supabase
(see the project's SQL migrations). Core tables: `profiles`,
`handyman_details`, `availability`, `bookings`, `messages`, `reviews`,
`posts`, `post_replies`.

## Status

Working prototype. Not yet launched to real users — next step is recruiting
actual handymen in ECR before opening it up publicly.