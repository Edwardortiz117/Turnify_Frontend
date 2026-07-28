# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Gerente de negocio (primario):** opera la agenda del día, configura catálogo/horarios, publica el slug de reserva y puede gestionar **varios negocios** con la misma cuenta (selector + alta de negocio adicional). Suele estar en escritorio o móvil entre atenciones; recibe avisos en la campana.
- **Cliente final:** reserva, consulta citas, cancela y **solicita reprogramación** sin crear cuenta (`/:slug`, `/mis-citas`, `/cancel/:id`). Quiere pocos pasos y confirmación clara.
- **Admin de plataforma:** crea/suspende tenants, asigna gerentes (N:N), revisa salud y logs del SaaS. Uso infrecuente.

## Product Purpose

Turnify es un SaaS multi-tenant de citas para pequeños negocios de servicios (San José de Cúcuta y contexto similar). El gerente configura oferta y horarios, publica un enlace público, recibe reservas online y opera la agenda; el cliente actúa sin login; la plataforma administra tenants.

**Éxito (circuito cerrado observable hoy):**

registro / login → (opcional) otro negocio en la misma cuenta → catálogo + disponibilidad → slug público → reserva → cancelación o solicitud de reprogramación → campana + agenda del gerente → reprogramar / completar / no-show, con aislamiento por `business_id` activo en el JWT.

## Positioning

Aislamiento estricto multiempresa + reserva pública sin login + panel gerente enfocado en **operación diaria** (no marketplace, no pagos, no mensajería push nativa).

Diferenciadores del MVP actual frente a “solo un formulario de citas”:

- Solicitud de reprogramación del cliente **persistida en servidor** (multi-dispositivo).
- Notificaciones de negocio en API (cancelación pública, solicitud de reprogramación).
- Un gerente, **varios negocios**, sin re-registrarse.
- Tres superficies en una sola SPA (`public` / `business` / `platform`).

## Operating Context

- API REST en **Turnify_Backend** (`/api/v1`). Este repo no implementa el servidor; el front consume el contrato en `docs/frontend-api-contract.md`.
- Fechas ISO UTC; la UI formatea con timezone del negocio (default `America/Bogota`).
- UI en español; API en inglés `snake_case`.
- Auth: Bearer JWT en `localStorage` (no cookies HttpOnly en MVP).
- Dev local típico: backend `:3000`, frontend Vite `:5173` o Docker `:8080` con proxy `/api`.

## Brand Commitments

- Nombre: **Turnify**.
- Marca visual: acento teal, logo `/logoT.webp` / favicon.
- Dirección UI (2026): paneles tipo Operate (shell header teal, sidebar clara, atmósfera mesh, glass en cards); vitrina pública calmada. Sin rebranding de nombre ni cambio del acento principal.

## Scope — in MVP (hoy en código)

### Público

- Wizard de reserva por slug.
- Cancelación con verificación de teléfono.
- Lookup de citas confirmadas próximas por negocio.
- Hub `/mis-citas` (agrega lookups de negocios recordados en el dispositivo).
- Solicitar reprogramación (mensaje al negocio; sin elegir slot desde el cliente).

### Gerente (`/app`)

- Dashboard con KPIs y alertas.
- Agenda día/lista: crear asistida, cancelar, reprogramar, completar, no-show.
- Servicios, profesionales (block/unblock), disponibilidad semanal + excepciones.
- Clientes (editar / block / unblock).
- Perfil: nombre, slug, política de cancelación, abrir/cerrar vitrina.
- Selector de negocio + crear negocio gestionado (`/app/businesses/new`).
- Campana: unread del servidor + heurísticas locales (vencidas / agenda casi llena).
- Deep-links `?reschedule=` / `?focus=`.

### Plataforma (`/platform`)

- Dashboard SaaS, listado/detalle de negocios (`managers[]`).
- Suspender/reactivar, asignar gerente, health, log viewer, cuenta (cambio de contraseña).

### Auth

- Register (documento + negocio), login, forgot/reset/change password.
- Post-login: `platform` → `/platform`, `business` → `/app`.

## Scope — out of MVP

- App nativa, pagos, WhatsApp/SMS/email transaccional.
- Login de empleados (`Professional` sin cuenta en MVP).
- Calendario full-month tipo Google Calendar.
- Lookup cross-tenant real en servidor para “mis citas” (hoy es agregación en cliente).
- React Query / cache global (fetch por pantalla; diferido hasta que duela).
- E2E automatizado amplio (hay Vitest unitario mínimo).

## Constraints

- No romper contratos API sin alinear backend + `docs/frontend-api-contract.md`.
- WCAG 2.1 AA como objetivo (semántica, teclado, foco, contraste, `prefers-reduced-motion` / `prefers-reduced-transparency`).
- La fuente de verdad de citas, reprogramaciones y notificaciones de negocio es el **servidor**, no `localStorage`.
- Agenda = vista día/lista (sin librería full-calendar), según roadmap y brief de rediseño.

## Accessibility

WCAG 2.1 AA: HTML semántico, teclado, foco visible, contraste, respetar preferencias de movimiento y transparencia.

## Honesty / known limits

- Sin API levantada no hay producto usable.
- `/mis-citas` depende de slugs recordados en el dispositivo + teléfono; no es una cuenta de cliente.
- Notificaciones **híbridas:** cancelación/reprogramación desde API; “vencida” / “agenda casi llena” se derivan en el cliente a partir de citas/horarios.
- Queda un módulo legacy tipado (`rescheduleRequestStorage`) sin persistir en navegador; al boot se purgan claves antiguas `turnify.rescheduleRequests.*`.

## Open Decisions

- ¿Cuándo introducir React Query (o similar) para cache/invalidación?
- ¿Lookup “mis citas” cross-tenant en backend en una fase posterior?
- ¿Notificaciones derivadas (vencida / agenda llena) también persistidas en servidor?
- Profundizar WCAG con auditoría formal (herramienta + checklist).

## References

- Contrato UI ↔ API: `docs/frontend-api-contract.md`
- Sustentación / flujos: `docs/sustentacion-turnify.md`
- Arranque y Docker: `README.md`
- Diseño visual: `DESIGN.md`
