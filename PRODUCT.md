# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Gerente de negocio (primario):** opera citas diarias, configura catálogo/horarios y publica un enlace de reserva. Suele estar en escritorio o móvil entre atenciones.
- **Cliente final:** reserva y cancela sin cuenta vía `/:slug`. Quiere pocos pasos y confirmación clara.
- **Admin de plataforma:** crea/suspende tenants y revisa salud del SaaS. Uso infrecuente.

## Product Purpose

Turnify es un SaaS multi-tenant de citas para pequeños negocios de servicios (San José de Cúcuta). El gerente configura oferta y horarios, publica un slug, recibe reservas online y opera la agenda; la plataforma administra tenants.

**Éxito:** circuito cerrado registro → catálogo → slug público → reserva → agenda operativa, con aislamiento por `business_id`.

## Positioning

Aislamiento estricto multiempresa + reserva pública sin login + panel gerente enfocado en operación diaria (no marketplace, no pagos).

## Operating Context

- API REST existente (`/api/v1`); el frontend no modifica el backend.
- Fechas ISO UTC; UI convierte con timezone del negocio (default `America/Bogota`).
- UI en español; API en inglés `snake_case`.
- Tres superficies en una SPA: pública, `/app/*` (business), `/platform/*` (platform).

## Brand Commitments

- Nombre: **Turnify**.
- Marca visual existente: acento teal, logo `/logoT.webp`.
- *(Inferido / confirmado por brief de rediseño 2026-07)* Refinar hacia SaaS Operate tipo Linear/Stripe; no rebranding de nombre ni color acento.

## Constraints

- No romper contratos API.
- WCAG AA obligatorio.
- Sin app nativa, pagos, WhatsApp/SMS ni login de empleados en MVP.
- Agenda = vista día/lista (sin librería full-calendar), per roadmap y brief de rediseño.

## Accessibility

WCAG 2.1 AA: HTML semántico, teclado, foco visible, contraste, `prefers-reduced-motion`.

## Open Decisions

- Endpoint de reprogramación pública: hoy solo `localStorage` cliente; no inventar API.
- React Query: diferido hasta que el caching manual duela.
