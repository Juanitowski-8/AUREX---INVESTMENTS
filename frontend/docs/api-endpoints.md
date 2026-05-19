# API REST — Aurex

## Base URL

| Entorno | URL típica |
|---------|------------|
| Local | `http://localhost:8080/api` |
| Producción | Configurar en despliegue (ver [deployment.md](./deployment.md)) |

Prefijo común: **`/api`**. El frontend usa `NEXT_PUBLIC_API_BASE_URL` apuntando a esa base (incluye `/api`).

---

## Formato de respuesta

### Éxito

```json
{
  "success": true,
  "data": { },
  "message": null,
  "timestamp": "2026-05-18T12:00:00Z"
}
```

### Error

```json
{
  "success": false,
  "code": "NOT_FOUND",
  "message": "Resource not found",
  "timestamp": "2026-05-18T12:00:00Z"
}
```

---

## Autenticación

| Método | Ruta | Auth | Current Status |
|--------|------|------|----------------|
| `POST` | `/auth/register` | No | Implementado |
| `POST` | `/auth/login` | No | Implementado |
| `GET` | `/auth/me` | Bearer JWT | Implementado |

### `POST /auth/register`

**Body**

```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response `data`:** `accessToken`, `tokenType`, `expiresIn`, `user` (id, fullName, email, role).

### `POST /auth/login`

**Body**

```json
{
  "email": "jane@example.com",
  "password": "password123"
}
```

**Response:** igual que register.

### `GET /auth/me`

**Headers:** `Authorization: Bearer <accessToken>`

**Response `data`:** usuario actual.

---

## Portfolios

Base: `/portfolios` — todas requieren JWT. Solo se accede a portafolios del usuario autenticado.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/portfolios` | Listar portafolios del usuario |
| `POST` | `/portfolios` | Crear portafolio |
| `GET` | `/portfolios/{id}` | Detalle |
| `PUT` | `/portfolios/{id}` | Actualizar nombre/descripción/moneda |
| `DELETE` | `/portfolios/{id}` | Eliminar |
| `GET` | `/portfolios/{id}/summary` | Valor total, P/L, riesgo, allocation, best/worst |
| `GET` | `/portfolios/{portfolioId}/holdings` | Posiciones abiertas |

**Planned:** endpoints dedicados `/performance` y `/allocation` (hoy el summary incluye allocation; performance puede derivarse en cliente).

---

## Assets (catálogo)

Base: `/assets` — JWT requerido.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/assets` | Listado de activos activos |
| `GET` | `/assets/search?q=` | Búsqueda por texto |
| `GET` | `/assets/{symbol}` | Detalle por símbolo |

---

## Market

Base: `/market` — JWT requerido.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/market/ticker?symbols=BTC,ETH,...` | Precios y cambio 24h |
| `GET` | `/market/assets` | Vista mercado de activos |
| `GET` | `/market/history/{symbol}?days=30` | Serie histórica (default 30 días) |

**Notas**

- Proveedor configurable: `aurex.market.provider=mock|coingecko`.
- Respuestas cacheadas en Redis (~60 s) cuando está habilitado.

---

## Transactions

Base: `/transactions` — JWT requerido.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/transactions` | Registrar BUY/SELL simulado |
| `GET` | `/transactions?portfolioId={uuid}` | Listar por portafolio |
| `DELETE` | `/transactions/{id}` | Eliminar y recalcular holdings |

**Body ejemplo `POST`**

```json
{
  "portfolioId": "uuid",
  "assetSymbol": "BTC",
  "type": "BUY",
  "quantity": 0.1,
  "price": 60000,
  "transactionDate": "2026-05-18T10:00:00Z",
  "notes": null
}
```

---

## Alerts

Base: `/alerts` — JWT requerido.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/alerts` | Reglas del usuario |
| `POST` | `/alerts` | Crear regla |
| `PUT` | `/alerts/{id}` | Actualizar regla |
| `PATCH` | `/alerts/{id}/toggle` | Activar/desactivar |
| `DELETE` | `/alerts/{id}` | Eliminar |
| `GET` | `/alerts/events` | Eventos disparados |

**Body ejemplo `POST`**

```json
{
  "assetSymbol": "BTC",
  "conditionType": "ABOVE",
  "targetPrice": 70000
}
```

**Current Status:** job backend evalúa reglas periódicamente (`aurex.alerts.evaluation-interval-ms`, default 60 s).

---

## AI

Base: `/ai` — JWT requerido.

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/ai/portfolio-summary/{portfolioId}` | Generar análisis educativo |
| `GET` | `/ai/analyses` | Listar análisis del usuario |
| `GET` | `/ai/analyses/{id}` | Detalle de un análisis |

**Response `data` (análisis)**

- `summary`, `riskLevel`, `concentrationNotes`, `observations[]`, `disclaimer`, `portfolioId`, `createdAt`

**Config LLM (solo servidor):** `AUREX_AI_PROVIDER=mock|openai|anthropic`, claves vía `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`.

---

## Health (público)

| Método | Ruta | Auth |
|--------|------|------|
| `GET` | `/health` | No |
| `GET` | `/actuator/health` | No |
| `GET` | `/actuator/info` | No |

---

## Códigos HTTP habituales

| Código | Uso |
|--------|-----|
| 200 | OK |
| 201 | Creado (register, transacciones, análisis IA) |
| 204 | Sin contenido (delete) |
| 400 | Validación / negocio (p. ej. venta sin cantidad) |
| 401 | JWT ausente o inválido |
| 404 | Recurso no encontrado o sin ownership |
| 409 | Email duplicado en registro |

---

## Frontend — consumo

**Current Status:** servicios en `services/*.ts` mapean DTOs cuando `NEXT_PUBLIC_DATA_MODE=api`.

| Servicio | Endpoints usados |
|----------|------------------|
| `auth.service.ts` | login, me (+ register en API, UI registro planned) |
| `market.service.ts` | ticker, assets, history |
| `portfolio.service.ts` | portfolios, summary, holdings, transactions |
| `alerts.service.ts` | alerts, events, toggle |
| `ai.service.ts` | portfolio-summary, analyses |
