# Turnify

SaaS MVP frontend for appointment management (San José de Cúcuta).

## Structure

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

## Docker (frontend desacoplado)

### Desarrollo con hot reload (recomendado)

Los cambios en `frontend/src` se reflejan solos; no hace falta reiniciar el contenedor.

```bash
cp .env.docker.example .env   # opcional
docker compose up --build
```

- UI: http://localhost:5173  
- Proxy API: `/api/...` → `BACKEND_UPSTREAM`  
- Código montado desde `./frontend` (HMR / Vite)

Si ya tenías el contenedor Nginx antiguo, recrea el servicio:

```bash
docker compose down
docker compose up --build
```

### Producción local (Nginx, build estático)

```bash
docker compose --profile prod up --build frontend-prod
```

- UI: http://localhost:8080  

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FRONTEND_PORT` | `5173` | Puerto Vite (dev) |
| `FRONTEND_PROD_PORT` | `8080` | Puerto Nginx (profile `prod`) |
| `BACKEND_UPSTREAM` | `host.docker.internal:3000` | Host:puerto del backend (sin `http://`) |
| `VITE_API_BASE_URL` | *(vacío)* | Vacío = same-origin vía proxy |

Backend en otro contenedor de la red `turnify-net`:

```bash
BACKEND_UPSTREAM=backend:3000 docker compose up --build
```
