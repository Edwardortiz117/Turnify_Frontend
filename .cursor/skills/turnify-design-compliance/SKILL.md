---
name: turnify-design-compliance
description: >-
  Ensures Turnify backend implementation matches closed design docs (domain, MVP
  scope, roles, data model, REST contracts, roadmap). Use when implementing
  features, endpoints, migrations, or entities in turnify_backend; when unsure
  about roles (admin/gerente/empleado/cliente), appointment rules, or API paths.
---

# Turnify — Cumplimiento del diseño

Antes de inventar entidades, endpoints o roles, leer el doc relevante en `docs/design/`.

## Fuente de verdad

| Tema | Doc |
|------|------|
| Roles y ámbitos | [05b-roles-ambitos-api.md](../../../docs/design/05b-roles-ambitos-api.md) |
| APIs REST | [07-diseno-apis.md](../../../docs/design/07-diseno-apis.md) |
| Tablas / integridad | [06-diseno-datos.md](../../../docs/design/06-diseno-datos.md) |
| Carpetas / stack | [08-arquitectura-tecnica.md](../../../docs/design/08-arquitectura-tecnica.md) |
| Orden de build | [09-roadmap-desarrollo.md](../../../docs/design/09-roadmap-desarrollo.md) |
| Dominio / invariantes | [02-modelado-ddd.md](../../../docs/design/02-modelado-ddd.md) |

## Roles (domain docs → English code)

| Docs (ES) | Code |
|-----------|------|
| Admin plataforma | `scope: 'platform'` |
| Gerente | `manager` membership |
| Empleado | `Professional` |
| Cliente | `Client` |
| Negocio | `Business` |
| Cita | `Appointment` |

## Code language

All implementation identifiers and API messages are **English**. Only `docs/design/` may use Spanish.

## Invariantes que el código debe enforce

- RB-04: sin solapamiento de citas `confirmada` del mismo profesional (tx + lock).
- RB-10 / RB-IA-05: queries business siempre filtradas por `negocio_id` del JWT.
- Cliente separado: `citas.cliente_id` FK; no embebido nombre/teléfono en cita.
- Confirmación automática: cita nace `confirmada`.

## Roadmap

Implementar en orden Semana 1 → 2 → 3. No saltar a platform/public antes de auth + catálogo salvo instrucción explícita del usuario.

## Al añadir un endpoint

1. ¿Está en Punto 7? Si no, preguntar o justificar desviación.
2. ¿Use case nombrado en Punto 4?
3. ¿Errores FE-* mapeados a codes HTTP?
