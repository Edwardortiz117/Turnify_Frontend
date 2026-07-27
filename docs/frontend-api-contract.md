# Frontend API Contract (aligned with Turnify backend MVP docs 10/11)

Base: `VITE_API_BASE_URL` + `/api/v1`  
Auth: `Authorization: Bearer <access_token>`  
Dates: ISO 8601 UTC  
Pagination: `{ total, items }` with `limit` + `offset`  
Errors: `{ "error": { "code": string, "message": string, "details": object } }`

## Auth — `/api/v1/auth`

| Method | Path | Auth | Body / notes |
|--------|------|------|--------------|
| POST | `/register` | No | `{ email, password, document, business: { name, slug } }` → 201 token + user + business + `businesses[]` |
| POST | `/login` | No | `{ email, password }` → `TokenResponse` (may 403 `ACCESS_DISABLED`). Business scope includes `businesses[]` and active `business_id` (first membership by default). |
| GET | `/me` | Bearer | `{ user_id, email, scope, business_id?, businesses? }` |
| POST | `/switch-business` | Bearer (business) | `{ business_id }` → new JWT + `businesses[]` for the chosen tenant |
| POST | `/forgot-password` | No | `{ email }` → `{ ok }` (+ `reset_token` in non-prod) |
| POST | `/reset-password` | No | `{ token, password }` → `{ ok }` |
| POST | `/change-password` | Bearer | `{ current_password, new_password }` → `{ ok }` |

Post-login routing: `scope === "platform"` → `/platform`; `scope === "business"` → `/app`.

**Multi-negocio (gerente):** un usuario puede tener varias membresías. El JWT fija un `business_id` activo; todas las rutas `/business/*` usan ese tenant. El panel muestra un selector y llama `POST /auth/switch-business` para cambiar contexto.

## Public — `/api/v1/public`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/businesses/:slug` | Storefront (+ `403 BUSINESS_SUSPENDED`) |
| GET | `/businesses/:slug/services` | `Service[]` |
| GET | `/businesses/:slug/services/:serviceId/professionals` | `Professional[]` |
| GET | `.../slots?date=YYYY-MM-DD` | `{ date, professional_id, service_id, slots[] }` |
| POST | `/businesses/:slug/appointments` | Header `Idempotency-Key`; may `403 CLIENT_BLOCKED` |
| POST | `/appointments/:appointmentId/cancel` | Body `{ phone }` |
| POST | `/businesses/:slug/appointments/lookup` | Body `{ phone }` → citas confirmadas próximas |

**Mis citas global (`/mis-citas`):** el frontend agrega lookups por cada negocio recordado en el dispositivo (no hay endpoint cross-tenant en el MVP). Cada cita muestra el negocio asociado.

## Business — `/api/v1/business` (JWT scope=business)

Profile: GET/PATCH `name`, `slug`, `cancellation_min_hours`, `status` (`active`\|`suspended` = abrir/cerrar vitrina; **no** bloquea login).

Dashboard: KPIs enriquecidos + `alerts[]`.

Professionals: CRUD + `POST .../block` `{ cancel_future? }` / `POST .../unblock`.

Clients: list/PATCH (`name`, `phone`, `email`) + `POST .../block` / `unblock` (no `active` en PATCH).

Appointments: list/create + cancel / reschedule / complete / no-show.

## Platform — `/api/v1/platform` (JWT scope=platform)

| Area | Notes |
|------|-------|
| Dashboard | Activos/suspendidos, altas 7d, citas por estado, serie diaria, tops, `managers_access_locked` |
| Businesses | Create may include `manager_document`; detail includes `managers[]` (+ deprecated `manager` = first) and suspension fields |
| Status | `PATCH .../status` `{ status, reason? }` — cierra vitrina; `ACCESS_DISABLED` solo si era la única membresía del gerente |
| Managers | `POST /managers` (sin membresía); `POST .../manager` con `document` \| `user_id` \| create+assign (N:N: un gerente puede estar en varios negocios) |
| Ops | `GET /log-viewer`, `GET /health` |

## Error codes to map in UI

`VALIDATION_ERROR`, `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `ACCESS_DISABLED`, `BUSINESS_SUSPENDED`, `CLIENT_BLOCKED`, `NOT_FOUND`, `SLOT_OCCUPIED`, `PROFESSIONAL_INACTIVE`, `INVALID_STATE_TRANSITION`, `SLUG_ALREADY_EXISTS`, `CONFLICT`, `OUTSIDE_AVAILABILITY`, `CANCELLATION_TOO_LATE`, `CLIENT_APPOINTMENT_LIMIT`, `INTERNAL_ERROR`.
