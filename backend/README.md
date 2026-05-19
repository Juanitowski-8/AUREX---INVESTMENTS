# Aurex Backend

**Aurex — AI-Powered Portfolio Intelligence** — REST API (Spring Boot) for the Aurex frontend.

Phase 1: PostgreSQL, Flyway, CORS, Actuator. **Authentication** (register, login, JWT, `/api/auth/me`) is implemented with Spring Security, BCrypt, and role-based users (`USER`, `ADMIN`).

## Stack

- Java 21
- Spring Boot 3.3.5
- Gradle
- Spring Web, Security, Data JPA
- PostgreSQL 16 + Flyway
- JWT (jjwt)
- Spring Actuator
- Lombok
- Docker Compose (PostgreSQL)

## Prerequisites

- **JDK 21**
- **Docker** (for PostgreSQL) or a local PostgreSQL 16 instance
- **Gradle 8.x** (optional if you use the wrapper)

## Quick start

### 1. PostgreSQL with Docker

From the project root:

```bash
docker compose up -d
```

Defaults (override via `.env` or environment):

| Variable | Default |
|----------|---------|
| `POSTGRES_DB` | `aurex_db` |
| `POSTGRES_USER` | `aurex_user` |
| `POSTGRES_PASSWORD` | `aurex_password` |
| Port | `5432` |

Check health:

```bash
docker compose ps
```

### 1b. Redis (market data cache)

`docker compose up -d` also starts **Redis 7** on port `6379`. The API caches `/api/market/ticker` and `/api/market/history` for **60 seconds** (configurable).

| Variable | Default |
|----------|---------|
| `REDIS_HOST` | `localhost` |
| `REDIS_PORT` | `6379` |

Verify:

```bash
docker compose ps
redis-cli ping
```

If Redis is down, market endpoints still work (cache bypass with a warning in logs). For production with external APIs, keep Redis running to avoid rate limits.

Disable cache locally: `AUREX_MARKET_CACHE_ENABLED=false` in env or `aurex.market.cache-enabled: false`.

### CoinGecko (live crypto prices)

Public API, no API key required. Enable with:

```env
AUREX_MARKET_PROVIDER=coingecko
```

Crypto assets use `external_id` from the DB (`bitcoin`, `ethereum`, …). Stocks/ETF still use mock fallback. On CoinGecko errors or rate limits (429), the app logs a warning and falls back to mock prices without crashing. Redis cache (60s) reduces outbound calls.

```bash
GET /api/market/ticker?symbols=BTC,ETH,SOL
Authorization: Bearer <token>
```

### 2. Environment

```bash
cp .env.example .env
```

Set a strong JWT secret for local dev (min. 32 characters):

```env
JWT_SECRET=your-local-dev-secret-at-least-32-chars
```

### 3. Run the API

**Opción A — Sin Docker (recomendado para empezar)**  
Usa perfil `local`: base de datos H2 en memoria y sin Redis.

```powershell
.\gradlew.bat bootRun
```

Por defecto `bootRun` activa el perfil `local`. API: **http://localhost:8080**

**Opción B — Con PostgreSQL + Redis (producción-like)**

```powershell
docker compose up -d
.\gradlew.bat bootRun -Dspring.profiles.active=default
```

Asegúrate de tener `JWT_SECRET` en variables de entorno (mín. 32 caracteres).

API base URL: **http://localhost:8080**

### 4. Verify

| Endpoint | Auth | Description |
|----------|------|-------------|
| `GET /api/health` | Public | Application health (`ApiResponse`) |
| `GET /actuator/health` | Public | Spring Actuator health |
| `POST /api/auth/register` | Public | Create user + JWT |
| `POST /api/auth/login` | Public | Login + JWT |
| `GET /api/auth/me` | Bearer JWT | Current user |

```bash
curl http://localhost:8080/api/health
```

## Authentication

### Register — `POST /api/auth/register`

Request:

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

Response `201`:

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "expiresIn": 86400000,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "role": "USER"
    }
  },
  "message": null,
  "timestamp": "2026-05-18T12:00:00Z"
}
```

Validation: valid email, password min. 8 characters. Duplicate email → `409` with code `EMAIL_ALREADY_EXISTS`.

### Login — `POST /api/auth/login`

Request:

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

Response `200`: same `AuthResponse` shape as register.

Invalid credentials → `401` with code `INVALID_CREDENTIALS`.

### Current user — `GET /api/auth/me`

Header: `Authorization: Bearer <accessToken>`

Response `200`:

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "role": "USER"
  }
}
```

Without token or invalid token → `401`.

### Test with Postman or Thunder Client

1. Start PostgreSQL (`docker compose up -d`) and the API (`.\gradlew.bat bootRun`).
2. **Register:** `POST http://localhost:8080/api/auth/register`, body **raw JSON** (examples above).
3. Copy `data.accessToken` from the response.
4. **Me:** `GET http://localhost:8080/api/auth/me` → tab **Auth** → type **Bearer Token** → paste the token.  
   Or add header: `Authorization: Bearer <token>`.
5. **Login:** `POST http://localhost:8080/api/auth/login` with the same email/password.

Thunder Client (VS Code): New Request → set method/URL → Body → JSON → for `/me`, use the Auth section with Bearer token.

### cURL examples

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"fullName\":\"Jane Doe\",\"email\":\"jane@example.com\",\"password\":\"password123\"}"

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jane@example.com\",\"password\":\"password123\"}"

# Me (replace TOKEN)
curl http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

> If you previously ran an older Flyway schema (e.g. with `plan` column), reset the DB: `docker compose down -v` then `docker compose up -d`.

