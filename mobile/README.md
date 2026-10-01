# School ERP - Parent & Student app

Expo (React Native) app for parents and students. It talks only to the backend API in `../backend` (see `../backend/docs/API.md`).

## Run

```bash
cp .env.example .env     # set EXPO_PUBLIC_API_URL
npm install
npx expo start           # scan the QR code with Expo Go
```

On a real phone `localhost` is the phone itself: set `EXPO_PUBLIC_API_URL` to your computer's LAN address, e.g. `http://192.168.1.20:4000`, and keep both on the same Wi-Fi.

## What is in it

- Sign in with the same parent / student login as the web portal; tokens are kept in the device keychain and refreshed automatically
- Home: child summary, attendance %, fees due, upcoming classes, announcements
- Classes: live and upcoming online classes with a Join button, past classes
- Attendance, Academics (assignments, exams, results, report cards), Fees
- Parents with more than one child switch between them with the chips at the top; pull down to refresh

## Layout

- `src/app/` - screens (Expo Router). `sign-in.tsx` is public, everything under `(app)/` requires a session
- `src/lib/api.ts` - API client and token handling
- `src/lib/session.tsx`, `src/lib/portal.tsx` - session and portal data providers
- `src/components/` - shared UI
