# Turnify

SaaS MVP frontend for appointment management (San José de Cúcuta).

## Structure

- `PRODUCT.md` / `DESIGN.md` — product truth + design system
- `docs/architecture.md` — frontend architecture & ADRs
- `docs/design/` — Product/UX/architecture design (points 1–10)
- `docs/frontend-api-contract.md` — API contract for the UI
- `docs/qa-smoke-checklist.md` — Smoke / CORS / multi-tenant checklist
- `frontend/` — React + Vite + TypeScript + Tailwind + React Router SPA

## Surfaces

| Path | Actor |
|------|--------|
| `/:slug` | Public booking |
| `/cancel/:appointmentId` | Public cancel |
| `/login`, `/register` | Auth |
| `/app/*` | Business manager (`scope=business`) |
| `/platform/*` | Platform admin (`scope=platform`) |

## Quick start

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

API base URL: `VITE_API_BASE_URL` (default `http://localhost:3000`).

## Docker / CapRover

Un solo `Dockerfile` en la raíz (Nginx + SPA). Lo usan CapRover y `docker compose` local.

```bash
cp .env.docker.example .env   # opcional
docker compose up --build
```

- UI: http://localhost:8080  
- Proxy API: `/api/...` → `BACKEND_SCHEME`://`BACKEND_UPSTREAM`

| Variable | Default (compose) | Descripción |
|----------|-------------------|-------------|
| `FRONTEND_PORT` | `8080` | Puerto en el host |
| `BACKEND_SCHEME` | `http` | `http` o `https` hacia el backend |
| `BACKEND_UPSTREAM` | `host.docker.internal:3000` | Host:puerto (sin esquema) |
| `VITE_API_BASE_URL` | *(vacío)* | Vacío = same-origin vía proxy Nginx |

Backend en la red `turnify-net`:

```bash
BACKEND_SCHEME=http BACKEND_UPSTREAM=backend:3000 docker compose up --build
```

### CapRover

1. Crear app (HTTP Port: **80**).
2. App Configs:

| Variable | Ejemplo |
|----------|---------|
| `BACKEND_SCHEME` | `https` (público) o `http` (red interna CapRover) |
| `BACKEND_UPSTREAM` | `turnify-backend.ingsoftwarefesc.com` o `srv-captain--NOMBRE-BACKEND:3000` |

3. Dejar `VITE_API_BASE_URL` vacío. Deploy usa `./Dockerfile` (`captain-definition`).
4. Health: `GET /health` → `ok`.