## Configuration

Main settings: `src/main/resources/application.yml`

| Property / env | Description |
|----------------|-------------|
| `SERVER_PORT` | HTTP port (default `8080`) |
| `SPRING_DATASOURCE_URL` | JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB user |
| `SPRING_DATASOURCE_PASSWORD` | DB password |
| `JWT_SECRET` | HMAC secret for JWT (required in production) |
| `JWT_EXPIRATION_MS` | Token TTL (default 24h) |
| `CORS_ALLOWED_ORIGINS` | Frontend origin(s), default `http://localhost:3000` |
| `REDIS_HOST` / `REDIS_PORT` | Redis for market cache |
| `aurex.market.cache-ttl-seconds` | Market cache TTL (default `60`) |
| `AUREX_AI_PROVIDER` | AI LLM provider: `mock` (default), `openai`, or `anthropic` |
| `OPENAI_API_KEY` | OpenAI API key (server-side only; never expose to frontend) |
| `OPENAI_MODEL` | Model id (default `gpt-4o-mini`) |
| `OPENAI_TIMEOUT_SECONDS` | OpenAI HTTP timeout (default `20`) |
| `ANTHROPIC_API_KEY` | Anthropic API key (server-side only) |
| `ANTHROPIC_MODEL` | Claude model id (default `claude-3-5-haiku-20241022`) |

### AI portfolio analysis (LLM)

Educational analysis is generated **only on the backend**. The frontend calls `POST /api/ai/portfolio-summary/{portfolioId}`; no API keys are sent to the client.

| Provider | When |
|----------|------|
| `mock` (default) | Rule-based educational text from portfolio metrics |
| `openai` | Calls OpenAI Chat Completions when `OPENAI_API_KEY` is set; on failure → **fallback to mock** |
| `anthropic` | Calls Anthropic Messages API when `ANTHROPIC_API_KEY` is set; on failure → **fallback to mock** |

```env
AUREX_AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

```env
AUREX_AI_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-...
```

**Sent to the LLM (sanitized metrics only):** portfolio name, base currency, total value, total PnL, PnL %, risk level, holding symbols, allocation weights, best/worst asset symbols with PnL %.

**Never sent:** email, password, JWT, API keys, or other PII.

Results are stored in `ai_analyses` with a fixed disclaimer: *Educational insights only. Not financial advice.*

## Project structure

```
src/main/java/com/aurex/backend/
├── AurexBackendApplication.java
├── config/          # Security, CORS, JWT properties
├── common/          # ApiResponse, exceptions, JWT, health
├── auth/            # Register, login, /me
├── user/            # User entity & repository
├── portfolio/       # Phase 2+
├── market/          # Phase 2+
├── alert/           # Phase 2+
└── ai/              # AI analysis + LLM providers (OpenAI / mock)

src/main/resources/
├── application.yml
└── db/migration/    # Flyway SQL
```

## JSON responses

Success wrapper (`ApiResponse`):

```json
{
  "success": true,
  "data": { },
  "message": null,
  "timestamp": "2026-05-18T12:00:00Z"
}
```

Errors (`ApiError`):

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Resource not found",
  "timestamp": "2026-05-18T12:00:00Z"
}
```

## Security

- Stateless JWT (HMAC, secret via `JWT_SECRET`, TTL via `JWT_EXPIRATION_MS`).
- Passwords hashed with BCrypt; `passwordHash` is never exposed in API responses.
- Public: `GET /api/health`, `/actuator/health`, `/actuator/info`, `POST /api/auth/register`, `POST /api/auth/login`.
- Protected: `GET /api/auth/me` and all other routes (future modules).
- CORS: `CORS_ALLOWED_ORIGINS` (default `http://localhost:3000`).

## Deploy on Render (Docker)

The repo includes `backend/Dockerfile` (multi-stage Gradle build, JRE 21, port **10000**).

**Web service (Docker):** set root directory to `backend` (or build context `backend/`).

**Recommended env vars for first deploy (no Redis):**

| Variable | Value |
|----------|--------|
| `SERVER_PORT` | `10000` |
| `SPRING_DATASOURCE_URL` | JDBC URL from Render PostgreSQL |
| `SPRING_DATASOURCE_USERNAME` | from Postgres service |
| `SPRING_DATASOURCE_PASSWORD` | from Postgres service |
| `JWT_SECRET` | long random secret (32+ chars) |
| `CORS_ALLOWED_ORIGINS` | your frontend URL (e.g. Vercel) |
| `AUREX_MARKET_PROVIDER` | `mock` |
| `AUREX_AI_PROVIDER` | `mock` |
| `AUREX_MARKET_CACHE_ENABLED` | `false` |

When you add Render Key Value (Redis/Valkey), set `REDIS_URL` (e.g. `redis://...`) and `AUREX_MARKET_CACHE_ENABLED=true`.

## Build & test

```bash
./gradlew build
```

## Frontend integration

Point the Next.js app to:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
NEXT_PUBLIC_USE_MOCK_API=false
```

When backend endpoints are implemented, paths should align with `lib/api/config.ts` in the frontend (`/auth`, `/market`, `/portfolios`, `/alerts`, `/ai`, …).

## Full-stack documentation

Technical docs (architecture, API, database, security, roadmap, deployment) live in the frontend repo: [`../Aurex-frontend/docs/`](../Aurex-frontend/docs/) (or sibling path `Aurex-frontend/docs/`).

## Disclaimer

Aurex is an educational portfolio intelligence platform. It does not execute real trades and does not provide financial advice.
