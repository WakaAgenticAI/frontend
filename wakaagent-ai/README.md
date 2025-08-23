# WakaAgent AI — Frontend (Next.js)

A Next.js 15 app for WakaAgent AI: authentication, orders, reports, and an AI chat interface with realtime updates.

## Features

- Login to backend (`POST /auth/login`) and store JWT in `localStorage`.
- API helpers (`lib/api.ts`) auto-attach `Authorization: Bearer <token>`.
- Orders UI: fetch customers/products and create orders.
- Reports UI: trigger Daily Sales and Monthly Audit; opens `download_url` if provided by backend.
- Chat UI: Socket.IO realtime under `/ws` namespace `/chat`.

## Prerequisites

- Node 18+
- Backend API running (FastAPI). See `backend/README.md`.

## Local Development

1. Create `.env.local`:
   ```bash
   NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000/api/v1
   ```
   Adjust port to match your backend (e.g., `8002`).

2. Install deps and run:
   ```bash
   npm i --legacy-peer-deps
   npm run dev
   # App on http://localhost:3000
   ```

## Environment

- `NEXT_PUBLIC_API_BASE` (required): full API base including `/api/v1`.
  - Example: `https://api.yourdomain.com/api/v1`.
- The WebSocket URL is derived from `NEXT_PUBLIC_API_BASE` origin automatically (e.g., `wss://api.yourdomain.com/ws`).

## Production (Vercel)

- Set Environment Variables in Vercel → Project → Settings:
  ```
  NEXT_PUBLIC_API_BASE=https://api.yourdomain.com/api/v1
  ```
- Re-deploy after changing env vars.
- Ensure your backend CORS allows your Vercel domain and your proxy supports WebSocket upgrades to `/ws`.

## Reports Downloads

- Backend must expose generated files via public URLs.
- Recommended: mount static at `/reports-files/` that serves `REPORTS_EXPORT_DIR`, and include `download_url` in `GET /admin/reports/*/latest` responses.
- The Reports tab will open `download_url` in a new tab when present.

## Notes

- If you change `NEXT_PUBLIC_API_BASE`, rebuild and redeploy.
- We do not send cookies; CORS can keep `allow_credentials` off when using Bearer tokens.
