# Frontend API Contract (aligned with Turnify OpenAPI 1.0.0)

Base: `VITE_API_BASE_URL` + `/api/v1`  
Auth: `Authorization: Bearer <access_token>`  
Dates: ISO 8601 UTC  
Pagination: `{ total, items }` with `limit` + `offset`  
Errors: `{ "error": { "code": string, "message": string, "details": object } }`

## Auth — `/api/v1/auth`

| Method | Path | Auth | Body / notes |
|--------|------|------|--------------|
| POST | `/register` | No | `{ email, password, business: { name, slug } }` → 201 `AuthRegisterResponse` (token + user + business) |
| POST | `/login` | No | `{ email, password }` → `TokenResponse` |
| GET | `/me` | Bearer | `{ user_id, email, scope, business_id? }` |

Post-login routing: `scope === "platform"` → `/platform`; `scope === "business"` → `/app`.

## Public — `/api/v1/public`

| Method | Path | Notes |
|--------|------|-------|
| GET | `/businesses/:slug` | `PublicStorefront` (Business + services) |
| GET | `/businesses/:slug/services` | `Service[]` |
| GET | `/businesses/:slug/services/:serviceId/professionals` | `Professional[]` |
| GET | `/businesses/:slug/professionals/:professionalId/services/:serviceId/slots?date=YYYY-MM-DD` | **`AvailableSlots`**: `{ date, professional_id, service_id, slots: [{ starts_at, ends_at }] }` |
| POST | `/businesses/:slug/appointments` | Optional header `Idempotency-Key` |
| POST | `/appointments/:appointmentId/cancel` | Body `{ phone }` |

Reserve body:

```json
{
  "professional_id": "uuid",
  "service_id": "uuid",
  "starts_at": "2026-07-21T15:00:00.000Z",
  "client": { "name": "...", "phone": "...", "email": null }
}
```

## Business — `/api/v1/business` (JWT scope=business)

Profile fields: `name`, `slug`, `status`, **`cancellation_min_hours`**, `timezone` (GET).  
PATCH profile allows: `name`, `slug`, `cancellation_min_hours`, `status` (not timezone).

Professional offerings:
- GET `/professionals/:id/services` → **`Service[]`**
- PUT body `{ service_ids: uuid[] }` → **`Service[]`**

Weekly schedule: `{ slots: [{ day_of_week: 1-7 (Mon–Sun), start_time, end_time }] }`

Availability exceptions:
- Body/response use **`starts_at` / `ends_at`** (date-time) + `type`: `block` | `extra_open`
- DELETE → `{ ok: true }`

Appointments list/clients list: `{ total, items }`.

Client PATCH: `name`, `phone`, `email` (no `active` in body).

## Platform — `/api/v1/platform` (JWT scope=platform)

Dashboard, businesses list/create/detail, PATCH status (`active`|`suspended` → `{ id, status }`), POST manager `{ user_id }` → `{ ok: true }`.

## Error codes to map in UI

`VALIDATION_ERROR`, `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `BUSINESS_SUSPENDED`, `NOT_FOUND`, `SLOT_OCCUPIED`, `PROFESSIONAL_INACTIVE`, `INVALID_STATE_TRANSITION`, `SLUG_ALREADY_EXISTS`, `CONFLICT`, `OUTSIDE_AVAILABILITY`, `CANCELLATION_TOO_LATE`, `CLIENT_APPOINTMENT_LIMIT`, `INTERNAL_ERROR`.
