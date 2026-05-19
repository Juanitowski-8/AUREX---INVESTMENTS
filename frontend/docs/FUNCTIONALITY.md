# Aurex — Funcionalidades implementadas

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

Sin `NEXT_PUBLIC_DATA_MODE=api`, el frontend usa datos **mock** locales.

## Flujo E2E (modo API)

1. Registro / login → JWT en `localStorage` (`aurex_token`)
2. Crear portafolio (empty state → **Create Portfolio**)
3. Añadir transacciones simuladas (BUY/SELL) → `POST /api/transactions`
4. Ver holdings y summary → `GET /api/portfolios/{id}/holdings`, `.../summary`
5. Crear alertas → `POST /api/alerts`
6. Generar análisis IA → `POST /api/ai/portfolio-summary/{id}`
7. Logout → token eliminado; 401 redirige a `/login`

## Implementado

- Auth: register, login, me, forgot/reset password, logout
- Portfolios: CRUD listado, crear, selector activo (sessionStorage)
- Transactions: crear, listar; refresco de holdings/summary
- Market: ticker, assets, history (requiere JWT)
- Alerts: CRUD, toggle, events
- AI: portfolio summary, historial de análisis
- Settings: perfil (`PATCH /api/auth/me`), cambio de contraseña, sign out

## Oculto / eliminado (no funcional)

- Markets: botones Trade y Watchlist (estrella)
- Settings: 2FA, sesiones activas, borrar cuenta; preferencias/notificaciones sin persistencia
- Gráficos: rangos 1W–1Y decorativos (pendiente filtro real)
- Landing en modo API: no carga portafolio mock de demo; solo ticker ilustrativo

## Futuro

- Persistir preferencias de usuario en backend
- Watchlist de mercados
- Filtros de periodo en gráficos de performance
- Notificaciones push/email reales
