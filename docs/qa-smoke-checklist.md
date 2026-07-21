# Smoke E2E checklist — Turnify Frontend

Prerequisites: API running on `VITE_API_BASE_URL` (default `http://localhost:3000`), CORS includes `http://localhost:5173`.

## CORS

1. Set `CORS_ORIGINS=http://localhost:5173` on the API.
2. Open DevTools → Network on a login request; confirm no CORS error.

## Circuito cerrado (2 tenants)

### Tenant A (gerente)
1. Register business A with unique slug.
2. Create service + professional + link offerings.
3. Set weekly schedule.
4. Open public `/{slugA}` and book an appointment.
5. See appointment in `/app/appointments`.
6. Complete / cancel / no-show transitions.

### Tenant B
1. Register business B.
2. Confirm agenda B does **not** show appointments from A.
3. Public slug B cannot see services of A.

### Plataforma
1. Login with `scope=platform`.
2. List businesses; open detail; suspend A.
3. Public `/{slugA}` shows suspended state.
4. Reactivate A.

### Cancelación pública
1. From confirmation, open `/cancel/:id`.
2. Cancel with matching phone.
3. Wrong phone / too late → mapped Spanish error.

## Contrato vs `/api-docs`

- [ ] Auth register/login/me
- [ ] Public slug flow + cancel
- [ ] Business dashboard, profile, services, professionals, schedule, exceptions, appointments, clients
- [ ] Platform dashboard, businesses, status, manager
- [ ] Errors use `error.code` (not raw English message as primary UI text)

## Commands

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
npm test
npm run build
```
