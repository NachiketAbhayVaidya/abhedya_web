# Abhedya Security — MERN Web App

Security-guard staffing/management platform, rebuilt as a full-stack MERN app. Three roles share one system: **Admin** (HQ operations), **Guard** (field staff), and **Client** (organizations that hire guards).

## Stack

- **Backend**: Node.js, Express, MongoDB/Mongoose, JWT auth (httpOnly cookie), bcrypt
- **Frontend**: React (Vite), React Router, TanStack Query, Zustand, Tailwind CSS v4
- **File uploads**: Multer, stored on local disk under `server/uploads/`

## Project layout

```
server/   Express API (src/models, controllers, routes, middleware)
client/   Vite React app (src/api, store, components, pages)
```

## Prerequisites

- Node.js 18+
- A running MongoDB instance (local or Atlas)

## Setup

```bash
npm run install:all      # installs server + client dependencies
cp server/.env.example server/.env   # then edit MONGO_URI / JWT_SECRET as needed
```

Seed test accounts (1 admin, 1 guard, 1 client, 1 site):

```bash
npm run seed
```

| Role   | Email                  | Password       |
|--------|------------------------|----------------|
| Admin  | admin@abhedya.local    | Admin@12345    |
| Guard  | guard@abhedya.local    | Guard@12345    |
| Client | client@abhedya.local   | Client@12345   |

## Running

```bash
npm run dev   # runs server (port 5000) and client (port 5173) concurrently
```

The Vite dev server proxies `/api` and `/uploads` to the backend, so the client just talks to relative `/api/...` paths.

Open http://localhost:5173 and log in with one of the seeded accounts, or register a new guard/client account.

## Key design decisions

- **Auth**: JWT stored in an httpOnly cookie (also returned in the response body for API clients). Role is embedded in the token and re-checked against the DB on every request.
- **Clock in/out**: guards submit their browser geolocation; the server computes the distance to the assigned site (haversine) and rejects clock-in outside the site's configured geofence radius.
- **Payments**: internal ledger only — admin generates a payment by summing a guard's completed, unpaid shifts in a date range, then marks it paid. No external payment gateway is wired up.
- **File storage**: complaint attachments and guard documents are saved to `server/uploads/` via Multer and served statically at `/uploads/...`. Swap for S3/Cloudinary later without touching the API shape.
- **Registration**: public self-registration only allows `guard` and `client` roles. The `admin` account is provisioned via the seed script (`npm run seed`), never through the public API.
