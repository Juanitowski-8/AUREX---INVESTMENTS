# Roadmap — Aurex

Este documento separa explícitamente lo **ya implementado** de lo **planificado**. Las fechas son orientativas para presentación académica o portafolio.

---

## Visión

Construir una plataforma educativa de inteligencia de portafolios simulados, con UX premium, backend robusto y extensiones opcionales (escritorio, notificaciones).

---

## Fase 1 — MVP (Current Status)

**Objetivo:** demostrar flujo completo local y en modo mock.

| Área | Entregado |
|------|-----------|
| **Backend core** | Spring Boot, PostgreSQL, Flyway, Docker Compose |
| **Auth** | Register, login, JWT, BCrypt, `/me` |
| **Portafolios** | CRUD, summary, holdings, transacciones BUY/SELL |
| **Activos** | Catálogo seed, búsqueda |
| **Mercado** | Mock + CoinGecko, Redis cache, ticker/history |
| **Alertas** | CRUD, toggle, eventos, job de evaluación |
| **IA** | Análisis educativo mock + OpenAI/Anthropic con fallback |
| **Frontend** | Landing, dashboard, mercados, portafolio, alertas, AI, settings |
| **Integración** | `NEXT_PUBLIC_DATA_MODE`, api-client, mappers |
| **Login UI** | `/login`, AuthGuard en modo api, logout |

**Limitaciones conocidas del MVP**

- Token en `localStorage`.
- Registro solo vía API (UI de registro planned).
- Performance chart del portafolio derivada parcialmente en frontend en modo api.
- Sin despliegue productivo automatizado aún.

---

## Fase 2 — Producto conectado (Planned / en progreso)

| Ítem | Estado |
|------|--------|
| Despliegue frontend (Vercel) + backend (Render/Railway) | Planned |
| PostgreSQL gestionado (Neon/Supabase) | Planned |
| Redis gestionado (Upstash) | Planned |
| UI de registro | Planned |
| Cookies seguras / refresh token | Planned |
| CI/CD (GitHub Actions: test + build) | Planned |
| Documentación OpenAPI / Swagger | Planned |
| Mejoras de observabilidad (logs estructurados, métricas) | Planned |
| Tests E2E frontend (Playwright) | Planned |

---

## Fase 3 — Inteligencia y escala (Planned)

| Ítem | Descripción |
|------|-------------|
| Historial de performance persistido | Series temporales de valor de portafolio en BD |
| Más proveedores de mercado | Acciones/ETF en vivo con API con licencia |
| Personalización de prompts IA | Por idioma o nivel de detalle |
| Export PDF de informes IA | Para entregables académicos |
| Multi-portafolio avanzado | Comparativas y benchmarks simulados |
| Roles admin | Panel de usuarios y métricas de uso |

---

## Cliente de escritorio (Planned)

**Objetivo:** terminal Aurex instalable (Windows/macOS/Linux).

| Opción | Notas |
|--------|-------|
| **Electron** | Reutiliza UI web; empaquetado familiar |
| **Tauri** | Binario más ligero; Rust en shell |

**Alcance tentativo**

- Misma API REST; almacenamiento seguro de token en keychain OS.
- Modo offline limitado (solo mock o caché local).
- Notificaciones nativas de escritorio para alertas (sin depender de WhatsApp).

**Current Status:** no iniciado; solo diseño en roadmap.

---

## OpenWA — WhatsApp (Planned, opcional)

**OpenWA** (u otra integración WhatsApp Business API) se considera una **mejora futura opcional**, no parte del MVP.

**Uso previsto**

- Enviar notificación cuando `alert_events` registre un disparo.
- Mensaje educativo, sin recomendaciones de trading.

**Consideraciones**

- Políticas de Meta y coste operativo.
- Servicio worker separado del API principal.
- Consentimiento explícito del usuario (opt-in).
- No sustituye alertas in-app actuales.

**Current Status:** no implementado; sin dependencias en el repositorio.

---

## Matriz resumen

| Capacidad | Fase 1 (hoy) | Fase 2 | Fase 3 | Desktop | OpenWA |
|-----------|--------------|--------|--------|---------|--------|
| Auth JWT | ✅ | Mejoras | — | ✅ plan | — |
| Portafolio simulado | ✅ | Deploy | Analytics | ✅ | — |
| Mercado live | ✅ CoinGecko | Prod cache | Más feeds | — | — |
| Alertas in-app | ✅ | Deploy | Push native | ✅ | Opcional |
| IA educativa | ✅ | Deploy | PDF/export | — | — |
| Login UI | ✅ | Register UI | — | — | — |

Leyenda: ✅ = Current Status implementado; celdas “plan” = Planned.

---

## Criterios de éxito por fase

**Fase 1:** demo end-to-end en local con backend + frontend en modo `api`.  
**Fase 2:** URL pública estable, secretos en PaaS, CI verde en PR.  
**Fase 3:** informes IA exportables y datos históricos consultables.  
**Desktop / OpenWA:** solo si hay requisito de producto o investigación adicional.
