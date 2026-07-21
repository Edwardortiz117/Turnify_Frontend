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

El frontend se sirve con Nginx. Las llamadas `/api/*` se proxifican al backend
(`BACKEND_UPSTREAM`), sin acoplar el código del API en esta imagen.

```bash
# Backend debe estar escuchando (p. ej. localhost:3000)
cp .env.docker.example .env   # opcional
docker compose up --build
```

- UI: http://localhost:8080  
- Proxy API: `http://localhost:8080/api/v1/...` → `BACKEND_UPSTREAM`

| Variable | Default | Descripción |
|----------|---------|-------------|
| `FRONTEND_PORT` | `8080` | Puerto publicado del frontend |
| `BACKEND_UPSTREAM` | `host.docker.internal:3000` | Host:puerto del backend (sin `http://`) |
| `VITE_API_BASE_URL` | *(vacío)* | Vacío = same-origin vía proxy; o URL directa al API |

Backend en otro contenedor de la red `turnify-net`:

```bash
BACKEND_UPSTREAM=backend:3000 docker compose up --build
```
