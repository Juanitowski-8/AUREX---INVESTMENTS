<!-- ========================================================= -->
<!--                         AUREX                             -->
<!--          AI-Powered Portfolio Intelligence                -->
<!-- ========================================================= -->

<h1 align="center">AUREX</h1>

<p align="center">
  <strong>AI-Powered Portfolio Intelligence</strong>
</p>

<p align="center">
  Plataforma web premium para simulación, análisis y educación financiera basada en portafolios de inversión.
</p>

<p align="center">
  <a href="https://aurex-investments.vercel.app">
    <strong>🌐 Frontend público</strong>
  </a>
  ·
  <a href="https://aurex-backend-qthi.onrender.com/actuator/health">
    <strong>⚙️ Health Check Backend</strong>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloud-Vercel%20%7C%20Render-111111?style=for-the-badge&logo=vercel&logoColor=white" />
  <img src="https://img.shields.io/badge/Auth-JWT-D4AF37?style=for-the-badge" />
</p>

---

## Resumen ejecutivo

**Aurex** es una plataforma web full-stack de inteligencia financiera enfocada en la simulación, visualización y análisis educativo de portafolios de inversión.

Permite crear portafolios simulados, registrar operaciones ficticias, consultar activos de mercado, visualizar métricas financieras, crear alertas y generar análisis educativo asistido por IA.

