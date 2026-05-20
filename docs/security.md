# Seguridad — Aurex

## Enfoque

Aurex maneja datos de usuarios y métricas financieras **simuladas**. La seguridad prioriza: autenticación stateless, secretos solo en servidor, minimización de datos enviados a LLM, y CORS acotado al frontend.

---

## Current Status

### JWT (JSON Web Tokens)

- Emitidos en `POST /api/auth/login` y `POST /api/auth/register`.
- Firmados con HMAC; secreto en variable **`JWT_SECRET`** (mín. 32 caracteres recomendados).
- TTL configurable: **`JWT_EXPIRATION_MS`** (default 24 h).
- El cliente envía: `Authorization: Bearer <accessToken>`.
- Filtro `JwtAuthenticationFilter` valida token en cada petición protegida.
- API stateless: `SessionCreationPolicy.STATELESS`.

**Almacenamiento en frontend (MVP)**

- Token en **`localStorage`** (`aurex_token`).
- **Riesgo conocido:** vulnerable a XSS; aceptable para MVP/demo. **Planned:** migrar a cookies `httpOnly` + SameSite en despliegue productivo.

### BCrypt

- Contraseñas hasheadas con **`BCryptPasswordEncoder`** antes de persistir en `users.password_hash`.
- El hash **nunca** se incluye en respuestas JSON.
- Login compara con `matches()`; mensajes genéricos en credenciales inválidas.

### CORS

- Configuración Spring: orígenes permitidos vía **`CORS_ALLOWED_ORIGINS`** (default `http://localhost:3000`).
- Credenciales y métodos estándar para SPA Next.js en desarrollo.

### Rutas públicas vs protegidas

**Públicas (sin JWT)**

- `GET /api/health`, `/actuator/health`, `/actuator/info`
- `POST /api/auth/register`, `POST /api/auth/login`

**Protegidas**

- Resto de `/api/**` incluyendo `GET /api/auth/me`
- Ownership: portafolios, alertas y análisis filtrados por `user_id` del JWT

### Variables de entorno

| Variable | Dónde | Contenido |
|----------|-------|-----------|
| `JWT_SECRET` | Solo backend | Secreto HMAC |
| `JWT_EXPIRATION_MS` | Backend | Vida del token |
| `OPENAI_API_KEY` | Solo backend | LLM |
| `ANTHROPIC_API_KEY` | Solo backend | LLM alternativo |
| `SPRING_DATASOURCE_*` | Backend | PostgreSQL |
| `CORS_ALLOWED_ORIGINS` | Backend | Orígenes frontend |
| `NEXT_PUBLIC_API_BASE_URL` | Frontend | URL API (pública) |
| `NEXT_PUBLIC_DATA_MODE` | Frontend | mock / api |

**Regla:** ninguna API key de OpenAI, Anthropic o proveedores de mercado en variables `NEXT_PUBLIC_*`.

### No exponer API keys

| Correcto | Incorrecto |
|----------|------------|
| LLM y CoinGecko desde Spring Boot | Claves en `.env.local` del frontend |
| Proxy de mercado en backend | Llamada directa del browser a OpenAI |
| Documentar variables en `.env.example` sin valores reales | Commitear `.env` con secretos |

### Protección de datos (IA y prompts)

**Se envía al LLM (métricas agregadas)**

- Valor total, P/L, % P/L, moneda base, riesgo, símbolos, allocation, mejor/peor activo.

**No se envía**

- Email, contraseña, JWT, API keys, nombre completo del usuario.

**Controles adicionales**

- System prompt prohíbe asesoría y buy/sell.
- `LLMResponseValidator` rechaza patrones de recomendación directa.
- Disclaimer obligatorio en respuesta persistida.

### Protección de datos (frontend)

- Modo **`api`:** rutas internas (`/dashboard`, etc.) redirigen a `/login` sin token.
- Modo **`mock`:** sin obligación de login (demos locales).
- Logout borra token y caché de portafolio en sesión.

### CSRF

- Deshabilitado en API REST stateless con JWT en header (patrón habitual para SPA).

### Validación de entrada

- Jakarta Validation en DTOs (`@Valid`, `@Email`, tamaños mínimos de password).
- Errores normalizados vía `GlobalExceptionHandler`.

---

## Planned

- Cookies `httpOnly` / refresh tokens y rotación.
- Rate limiting en login y endpoints costosos (IA, mercado).
- HTTPS estricto en producción; HSTS en reverse proxy.
- Auditoría de accesos y alertas de seguridad.
- Escaneo de dependencias en CI (OWASP, Snyk).
- Política de Content Security Policy en Next.js.
- Cifrado de secretos en gestor (Vault, Doppler, GitHub Secrets).

---

## Checklist para despliegue

- [ ] `JWT_SECRET` fuerte y único por entorno
- [ ] PostgreSQL con usuario de mínimos privilegios
- [ ] CORS solo dominios de producción del frontend
- [ ] Redis con contraseña/TLS si expuesto
- [ ] Variables LLM solo en PaaS del backend
- [ ] No commitear `.env` con secretos reales
