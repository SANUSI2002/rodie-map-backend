# Roadimap API

Backend for **Roadimap — Wragby Product Roadmap Platform**, built to match the `roadimap-prototype-fixed.html` mockup: products → modules → nested features, role-based internal dashboard (Gantt/Kanban/List), and a public read-only roadmap.

Stack: **NestJS + Prisma + PostgreSQL**, JWT auth.

## 1. Data model

Mirrors the prototype's in-memory arrays exactly:

- **Product** — `name, description, color, icon, visibility (PUBLIC/PRIVATE)`
- **Module** — belongs to a Product (e.g. "FX Sales", "Proposals")
- **Feature** — belongs to a Product + optional Module, optional `parentId` for nested sub-features (unlimited depth, cascade-deletes children), `status`, `progress`, `priority (1–5)`, `startDate/endDate/relaunchDate`, `owner`, `visibility`
- **User** — `name, email, password, role, active`

Roles (from the prototype's user list + invite modal): `SUPER_ADMIN, PRODUCT_MANAGER, PRODUCT_TEAM_LEAD, DEVELOPER, SALES, MARKETING, MANAGEMENT, ADMIN_VIEWER, VIEWER`.
`VIEWER` mirrors the prototype's `isViewer()`/`canEdit()` — viewers can read everything but not create/edit/delete. User management (`/users` mutations) is restricted to `SUPER_ADMIN`.

## 2. Local setup

```bash
npm install
cp .env.example .env          # fill in DATABASE_URL + JWT_SECRET
npx prisma migrate dev --name init
npm run prisma:seed           # loads the same demo data as the prototype
npm run start:dev
```

API will be live at `http://localhost:4000/api`.

Default seeded login: **dami@wragby.com / password123** (SUPER_ADMIN). All other seeded users share the same password for local testing.

> Note: `npx prisma generate` needs to reach `binaries.prisma.sh` to download the query engine. It couldn't run in this sandboxed environment (outbound network is restricted to a small allowlist), so it hasn't been verified end-to-end here — but it will work normally on your machine or on Render, which have open network access. Run it right after `npm install`.

## 3. Deploying (Render, matching your existing setup)

1. Push this repo to GitHub.
2. Create a **PostgreSQL** instance on Render, copy its internal connection string into `DATABASE_URL`.
3. Create a **Web Service** from the repo:
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npx prisma migrate deploy && npm run start:prod`
   - Env vars: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (your Next.js frontend URL)
4. Run `npm run prisma:seed` once (Render Shell) to load demo data, or skip it and invite real users via `/api/users`.

## 4. Auth

`POST /api/auth/login` `{ email, password }` → `{ accessToken, user }`. Send `Authorization: Bearer <token>` on every other request. `GET /api/auth/me` returns the current session (equivalent to the prototype's `session` object: name, role, initials).

## 5. Endpoints

| Method | Path | Notes |
|---|---|---|
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Current user |
| GET | `/api/products` | All products (internal) |
| POST/PATCH/DELETE | `/api/products[/:id]` | Editor role required |
| PATCH | `/api/products/:id/toggle-visibility` | Same as prototype's `toggleProductVisibility()` |
| GET | `/api/modules?productId=` | Modules for a product |
| POST/PATCH/DELETE | `/api/modules[/:id]` | Editor role required |
| GET | `/api/features?productId=&moduleId=&status=&priority=&visibility=&search=` | Flat filtered list (comma-separate multi-value filters) |
| GET | `/api/features/tree?...` | Nested product → module → feature tree, for Gantt/Kanban/List rendering |
| POST/PATCH/DELETE | `/api/features[/:id]` | Editor role required; marking `status: RELEASED` auto-fills `progress` to 100 unless you send your own value |
| GET | `/api/users` | List (any authenticated user) |
| POST | `/api/users` | Invite — SUPER_ADMIN only, returns a `tempPassword` if none supplied |
| PATCH/DELETE | `/api/users/:id` | SUPER_ADMIN only |
| GET | `/api/dashboard/stats?product=&period=month\|quarter\|year` | Rollups for the dashboard view |
| GET | `/api/reports/features.csv?...` | CSV download, same filters as `/features` |
| GET | `/api/public/products` | No auth — PUBLIC products only (landing page) |
| GET | `/api/public/roadmap?productId=` | No auth — public read-only roadmap tree |
| GET | `/api/public/features` | No auth — flat public feature list |

All internal routes require a valid JWT except the `/api/public/*` group and `/api/auth/login`.

## 6. Project layout

```
prisma/schema.prisma   # data model
prisma/seed.ts         # loads the prototype's demo data
src/auth/              # login, JWT strategy, guards, @Public()/@RequireEditor()/@Roles()
src/users/             # user management (invite, deactivate)
src/products/          # products CRUD + progress rollups
src/modules/           # per-product modules CRUD
src/features/          # feature CRUD, filtering, tree building
src/dashboard/         # dashboard stats
src/reports/           # CSV export
src/public/            # unauthenticated public roadmap
```
