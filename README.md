# Scene

A mobile app that connects local film creatives — a niche, location-first network for the people who make film sets run (DPs, gaffers, editors, colorists, ADs, and every role in between). Think a work-first profile feed built for film freelancers, not a broad freelance marketplace.

> **Status:** v1 built end-to-end and running on a physical iPhone via EAS dev builds. Actively developing. This is a personal project in active progress — expect ongoing changes.

## What it does

- **Work-first profile feed** — profiles lead with the creative's work; discovery is driven by output, not name recognition.
- **Local-first discovery** — surfaces creatives by location (Austin first, expanding).
- **Role tagging** — profiles tagged by department and specific role across the whole crew, not just directors.
- **In-app messaging** — reach out directly, no swipe mechanic.
- **Reviews & recommendations** — verified reviews plus employer recommendations tied to real work.
- **Privacy-preserving reviewer verification** — reviewer phone numbers are hashed **on-device** so a raw number never leaves the phone.

## Tech stack

| Layer | Tools |
|---|---|
| App | React Native, Expo (Router), TypeScript |
| Backend | Supabase — PostgreSQL, Auth, Row-Level Security |
| Server state | TanStack Query (with optimistic updates) |
| Client state | Zustand |
| Media | Cloudinary |
| Build | EAS (dev client), runs on physical iOS |

## Architecture notes

- **PostgreSQL schema secured with Row-Level Security** — the app talks to Supabase through the anon key as a signed-in user; access rules are enforced at the database level.
- **On-device hashing** for reviewer phone verification (`expo-crypto`) — the raw number is never transmitted or stored.
- **Idempotent TypeScript seed script** that provisions users and profiles against the live database without creating duplicates on re-run.

## Running locally

Requires an Expo dev environment and a Supabase project. Environment variables (Supabase URL, keys, Cloudinary cloud name) go in a local `.env` — **never committed**.

```bash
npm install
npx expo start --dev-client
```

---

*Built by [Gavin Farnan](https://github.com/GavinFar).*
