# School ERP

API-first school management platform. Three independently deployable parts share one backend API.

This repository holds the web frontend and the mobile app. The API is a separate repository, [Tatu1984/schoolerpbackend](https://github.com/Tatu1984/schoolerpbackend); clone it into `backend/` for local development (that folder is git-ignored here).

| Folder | What it is | Runs on |
|---|---|---|
| `backend/` | REST API (Next.js route handlers + Prisma + PostgreSQL/Neon). The only part that touches the database. | `http://localhost:4000` |
| `frontend/` | Web app: staff dashboard (`/dashboard`) and parent/student portal (`/portal`). Holds no data; calls the API. | `http://localhost:3000` |
| `mobile/` | Parent & student app (Expo / React Native). Calls the API directly. | Expo Go / device |
| `docs/` | Statement of work, diagrams, and legacy notes. | |

## Run locally

```bash
# 1. API
cd backend && cp .env.example .env   # fill in DATABASE_URL and JWT_SECRET
npm install && npm run dev

# 2. Web
cd frontend && cp .env.example .env.local   # fill in NEXTAUTH_SECRET
npm install && npm run dev

# 3. Mobile
cd mobile && cp .env.example .env   # on a phone, set EXPO_PUBLIC_API_URL to your computer's LAN IP
npm install && npx expo start
```

Demo data: `cd backend && npm run db:seed:demo` (safe to re-run; also moves the live demo class to "now").

## How authentication works

- `POST /api/v1/auth/login` returns an access token (8 h) and a refresh token (30 days). Every other call sends `Authorization: Bearer <accessToken>`.
- The mobile app stores both tokens in the device keychain and refreshes automatically.
- The web app signs in through NextAuth, which calls the same login endpoint and keeps the access token inside its encrypted session cookie. Pages call `/api/*` on the frontend, and `frontend/app/api/[...path]/route.ts` forwards each call to the backend with the token. The token is never exposed to browser JavaScript.
- Parents and students can only reach `/api/portal/*` and `/api/auth/*`; staff cannot reach `/api/portal/*`.

See `docs/API.md` in the backend repository for the endpoints the mobile app uses.

## Deploy

The API and the web frontend are separate Vercel projects. For this repository's project, set **Root Directory** to `frontend`. Set `API_URL` on the frontend to the backend's URL. Build the mobile app with EAS and set `EXPO_PUBLIC_API_URL` to the same URL.
