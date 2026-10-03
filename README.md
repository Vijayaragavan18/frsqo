# frsqo — Make space for better living.

A premium home-organisation startup website, built with Next.js 14 (App Router),
TypeScript, Tailwind CSS, Framer Motion, and Supabase.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase project keys
npm run dev
```

Open http://localhost:3000.

The site runs and looks complete even **without** Supabase connected — forms
validate and the booking flow works end-to-end, it just won't persist data or
show a live launch-offer count until you connect a project (see below).

## Connecting Supabase

1. Create a project at https://supabase.com.
2. In the SQL editor, run `supabase/schema.sql`. This creates:
   - the `bookings` table
   - a `launch_offer_config` table (holds the "20" for the free-slot count,
     editable without a redeploy)
   - a `set_booking_is_free()` trigger that computes `is_free` **server-side**
     on every insert, so the "first 20 free" logic can't be gamed from the
     client
   - a `get_launch_offer_status()` function that safely exposes only the
     claimed/remaining counts (never raw booking rows) for the progress bar
   - Row Level Security policies, and a public `booking-photos` storage bucket
3. Copy your project URL and anon key into `.env.local` (see
   `.env.local.example`).
4. For Login (`/login`), enable Email/Password and Google providers under
   Authentication → Providers in the Supabase dashboard.

## Project structure

```
src/
  app/
    page.tsx              Home
    about/page.tsx         About
    contact/page.tsx       Contact
    login/page.tsx         Login
    book/page.tsx          Booking flow
  components/               Reusable UI (Navbar, Hero, BeforeAfterSlider, ...)
  lib/
    constants.ts            Categories, service levels, areas, copy
    supabaseClient.ts        Supabase client (guards missing env vars)
    bookings.ts               submitBooking / getLaunchOfferStatus / photo upload
  types/index.ts             Shared TypeScript types
supabase/
  schema.sql                 Full DB schema + RLS + secure launch-offer logic
public/images/                Photos used throughout the site
```

## Notes

- Images in `public/images` are the ones supplied in the source ZIP. Two
  images from the original ZIP were **excluded** because they carried visible
  third-party watermarks (a staging company's logo and a blog's logo) —
  reusing branded/watermarked photos on a commercial site isn't safe, so
  they were left out rather than cropped around.
- The before/after slider (`components/BeforeAfterSlider.tsx`) is fully
  keyboard accessible (arrow keys move the handle) and works with touch,
  mouse, and pen input via the Pointer Events API.
