# Aurex — AI-Powered Portfolio Intelligence

Aurex is a premium AI-powered portfolio intelligence platform for simulated investments, crypto assets, stocks and educational financial analysis.

This repository is the **Aurex frontend** (Next.js). It runs fully in **mock mode** by default; switch to **api mode** to connect to the Spring Boot backend.

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/dashboard` | Portfolio terminal overview |
| `/markets` | Market assets and tickers |
| `/portfolio` | Holdings, performance, allocation |
| `/alerts` | Price alerts and event log |
| `/ai-insights` | AI portfolio analysis (educational) |
| `/settings` | Account and preferences UI |

## Environment

Copy the example file:

```bash
cp .env.example .env.local
```

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080/api` | Base URL of Spring Boot REST API |
| `NEXT_PUBLIC_DATA_MODE` | `mock` | `mock` = local data; `api` = real HTTP calls |

### Mock vs API mode

```env
# Mock (default) — no backend required
NEXT_PUBLIC_DATA_MODE=mock

# Live API — requires backend on port 8080 + JWT for protected routes
NEXT_PUBLIC_DATA_MODE=api
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

In **api** mode, if the backend is unreachable (network error), services fall back to mock data with a console warning so the UI keeps working during development.

**Auth:** `/login` page (React Hook Form + Zod) calls `auth.service.login()` and stores the JWT in `localStorage` (`aurex_token`). In **api** mode, internal routes (`/dashboard`, `/portfolio`, …) require a token and redirect to `/login`. In **mock** mode, navigation works without signing in.

### Test login with backend

1. Start Spring Boot on port `8080` and register a user (e.g. via `POST /api/auth/register` or existing seed).
2. In `.env.local`:

   ```env
   NEXT_PUBLIC_DATA_MODE=api
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
   ```

3. Run `pnpm dev` and open [http://localhost:3000/login](http://localhost:3000/login).
4. Sign in with your backend email/password → redirect to `/dashboard`.
5. Sign out from the header menu or Settings → returns to `/login` (api) or `/` (mock).

Do **not** put API keys, JWT secrets, or LLM/market provider credentials in this frontend.

## API integration

| Path | Role |
|------|------|
| `lib/config.ts` | `API_BASE_URL`, `DATA_MODE`, `IS_MOCK_MODE` |
| `lib/api-client.ts` | HTTP client (Bearer token, `ApiResponse` unwrap, errors) |
| `lib/api/config.ts` | `API_ENDPOINTS` path map |
| `lib/api/mappers.ts` | Backend DTO → frontend types |
| `lib/api/with-data-source.ts` | `mock` / `api` branch + optional fallback |
| `services/*.ts` | Domain functions (`auth`, `market`, `portfolio`, `alerts`, `ai`) |

### Backend endpoints used

- **Auth:** `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- **Market:** `GET /market/ticker`, `/market/assets`, `/market/history/{symbol}`
- **Portfolios:** CRUD + `/summary`, `/holdings`
- **Transactions:** `POST /transactions`, `GET /transactions?portfolioId=`
- **Alerts:** `GET/POST /alerts`, `PATCH /alerts/{id}/toggle`, `GET /alerts/events`
- **AI:** `POST /ai/portfolio-summary/{id}`, `GET /ai/analyses`

## Project structure

```
lib/
  api-client.ts       # fetch wrapper
  config.ts           # env flags
  api/
    config.ts         # endpoint paths
    mappers.ts        # DTO mapping
    with-data-source.ts
services/
  auth.service.ts
  market.service.ts
  portfolio.service.ts
  alerts.service.ts
  ai.service.ts
```

## Technical documentation

See the [`docs/`](./docs/) folder for architecture, database model, API reference, security, roadmap, and deployment guides (Spanish, suitable for academic or portfolio review).

## Disclaimer

Aurex is an educational portfolio intelligence platform. It does not execute real trades and does not provide financial advice.
