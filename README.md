# ToolShare

A neighborhood tool-sharing marketplace — residents list tools and equipment they're willing to lend, browse what's available from neighbors, and message each other to arrange borrowing. Built as an alternative to coordinating this over Facebook groups.

**Live demo:** https://neighborhoodapp-xi.vercel.app/

## Try it out

The demo is seeded with fake residents so it's populated with real listings out of the box. Sign up for your own account, or log in as one of the seeded residents:

| Email | Password |
|test1234@gmail.com|123456|
| jane@example.com | password123 |
| mark@example.com | password123 |
| priya@example.com | password123 |
| tom@example.com | password123 |

## Features

- **Authentication** — email/password signup and login, with a "complete your profile" step (name, apartment number, phone) after first signup
- **Browse & filter** — items sorted into "Looking for" (requests) and "Available to borrow" (offers), filterable by category and free-text search
- **List an item** — post something you're lending (with photo upload) or something you're looking for
- **Edit & delete** — manage your own listings, including replacing photos
- **Messaging** — request to borrow an item, or offer to lend something someone's requesting, creating a persistent conversation thread between the two residents
- **My listings** — a dedicated view of everything you've personally posted

## Tech stack

- **Next.js** (App Router, TypeScript) — frontend framework and hosting target
- **Tailwind CSS** — styling
- **Supabase** — Postgres database, authentication, and file storage (see [Architecture](#architecture) below)
- **Vercel** — hosting and CI/CD deployment
- **Vitest** — unit and integration testing
- **GitHub Actions** — CI pipeline (lint, test, build) on every push

## Architecture

This app has no custom backend server. The frontend (Next.js/React, running in the browser) talks **directly** to Supabase for everything — authentication, database reads/writes, and file storage. This is a "backend-as-a-service" architecture: Supabase *is* the backend, just one that didn't require writing custom server code.

Since there's no server in the middle checking permissions before a query reaches the database, all authorization is enforced by **Postgres Row-Level Security (RLS)** policies directly on the database tables (`schema.sql`). For example:
- A resident can view all listings, but can only edit or delete their own
- Only the two participants in a conversation can read or send messages in it

### Data model

Four tables: `residents` (linked 1:1 to Supabase auth users), `items`, `conversations`, and `messages`. Notable design decisions:
- `items.category` is plain text (validated in the app, not a database enum) — deliberately, so adding new categories later doesn't require a schema migration
- `items.listing_type` (`'offer'` or `'request'`) lets the same table represent both "I have this to lend" and "I'm looking for this," reusing the same messaging system for both directions
- `conversations` stores both `requester_id` and `owner_id` directly rather than deriving the owner via a join through `items` — a deliberate denormalization that simplifies queries and preserves conversation history even if the listing is later deleted

## Testing

- `npm test` — fast unit tests (e.g. the search/category filter logic), no network required, run in CI on every push
- `npm run test:rls` — integration tests that actually attempt to violate RLS policies (e.g. "can one resident edit another's profile?", "can a non-participant read a private conversation?") against a real Supabase project. Not run in CI, since it requires real database credentials that CI intentionally doesn't have access to.

## Local development

```bash
npm install
cp .env.local.example .env.local   # fill in your own Supabase project's URL and anon key
npm run dev
```

Run `schema.sql` and `storage_policies.sql` in your Supabase project's SQL Editor to set up the database. Optionally run `node seed.mjs` (requires a `SUPABASE_SECRET_KEY` in `.env.local`) to populate fake residents and listings for demo purposes.

## Known limitations (deliberate v1 scope)

- Signup is currently open to anyone with any email — there's no verification that a signee is actually a resident of a specific building. Fine for a demo; would need an invite/approval system before real-world use with real personal data.
- No real-time updates — the message thread doesn't push new messages live; you'll see new replies on refresh.
- No password reset flow has been tested end-to-end.
