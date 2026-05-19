<!-- ========================================================= -->
<!--                       AUREX README                        -->
<!-- ========================================================= -->

<h1 align="center">Aurex</h1>

<p align="center">
  <strong>AI-Powered Portfolio Intelligence</strong>
</p>

<p align="center">
  Plataforma web premium para simulación, análisis y educación financiera basada en portafolios de inversión.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Spring%20Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-Neon%20PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Cloud-Vercel%20%7C%20Render-111111?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<p align="center">
  <a href="https://aurex-investments.vercel.app"><strong>Frontend público</strong></a>
  ·
  <a href="https://aurex-backend-qthi.onrender.com/actuator/health"><strong>Health Check Backend</strong></a>
</p>

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

- Frontend web desplegado en Vercel.
- Backend REST desplegado en Render.
- Base de datos PostgreSQL en Neon.
- Seguridad con JWT.
- Migraciones con Flyway.
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

¿Cuánto vale mi portafolio?
¿Qué activos tengo?
¿Cuánto estoy ganando o perdiendo?
¿Cómo está distribuido mi capital?
¿Qué tan riesgoso está mi portafolio?
¿Qué activos estoy monitoreando?
¿Qué alertas quiero crear?
¿Qué análisis educativo puede generar la IA?

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

BUY 0.25 BTC at 65,000 USD
BUY 3 NVDA at 875 USD
SELL 0.10 ETH at 3,200 USD

BTC · ETH · SOL · AAPL · NVDA · TSLA · SPY

Avisar cuando BTC supere 70,000 USD
Avisar cuando ETH baje de 3,000 USD

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