Aurex no ejecuta trading real ni gestiona dinero real. Su propósito es educativo, analítico y demostrativo.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Problema que resuelve](#problema-que-resuelve)
- [Objetivo del proyecto](#objetivo-del-proyecto)
- [Para qué sirve Aurex](#para-qué-sirve-aurex)
- [Funcionamiento general](#funcionamiento-general)
- [Características principales](#características-principales)
- [Arquitectura de software](#arquitectura-de-software)
- [Capas de la aplicación](#capas-de-la-aplicación)
- [Stack tecnológico](#stack-tecnológico)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Modelo de datos principal](#modelo-de-datos-principal)
- [Módulos del backend](#módulos-del-backend)
- [Módulos del frontend](#módulos-del-frontend)
- [Endpoints principales](#endpoints-principales)
- [Seguridad](#seguridad)
- [Despliegue](#despliegue)
- [Variables de entorno](#variables-de-entorno)
- [Ejecución local](#ejecución-local)
- [Base de datos y migraciones](#base-de-datos-y-migraciones)
- [Estado actual](#estado-actual)
- [Roadmap](#roadmap)
- [Disclaimer financiero](#disclaimer-financiero)
- [Autor](#autor)

---

## Descripción general

**Aurex** es una plataforma web full-stack orientada a la **simulación y análisis de portafolios de inversión**.

Permite a los usuarios crear portafolios simulados, registrar operaciones ficticias, visualizar métricas financieras, consultar activos de mercado, crear alertas y generar análisis educativo asistido por inteligencia artificial.

El proyecto está diseñado con una estética **fintech premium**, combinando una interfaz moderna con una arquitectura real de software compuesta por:

- Frontend web desplegado en **Vercel**.
- Backend REST desplegado en **Render**.
- Base de datos PostgreSQL en **Neon**.
- Seguridad con **JWT**.
- Migraciones con **Flyway**.
- Separación clara entre capas y módulos.
- Arquitectura preparada para crecimiento futuro.

Aurex **no ejecuta operaciones reales**, **no gestiona dinero real** y **no se conecta a bancos, brokers ni wallets**. Su propósito es educativo, analítico y demostrativo.

---

## Problema que resuelve

Muchas personas interesadas en inversiones no cuentan con una herramienta clara, visual y segura para practicar la gestión de portafolios sin arriesgar dinero real.

Aurex resuelve este problema ofreciendo un entorno donde el usuario puede:

- Simular compras y ventas.
- Construir un portafolio ficticio.
- Visualizar métricas de rendimiento.
- Entender la distribución del capital.
- Analizar concentración y riesgo.
- Crear alertas de mercado.
- Recibir explicaciones educativas sobre su portafolio.

---

## Objetivo del proyecto

El objetivo de Aurex es demostrar una solución moderna de inteligencia financiera que combine:

```txt
Educación financiera
Simulación de inversiones
Visualización de datos
Arquitectura full-stack
Seguridad backend
Persistencia en base de datos
Despliegue cloud
Experiencia premium de usuario
```

A nivel académico, profesional o empresarial, Aurex evidencia el desarrollo de una aplicación completa con frontend, backend, base de datos, seguridad, arquitectura modular y despliegue público.

---

## Para qué sirve Aurex

Aurex permite responder preguntas clave sobre un portafolio simulado:

```txt
¿Cuánto vale mi portafolio?
¿Qué activos tengo?
¿Cuánto estoy ganando o perdiendo?
¿Cómo está distribuido mi capital?
¿Qué tan riesgoso está mi portafolio?
¿Qué activos estoy monitoreando?
¿Qué alertas quiero crear?
¿Qué análisis educativo puede generar la IA?
```

La plataforma es útil para:

- Estudiantes que quieren aprender sobre inversiones.
- Personas que desean practicar sin usar dinero real.
- Usuarios interesados en criptomonedas, acciones y ETFs.
- Proyectos académicos de ingeniería de software.
- Portafolios profesionales full-stack.
- Demostraciones de arquitectura moderna en la nube.

---

## Funcionamiento general

El flujo principal de Aurex es el siguiente:

```txt
┌────────────────────────┐
│  Usuario entra a Aurex │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Registro / Login JWT   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Crea un portafolio     │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Agrega transacciones   │
│ BUY / SELL simuladas   │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Backend calcula datos  │
│ Holdings / P&L / Risk  │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Dashboard financiero   │
└───────────┬────────────┘
            │
            ├──► Alertas
            ├──► Mercado
            └──► Análisis IA
```

A nivel técnico:

1. El usuario interactúa con el frontend en Next.js.
2. El frontend consume una API REST protegida con JWT.
3. El backend procesa la lógica de negocio.
4. Los datos se guardan en PostgreSQL.
5. El dashboard visualiza la información financiera simulada.
6. La IA genera análisis educativo del portafolio.

---

## Características principales

### Autenticación

Aurex incluye autenticación mediante JWT.

Funcionalidades:

- Registro de usuario.
- Inicio de sesión.
- Token JWT.
- Rutas protegidas.
- Usuario autenticado.
- Control de acceso a información propia.

---

### Portafolios simulados

El usuario puede crear portafolios de inversión ficticios.

Cada portafolio puede contener:

- Nombre.
- Moneda base.
- Descripción.
- Usuario propietario.
- Activos asociados.
- Transacciones simuladas.

---

### Transacciones simuladas

Aurex permite registrar operaciones ficticias de compra o venta.

Ejemplos:

```txt
BUY 0.25 BTC at 65,000 USD
BUY 3 NVDA at 875 USD
SELL 0.10 ETH at 3,200 USD
```

Estas operaciones no mueven dinero real. Solo sirven para simular posiciones y calcular métricas.

---

### Holdings

A partir de las transacciones, Aurex puede calcular posiciones acumuladas.

Ejemplo de información calculada:

- Activo.
- Símbolo.
- Cantidad.
- Precio promedio.
- Valor estimado.
- Ganancia o pérdida.
- Porcentaje de asignación.

---

### Dashboard financiero

El dashboard muestra información clave del portafolio:

- Valor total.
- Costo total.
- Ganancia o pérdida.
- Porcentaje de rendimiento.
- Mejor activo.
- Peor activo.
- Distribución del capital.
- Nivel de riesgo.
- Resumen visual del portafolio.

---

### Mercado

Aurex incluye una sección de mercado con activos como:

```txt
BTC · ETH · SOL · AAPL · NVDA · TSLA · SPY
```

Actualmente puede trabajar con datos mock desde backend, pero la arquitectura permite integrar proveedores reales como:

- CoinGecko.
- Alpha Vantage.
- Finnhub.
- Twelve Data.

---

### Alertas

El usuario puede crear alertas de precio.

Ejemplos:

```txt
Avisar cuando BTC supere 70,000 USD
Avisar cuando ETH baje de 3,000 USD
```

Las alertas permiten monitorear condiciones relevantes de mercado dentro del entorno simulado.

---

### Análisis educativo con IA

Aurex incluye un módulo de análisis educativo asistido por IA.

Puede generar:

- Resumen del portafolio.
- Observaciones de concentración.
- Nivel de riesgo.
- Comentarios sobre distribución de activos.
- Explicaciones educativas.

La IA no recomienda comprar ni vender activos. Sus respuestas son únicamente educativas.

---

## Arquitectura de software

Aurex sigue una arquitectura cliente-servidor con separación entre frontend, backend y base de datos.

```txt
┌───────────────────────────────────────────────┐
│                  Usuario final                │
│             Navegador web / Aurex UI          │
└───────────────────────┬───────────────────────┘
                        │
                        │ HTTPS
                        ▼
┌───────────────────────────────────────────────┐
│                Frontend - Vercel              │
│          Next.js · React · Tailwind CSS        │
│ Landing · Dashboard · Portfolio · Markets      │
└───────────────────────┬───────────────────────┘
                        │
                        │ REST API + JWT
                        ▼
┌───────────────────────────────────────────────┐
│                Backend - Render               │
│         Java 21 · Spring Boot · Security       │
│ Auth · Portfolios · Market · Alerts · AI       │
└───────────────────────┬───────────────────────┘
                        │
                        │ JDBC
                        ▼
┌───────────────────────────────────────────────┐
│               Neon PostgreSQL                 │
│ Users · Portfolios · Assets · Holdings         │
│ Transactions · Alerts · AI Analyses            │
└───────────────────────────────────────────────┘
```

---

## Capas de la aplicación

```txt
┌───────────────────────────────────────────────┐
│                 Frontend Layer                │
│ UI · Formularios · Dashboard · Gráficas        │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                   API Layer                   │
│ Controllers · DTOs · Validaciones · Errores    │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                Business Layer                 │
│ Servicios · Cálculos · Reglas de negocio       │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│              Persistence Layer                │
│ JPA · Repositories · PostgreSQL · Flyway       │
└───────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│                 Security Layer                │
│ JWT · Spring Security · CORS · Auth Filter     │
└───────────────────────────────────────────────┘
```

---

## Stack tecnológico

### Frontend

| Tecnología | Propósito |
|---|---|
| Next.js | Framework principal del frontend |
| React | Construcción de interfaz |
| TypeScript | Tipado estático |
| Tailwind CSS | Sistema de estilos |
| shadcn/ui | Componentes de interfaz |
| Recharts | Gráficas financieras |
| Framer Motion | Animaciones |
| TanStack Query | Manejo de data fetching |
| TanStack Table | Tablas de datos |
| React Hook Form | Formularios |
| Zod | Validación de datos |

---

### Backend

| Tecnología | Propósito |
|---|---|
| Java 21 | Lenguaje principal |
| Spring Boot 3 | Framework backend |
| Spring Web | API REST |
| Spring Security | Seguridad |
| JWT | Autenticación stateless |
| Spring Data JPA | Persistencia |
| Hibernate | ORM |
| Flyway | Migraciones |
| PostgreSQL | Base de datos relacional |
| Actuator | Health checks |
| Docker | Contenerización |

---

### Infraestructura

| Servicio | Propósito |
|---|---|
| Vercel | Despliegue del frontend |
| Render | Despliegue del backend |
| Neon | PostgreSQL administrado |
| GitHub | Control de versiones |
| Docker | Build del backend |

---

## Estructura del repositorio

```txt
AUREX---INVESTMENTS/
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── markets/
│   │   ├── portfolio/
│   │   ├── alerts/
│   │   ├── ai-insights/
│   │   └── settings/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── market.service.ts
│   │   ├── portfolio.service.ts
│   │   ├── alerts.service.ts
│   │   └── ai.service.ts
│   │
│   ├── lib/
│   ├── types/
│   ├── public/
│   ├── package.json
│   └── next.config.mjs
│
├── backend/
│   ├── src/main/java/com/aurex/backend/
│   │   ├── auth/
│   │   ├── user/
│   │   ├── portfolio/
│   │   ├── market/
│   │   ├── alert/
│   │   ├── ai/
│   │   ├── config/
│   │   └── common/
│   │
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── db/migration/
│   │
│   ├── Dockerfile
│   ├── build.gradle
│   └── settings.gradle
│
└── README.md
```

---

## Modelo de datos principal

### User

Representa al usuario autenticado.

Campos principales:

```txt
id
fullName
email
passwordHash
role
enabled
createdAt
updatedAt
```

---

### Portfolio

Representa un portafolio simulado.

Campos principales:

```txt
id
userId
name
baseCurrency
description
createdAt
updatedAt
```

---

### Asset

Representa un activo financiero.

Campos principales:

```txt
id
symbol
name
assetType
externalId
source
active
```

Tipos:

```txt
CRYPTO
STOCK
ETF
CASH
```

---

### Holding

Representa una posición acumulada dentro de un portafolio.

Campos principales:

```txt
id
portfolioId
assetId
quantity
averageBuyPrice
```

---

### Transaction

Representa una operación simulada.

Campos principales:

```txt
id
portfolioId
assetId
type
quantity
price
transactionDate
notes
```

Tipos:

```txt
BUY
SELL
```

---

### AlertRule

Representa una alerta configurada por el usuario.

Campos principales:

```txt
id
userId
assetId
conditionType
targetPrice
enabled
```

Condiciones:

```txt
ABOVE
BELOW
```

---

### AIAnalysis

Representa un análisis educativo generado sobre un portafolio.

Campos principales:

```txt
id
portfolioId
summary
riskLevel
concentrationNotes
observations
disclaimer
createdAt
```

---

## Módulos del backend

```txt
auth/
  Registro, login, JWT y usuario autenticado.

user/
  Entidad de usuario, repositorio y datos de perfil.

portfolio/
  Portafolios, holdings, transacciones y resumen financiero.

market/
  Activos, ticker, datos de mercado y proveedores mock/API.

alert/
  Reglas de alerta, eventos y monitoreo.

ai/
  Análisis educativo del portafolio.

config/
  Seguridad, CORS, JWT y configuración general.

common/
  Manejo global de errores, respuestas estándar y utilidades.
```

---

## Módulos del frontend

```txt
app/
  Rutas principales de Next.js.

components/
  Componentes reutilizables de UI.

services/
  Capa de comunicación con backend o datos mock.

types/
  Tipos TypeScript del dominio.

lib/
  Utilidades, formatters y configuración.

public/
  Assets estáticos.
```

El frontend puede trabajar en dos modos:

```txt
mock
api
```

Modo mock:

```env
NEXT_PUBLIC_DATA_MODE=mock
```

Modo API:

```env
NEXT_PUBLIC_DATA_MODE=api
NEXT_PUBLIC_API_BASE_URL=https://aurex-backend-qthi.onrender.com/api
```

---

## Endpoints principales

### Autenticación

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

---

### Portafolios

```txt
GET    /api/portfolios
POST   /api/portfolios
GET    /api/portfolios/{id}
PUT    /api/portfolios/{id}
DELETE /api/portfolios/{id}
```

---

### Transacciones

```txt
POST /api/transactions
GET  /api/transactions?portfolioId={id}
```

---

### Holdings

```txt
GET /api/portfolios/{id}/holdings
```

---

### Resumen financiero

```txt
GET /api/portfolios/{id}/summary
```

---

### Mercado

```txt
GET /api/market/ticker?symbols=BTC,ETH,SOL,AAPL,NVDA,TSLA,SPY
GET /api/market/assets
GET /api/market/history/{symbol}
```

---

### Alertas

```txt
GET    /api/alerts
POST   /api/alerts
PATCH  /api/alerts/{id}/toggle
DELETE /api/alerts/{id}
GET    /api/alerts/events
```

---

### IA

```txt
POST /api/ai/portfolio-summary/{portfolioId}
GET  /api/ai/analyses
GET  /api/ai/analyses/{id}
```

---

## Seguridad

Aurex implementa seguridad mediante Spring Security y JWT.

Características:

- Autenticación stateless.
- Tokens JWT.
- Contraseñas almacenadas con hash.
- Rutas protegidas.
- CORS configurado para producción.
- Variables sensibles fuera del código fuente.
- Usuario autenticado como propietario de sus datos.
- Separación entre frontend y backend.

Las credenciales de base de datos, secretos JWT y claves externas no deben subirse al repositorio.

---

## Despliegue

### Frontend

Plataforma:

```txt
Vercel
```

URL:

```txt
https://aurex-investments.vercel.app
```

Variables:

```env
NEXT_PUBLIC_DATA_MODE=api
NEXT_PUBLIC_API_BASE_URL=https://aurex-backend-qthi.onrender.com/api
```

---

### Backend

Plataforma:

```txt
Render
```

URL:

```txt
https://aurex-backend-qthi.onrender.com
```

Health check:

```txt
https://aurex-backend-qthi.onrender.com/actuator/health
```

---

### Base de datos

Plataforma:

```txt
Neon PostgreSQL
```

La base de datos está conectada al backend mediante JDBC.

---

## Variables de entorno

### Backend

```env
PORT=10000

SPRING_DATASOURCE_URL=jdbc:postgresql://YOUR_NEON_HOST/neondb?sslmode=require&channel_binding=require
SPRING_DATASOURCE_USERNAME=neondb_owner
SPRING_DATASOURCE_PASSWORD=YOUR_PASSWORD

JWT_SECRET=YOUR_SECRET
JWT_EXPIRATION_MS=86400000

CORS_ALLOWED_ORIGINS=https://aurex-investments.vercel.app

AUREX_MARKET_PROVIDER=mock
AUREX_AI_PROVIDER=mock
AUREX_MARKET_CACHE_ENABLED=false
```

---

### Frontend

```env
NEXT_PUBLIC_DATA_MODE=api
NEXT_PUBLIC_API_BASE_URL=https://aurex-backend-qthi.onrender.com/api
```

---

## Ejecución local

### Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

URL local:

```txt
http://localhost:3000
```

---

### Backend

```bash
cd backend
./gradlew bootRun
```

En Windows:

```bash
cd backend
gradlew bootRun
```

URL local:

```txt
http://localhost:8080
```

---

## Base de datos y migraciones

Aurex usa Flyway para versionar el esquema de base de datos.

Migraciones incluidas:

```txt
V1__init_schema.sql
V2__portfolio_domain.sql
V3__seed_base_assets.sql
V4__seed_additional_crypto_assets.sql
V5__seed_mock_price_snapshots.sql
V6__alerts_schema.sql
V7__ai_analysis_schema.sql
```

Flyway permite crear y actualizar el esquema automáticamente al iniciar el backend.

---

## Estado actual

### Implementado

- Frontend desplegado en Vercel.
- Backend desplegado en Render.
- Base de datos Neon conectada.
- Health check activo.
- Arquitectura full-stack separada.
- Seguridad JWT configurada.
- Migraciones Flyway ejecutadas.
- Módulos principales creados.
- Modo mock y modo API preparados.

---

### En validación

- Flujo completo desde frontend a backend.
- Registro/login desde producción.
- Creación real de portafolios.
- Registro real de transacciones.
- Creación de alertas.
- Generación de análisis IA.
- Revisión de botones no funcionales.

---

## Roadmap

### Corto plazo

- Validar flujo end-to-end.
- Conectar todos los formularios del frontend con backend.
- Eliminar botones sin funcionalidad.
- Mejorar manejo de errores.
- Mejorar estados vacíos.
- Confirmar persistencia real por usuario.

---

### Mediano plazo

- Integrar datos reales de mercado.
- Agregar cache con Redis o Upstash.
- Activar IA real con OpenAI o Anthropic.
- Crear reportes PDF.
- Implementar notificaciones.

---

### Largo plazo

- WebSockets para actualizaciones en tiempo real.
- App de escritorio con Electron.
- Backtesting.
- Watchlists.
- Multi-moneda.
- Módulo avanzado de riesgo.
- Panel administrativo.

---

## Disclaimer financiero

Aurex es una plataforma educativa de simulación financiera.

No realiza:

- Trading real.
- Conexión a bancos.
- Conexión a brokers.
- Conexión a wallets.
- Gestión de dinero real.
- Recomendaciones financieras personalizadas.
- Promesas de rentabilidad.

Toda la información es simulada o ingresada por el usuario con fines educativos y analíticos.

---

## Autor

**Juan Esteban Camargo Vergara**  
Estudiante de Ingeniería de Sistemas  
Pontificia Universidad Javeriana  
Bogotá, Colombia

---

## Resumen

Aurex es una plataforma full-stack de inteligencia financiera para simular inversiones, analizar portafolios, visualizar mercados, crear alertas y generar análisis educativo asistido por IA.

El proyecto demuestra una arquitectura moderna con frontend en Next.js, backend en Spring Boot, base de datos PostgreSQL, seguridad JWT, despliegue cloud y separación profesional de módulos.

<p align="center">
  <strong>Aurex — Simula. Analiza. Aprende. Crece.</strong>
</p>
