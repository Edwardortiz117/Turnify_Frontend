# 9. Arquitectura técnica — Turnify Frontend

## Stack

- React 18+ + TypeScript
- Vite
- React Router 6+
- TailwindCSS
- fetch tipado (sin axios obligatorio)

## Estructura de carpetas

```
frontend/
  src/
    app/                 # router, providers, guards
    features/
      auth/
      public-booking/
      dashboard/
      catalog/
      availability/
      appointments/
      clients/
      business-profile/
      platform/
    shared/
      api/               # client, errors, types
      auth/              # session
      datetime/
      ui/
      config/
    styles/
  index.html
  package.json
```

## Rutas protegidas

- `RequireAuth` + `RequireScope("business"|"platform")`.
- Público sin auth.
- Post-login: `business` → `/app`, `platform` → `/platform`.

## APIs y errores

- `VITE_API_BASE_URL` (default `http://localhost:3000`).
- Paths `/api/v1/...`.
- Mapa `error.code` → español en `shared/api/errorMessages.ts`.

## Formularios y validación

- Validación client-side mínima (required, email, phone).
- Server `VALIDATION_ERROR` + `details` se muestran en campos.

## Pruebas (MVP)

- Unit: `datetime` helpers + `errorMessages`.
- Smoke manual / script: registro → catálogo → reserva pública → agenda (checklist E2E).
- Sin suite E2E pesada obligatoria; checklist en docs.

## Escalabilidad

Features aisladas permiten extraer apps separadas después sin reescribir dominio.
