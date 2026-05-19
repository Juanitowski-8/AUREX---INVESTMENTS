# 🟡 Aurex — AI-Powered Portfolio Intelligence

<p align="center">
  <strong>Premium portfolio intelligence for modern markets.</strong>
</p>

<p align="center">
  <em>Simulated investments · Market insights · Portfolio analytics · AI-powered financial education</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-Next.js-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/Backend-Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
  <img src="https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Deploy-Vercel_&_Render-black?style=for-the-badge&logo=vercel" />
</p>

---

## 📌 Overview

**Aurex** is a premium financial intelligence platform designed to help users simulate, monitor and analyze investment portfolios without risking real money.

It provides a modern dashboard experience for tracking simulated investments in crypto assets, stocks and ETFs, while offering portfolio metrics, risk analysis, price alerts and educational AI-powered insights.

Aurex does **not** execute real trades and does **not** provide financial advice.  
It is designed as an educational and analytical platform for learning, simulation and portfolio intelligence.

---

## 🧠 Product Vision

Aurex transforms complex financial data into clear, visual and actionable educational insights.

The platform is designed for:

- Students learning about financial markets.
- Beginner investors practicing portfolio management.
- Analysts who want a clean simulated dashboard.
- Developers demonstrating a modern full-stack fintech architecture.
- Academic or enterprise projects requiring real backend, database and deployment.

---

## ✨ Core Value Proposition

> **Aurex helps users understand their simulated investments through premium dashboards, market tracking, risk visibility and AI-powered educational analysis.**

Instead of only showing numbers, Aurex organizes portfolio data into clear insights:

- What assets do I own?
- How much is my portfolio worth?
- Am I gaining or losing?
- How is my capital distributed?
- How risky is my allocation?
- What alerts should I monitor?
- What can AI explain about my portfolio?

---

## 🖥️ Live Deployment

| Layer | Platform | URL |
|---|---|---|
| Frontend | Vercel | `https://aurex-investments.vercel.app` |
| Backend | Render | `https://aurex-backend-qthi.onrender.com` |
| Health Check | Render Actuator | `https://aurex-backend-qthi.onrender.com/actuator/health` |
| Database | Neon PostgreSQL | Private connection |

---

## 🧩 System Architecture

```txt
┌─────────────────────────────────────────────┐
│                User Browser                 │
│         Aurex Premium Web Interface          │
└─────────────────────┬───────────────────────┘
                      │
                      │ HTTPS
                      ▼
┌─────────────────────────────────────────────┐
│              Frontend - Vercel              │
│        Next.js · React · Tailwind CSS        │
│      Dashboard · Markets · Portfolio UI      │
└─────────────────────┬───────────────────────┘
                      │
                      │ REST API
                      ▼
┌─────────────────────────────────────────────┐
│              Backend - Render               │
│        Java 21 · Spring Boot · JWT           │
│   Auth · Portfolios · Alerts · AI · Market   │
└─────────────────────┬───────────────────────┘
                      │
                      │ JDBC
                      ▼
┌─────────────────────────────────────────────┐
│             Neon PostgreSQL                 │
│   Users · Portfolios · Holdings · Alerts     │
│       Transactions · AI Analyses             │
└─────────────────────────────────────────────┘
