# Turnify Frontend

SPA (React) del SaaS multi-tenant de citas **Turnify**. Este repo es solo la capa de presentación; las reglas de negocio, JWT y PostgreSQL viven en el repo hermano **Turnify_Backend**.

**Estado del MVP (julio 2026):** reserva pública, cancelación y solicitud de reprogramación vía API, panel de gerente con multi-negocio, notificaciones de servidor, y consola de plataforma.

## Documentación

| Archivo | Contenido |
|---------|-----------|
| [`PRODUCT.md`](./PRODUCT.md) | Propósito, usuarios, alcance y límites del producto |
| [`DESIGN.md`](./DESIGN.md) | Sistema visual (tokens, glass, tipografía) |
| [`docs/frontend-api-contract.md`](./docs/frontend-api-contract.md) | Contrato HTTP que consume la UI |
| [`docs/architecture.md`](./docs/architecture.md) | Arquitectura frontend / ADRs |
| [`docs/sustentacion-turnify.md`](./docs/sustentacion-turnify.md) | Guía larga para sustentación (código + flujos) |
| [`docs/design/`](./docs/design/) | Diseño de producto/UX (puntos 1–10) |
| [`docs/qa-smoke-checklist.md`](./docs/qa-smoke-checklist.md) | Checklist smoke / multi-tenant |

## Stack

React 19 · TypeScript · Vite 8 · Tailwind 4 · React Router 7 · sonner · Vitest · oxlint

## Superficies

| Ruta | Actor | Qué hace |
|------|--------|----------|
| `/:slug` | Cliente | Wizard de reserva (servicio → profesional → slot → datos) |
| `/mis-citas`, `/:slug/mis-citas` | Cliente | Consulta citas por teléfono; cancelar / solicitar reprogramación |
| `/cancel/:appointmentId` | Cliente | Cancelar con teléfono |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Auth | Alta, sesión, recuperación de contraseña |
| `/app/*` | Gerente (`scope=business`) | Dashboard, agenda, catálogo, horarios, clientes, perfil, multi-negocio |
| `/platform/*` | Admin (`scope=platform`) | Tenants, suspensión, gerentes, health, logs |

## Capacidades actuales (MVP)

**Cliente (sin cuenta)**
- Reserva pública con `Idempotency-Key`
- Cancelación con teléfono
- Lookup de citas confirmadas por negocio
- **Solicitud de reprogramación** → `POST /public/appointments/:id/reschedule-requests` (mensaje; el gerente elige el nuevo horario)
- Hub `/mis-citas` agregando negocios recordados en el dispositivo

**Gerente**
- Operar citas: crear, cancelar, reprogramar, completar, no-show
- Catálogo (servicios / profesionales), disponibilidad, clientes (block/unblock)
- Abrir/cerrar vitrina (`profile.status`)
- **Multi-negocio:** `businesses[]`, selector, `POST /auth/switch-business`, crear otro con `POST /business/managed-businesses`
- **Campana:** notificaciones de servidor (cancelaciones, solicitudes de reprogramación) + alertas derivadas en cliente (citas vencidas, agenda casi llena)
- Deep-link `/app/appointments?reschedule=:id` / `?focus=:id`

**Plataforma**
- Dashboard SaaS, CRUD de negocios, `managers[]`, suspender/reactivar, health y log viewer

## Estructura del repo

```
Turnify_Frontend/
├── PRODUCT.md / DESIGN.md / README.md
├── docs/                 # contrato API, arquitectura, sustentación, design/
├── frontend/             # app Vite (código fuente)
├── Dockerfile            # build SPA + Nginx (CapRover y compose)
└── docker-compose.yml    # solo el frontend; el backend es otro compose
```

## Arranque local (recomendado)

### 1. Backend (repo hermano)

Levanta **Turnify_Backend** en `http://localhost:3000` (API + Postgres). Health: `GET http://localhost:3000/health`.

### 2. Frontend con Vite

```bash
cd frontend
cp .env.example .env          # VITE_PROXY_TARGET=http://localhost:3000
npm install
npm run dev                   # http://localhost:5173
```

Con `VITE_API_BASE_URL` vacío, el navegador llama `/api/v1/...` y Vite hace proxy a `VITE_PROXY_TARGET` (evita CORS).

### 3. Frontend con Docker

```bash
cp .env.docker.example .env   # BACKEND_UPSTREAM=host.docker.internal:3000
docker compose up --build     # http://localhost:8080
```

| Variable | Default local | Descripción |
|----------|---------------|-------------|
| `FRONTEND_PORT` | `8080` | Puerto publicado |
| `BACKEND_SCHEME` | `http` | Esquema hacia el API |
| `BACKEND_UPSTREAM` | `host.docker.internal:3000` | Host:puerto del backend (sin esquema) |
| `VITE_API_BASE_URL` | *(vacío)* | Vacío = same-origin + proxy Nginx |

Backend en la misma red Docker:

```bash
BACKEND_SCHEME=http BACKEND_UPSTREAM=backend:3000 docker compose up --build
```

> Un JWT emitido contra el backend **remoto** no sirve en local: vuelve a iniciar sesión.

## CapRover

1. App HTTP Port **80**.
2. App Configs: `BACKEND_SCHEME` + `BACKEND_UPSTREAM` (público o `srv-captain--…:3000`).
3. Dejar `VITE_API_BASE_URL` vacío. Deploy con `./Dockerfile`.
4. Health: `GET /health` → `ok`.

## Qué NO vive en el navegador (anti-engaño)

Estas piezas van **solo por API** (no se inventan en `localStorage`):

- Solicitudes de reprogramación
- Notificaciones de cancelación / reprogramación al gerente
- Agenda, catálogo, auth y datos de plataforma

**Sí** puede quedar en el dispositivo (UX, no fuente de verdad de negocio):

- Sesión JWT (`turnify.session`)
- Teléfono y slugs recordados para `/mis-citas`
- Atajos post-reserva (`turnify.lastAppointment`, teléfono por slug)
- Dismiss local de alertas derivadas en plataforma

Al arrancar, la app limpia claves legacy `turnify.rescheduleRequests.*` si existían de un MVP anterior.

## Scripts (`frontend/`)

| Comando | Uso |
|---------|-----|
| `npm run dev` | Vite + proxy |
| `npm run build` | `tsc -b` + Vite production |
| `npm test` | Vitest |
| `npm run lint` | oxlint |

## Relación con el backend

```text
Navegador → SPA (Vite :5173 o Nginx :8080)
         → /api/v1/* (proxy)
         → Turnify_Backend :3000
         → PostgreSQL
```

OpenAPI del API: `http://localhost:3000/api-docs` (en el backend).
