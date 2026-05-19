# AUREX — AI-Powered Portfolio Intelligence

Monorepo del proyecto **Aurex**: plataforma educativa de inteligencia de portafolios simulados (crypto, acciones, alertas e IA).

| Carpeta | Stack | Descripción |
|---------|--------|-------------|
| [`frontend/`](./frontend/) | Next.js 16, TypeScript, Tailwind | UI web, modo mock/api |
| [`backend/`](./backend/) | Spring Boot 3.3, Java 21, PostgreSQL | API REST + JWT |
| [`frontend/docs/`](./frontend/docs/) | Markdown | Documentación técnica |

## Inicio rápido

### Backend

```bash
cd backend
docker compose up -d
cp .env.example .env   # configurar JWT_SECRET
./gradlew bootRun
```

API: `http://localhost:8080/api`

### Frontend

```bash
cd frontend
cp .env.example .env.local
pnpm install
pnpm dev
```

App: `http://localhost:3000`

Modo API: `NEXT_PUBLIC_DATA_MODE=api` en `.env.local`

## Documentación

Ver [`frontend/docs/README.md`](./frontend/docs/README.md).

## Disclaimer

Aurex es educativo. No ejecuta operaciones reales ni constituye asesoría financiera.
