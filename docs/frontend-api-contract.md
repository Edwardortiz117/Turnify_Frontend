# Frontend API Contract (English — source of truth for UI)

Base: `VITE_API_BASE_URL` + `/api/v1`  
Auth: `Authorization: Bearer <access_token>`  
Dates: ISO 8601 UTC  
Pagination: `limit` (default 20) + `offset`  
Errors: `{ "error": { "code": string, "message": string, "details": object } }`

## Auth — `/api/v1/auth`

| Method | Path | Auth | Body / notes |
|--------|------|------|--------------|
| POST | `/register` | No | `{ email, password, business: { name, slug } }` → 201 token + user + business |
| POST | `/login` | No | `{ email, password }` → token + `scope` (+ `business_id` if business) |
| GET | `/me` | Bearer | `{ user_id, email, scope, business_id? }` |

Post-login routing: `scope === "platform"` → `/platform`; `scope === "business"` → `/app`.

## Public — `/api/v1/public`

| Method | Path |
|--------|------|
| GET | `/businesses/:slug` |
| GET | `/businesses/:slug/services` |
| GET | `/businesses/:slug/services/:serviceId/professionals` |
| GET | `/businesses/:slug/professionals/:professionalId/services/:serviceId/slots?date=YYYY-MM-DD` |
| POST | `/businesses/:slug/appointments` (+ optional `Idempotency-Key`) |
| POST | `/appointments/:appointmentId/cancel` body `{ phone }` |

Reserve body:

```json
{
  "professional_id": "uuid",
  "service_id": "uuid",
  "starts_at": "2026-07-21T15:00:00.000Z",
  "client": { "name": "...", "phone": "...", "email": null }
}
```

## Business — `/api/v1/business` (JWT business)

Tenant from token. Areas: dashboard, profile, services, professionals, offerings, weekly-schedule, availability-exceptions, appointments, clients.

Appointment status: `confirmed` | `cancelled` | `completed` | `no_show`.

## Platform — `/api/v1/platform` (JWT platform)

Dashboard, businesses list/create/detail, PATCH status (`active`|`suspended`), POST manager.

## Error codes to map in UI

`VALIDATION_ERROR`, `UNAUTHENTICATED`, `INVALID_CREDENTIALS`, `FORBIDDEN`, `BUSINESS_SUSPENDED`, `NOT_FOUND`, `SLOT_OCCUPIED`, `PROFESSIONAL_INACTIVE`, `INVALID_STATE_TRANSITION`, `SLUG_ALREADY_EXISTS`, `CONFLICT`, `OUTSIDE_AVAILABILITY`, `CANCELLATION_TOO_LATE`, `CLIENT_APPOINTMENT_LIMIT`, `INTERNAL_ERROR`.
