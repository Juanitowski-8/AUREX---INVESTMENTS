# Aurex — Auditoría de funcionalidades

Plataforma educativa de simulación. **No hay trading real** ni conexión a brokers.

## Producción

| Servicio | URL |
|----------|-----|
| Frontend | https://aurex-investments.vercel.app |
| Backend API | https://aurex-backend-qthi.onrender.com/api |

## Variables de entorno (frontend)

```env
NEXT_PUBLIC_DATA_MODE=api
NEXT_PUBLIC_API_BASE_URL=https://aurex-backend-qthi.onrender.com/api
```

Sin `NEXT_PUBLIC_DATA_MODE=api`, el frontend usa datos **mock** locales (badge “Demo mode”).

---

## Matriz por pantalla

| Pantalla | Modo API | Modo mock | Notas |
|----------|----------|-----------|--------|
| **Login / Register** | ✅ | ✅ demo | JWT + redirect; sin fallback silencioso a mock en auth |
| **Forgot / Reset password** | ✅ | ✅ token demo | |
| **Dashboard** | ✅ | ✅ | Portafolio activo; transacciones; insight IA desde último reporte; errores visibles |
| **Portfolio** | ✅ | ✅ | Crear portafolio, transacciones, análisis IA; holdings desde API o txs mock |
| **AI Insights** | ✅ | ✅ | Análisis desde holdings reales; historial por portafolio |
| **Markets** | ✅ | ✅ | Lista desde API; sparkline 24h (no OHLC histórico); búsqueda local |
| **Alerts** | ✅ | ✅ | CRUD completo; eventos |
| **Settings** | ✅ perfil | ✅ | Perfil/contraseña en API; notificaciones/tema **no persisten** |
| **Landing** | ⚠️ parcial | ✅ | API: ticker en vivo; hero portfolio solo en mock |

---

## Flujo E2E recomendado (modo API)

1. Registro / login → JWT (`aurex_token`)
2. Crear portafolio (empty state)
3. Add Transaction → precio de mercado automático → `POST /api/transactions`
4. Dashboard / Portfolio → holdings y summary actualizados
5. AI Insights → Generate new analysis → `POST /api/ai/portfolio-summary/{id}`
6. Alerts → crear regla → `POST /api/alerts`
7. Logout; 401 redirige a `/login`

---

## Implementado (backend cableado)

- Auth: register, login, me, PATCH me, forgot/reset password
- Portfolios: list, create, detail, summary, holdings
- Transactions: create, list (UI usa create; listado sin pantalla dedicada)
- Market: ticker, assets, history
- Assets: `/api/assets/{symbol}` (precio unitario en transacciones)
- Alerts: CRUD, events
- AI: generate, list, get by id

---

## Oculto / no funcional (intencional)

- Markets: Trade, Watchlist; columna Action eliminada
- Settings: 2FA, sesiones, borrar cuenta; toggles de notificaciones/moneda/tema
- Gráficos portfolio: performance derivada de BTC (no historial propio del portafolio)
- Markets: mini-gráficos = tendencia 24h, no precio histórico real
- `DELETE` transacciones / `PUT` portfolios: backend existe, UI no expuesta

---

## Comportamiento lógico clave

- **Portafolio activo:** `sessionStorage` + selector; en mock también respeta caché (no solo Alex).
- **Tras transacción o análisis:** evento `aurex-portfolio-updated` refresca dashboard/portfolio/AI.
- **Errores API:** sin fallback silencioso a mock en auth, portfolio, market, AI, alertas mutaciones.
- **Búsqueda header:** Enter → `/markets?search=...` (filtro en página Markets).

---

## Futuro

- Landing con métricas de portafolio en modo API (usuario logueado)
- Historial de transacciones en UI
- Preferencias de usuario en backend
- Filtros de periodo en gráficos
- Watchlist de mercados
