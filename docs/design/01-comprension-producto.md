# 1. Comprensión del producto — Turnify MVP

## Objetivo de negocio

Validar un SaaS multiempresa para que pequeños negocios de servicios en San José de Cúcuta gestionen citas y reciban reservas online, con aislamiento estricto por negocio (`business_id`).

## Objetivos del MVP (frontend)

| Objetivo | Significado |
|----------|-------------|
| Circuito cerrado | Registro gerente → catálogo + horarios → slug público → citas → admin tenants |
| Operar citas | Crear, ver, cancelar, reprogramar, completar, no-show |
| Aislamiento | Cada gerente solo ve su negocio; plataforma ve agregados |
| Baja fricción | Pocos clics, lenguaje simple, aprendizaje en minutos |

## Actores

| Actor | Login | Superficie | Scope JWT |
|-------|-------|------------|-----------|
| Cliente final | No | Reserva pública `/:slug` | — |
| Gerente de negocio | Sí | Panel `/app/*` | `business` + `business_id` |
| Admin plataforma | Sí | Panel `/platform/*` | `platform` |
| Profesional | No | Recurso de catálogo | — |

```mermaid
flowchart LR
  Cliente[Cliente_final] --> Pub[/api/v1/public]
  Gerente[Gerente] --> Auth[/api/v1/auth]
  Gerente --> Biz[/api/v1/business]
  Admin[Admin_plataforma] --> Auth
  Admin --> Plat[/api/v1/platform]
```

## Necesidades

### Necesidad del usuario
- Cliente: reservar y cancelar sin crear cuenta.
- Gerente: configurar oferta, ver agenda del día, gestionar estados de cita, mantener clientes.
- Admin: crear/suspender tenants y vincular gerentes.

### Decisión de UX
- Agenda y flujo de reserva como centros de valor.
- Un solo login; el sistema enruta por `scope`.
- UI en español; API en inglés.

### Decisión de arquitectura
- Una SPA con tres árboles de rutas.
- Dominios alineados a fronteras HTTP.

### Decisión técnica
- Diferida al punto 9 (React, Router, Tailwind, TS, Vite).

## Problemas que resolvemos

| Problema | Solución MVP |
|----------|--------------|
| Citas en WhatsApp/cuaderno | Agenda + reserva pública |
| Sin catálogo claro | Servicios + profesionales + ofertas |
| Solapamientos | Slots y validaciones API (`SLOT_OCCUPIED`) |
| Multi-negocio sin control | Tenant JWT + panel plataforma |

## Problemas fuera de alcance

Pagos, WhatsApp/SMS, app nativa, login de empleados, marketplace, reportes financieros avanzados.

## Restricciones

- Máximo ~3 semanas de desarrollo frontend.
- Backend independiente; contrato EN `snake_case`.
- Fechas ISO UTC; UI convierte con `timezone` del negocio.
- Errores por `error.code`, mensajes UI en español.
- Priorizar simplicidad sobre riqueza de features.

## Circuito MVP

```mermaid
flowchart LR
  R[Registro_gerente] --> C[Catalogo_horarios]
  C --> S[Publicar_slug]
  S --> P[Reservas_publicas]
  P --> A[Agenda_operativa]
  A --> T[Admin_tenants]
```

## Síntesis

Turnify MVP es una herramienta web SaaS para que el gerente configure su oferta, publique un enlace de reserva y opere la agenda; el cliente reserva sin login; la plataforma administra tenants.
