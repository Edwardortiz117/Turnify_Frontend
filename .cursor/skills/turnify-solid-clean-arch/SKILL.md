---
name: turnify-solid-clean-arch
description: >-
  Applies SOLID and Clean Architecture conventions for Turnify Node/Express backend:
  dependency rule, use cases, repositories, no fat controllers, module boundaries.
  Use when creating or refactoring modules under src/, Express routes, Sequelize
  repositories, domain services, or when the user mentions SOLID, Clean Architecture,
  DDD, or hexagonal architecture in turnify_backend.
---

# Turnify — SOLID + Clean Architecture

Seguir [08-arquitectura-tecnica.md](../../../docs/design/08-arquitectura-tecnica.md) y módulos del Punto 5.

## Regla de dependencia

```
interfaces/http → application → domain
                      ↑
              infrastructure (implementa ports)
```

- **domain** no importa Express, Sequelize, JWT ni `src/interfaces`.
- **application** (use cases) depende de **ports** (interfaces), no de Sequelize concreto.
- **infrastructure** implementa ports; composition root cablea en `main`/container.

## SOLID (aplicación práctica MVP)

| Principio | Regla en este repo |
|-----------|-------------------|
| **S** | Un use case = un archivo / una responsabilidad (ej. `book-appointment-public.js`) |
| **O** | Nuevos flujos = nuevo use case; no inflar controllers con `if` de producto |
| **L** | Repos Sequelize sustituibles por mocks en tests sin cambiar use case |
| **I** | Ports pequeños (`CitaRepository`, `ClienteRegistryPort`); no god-interface |
| **D** | Use case recibe deps por factory/constructor; no `require` de models Sequelize dentro de domain |

## Capas — qué va dónde

| Capa | Contiene | Prohibido |
|------|----------|-----------|
| domain | entidades, VOs, domain services, errores, ports de repo | `req`/`res`, SQL, JWT |
| application | use cases, DTOs, orquestación, transacciones | reglas HTTP status |
| infrastructure | Sequelize models/repos, bcrypt, jwt, clock | reglas de negocio |
| interfaces/http | routes, controllers, middleware Zod/JWT | PlanificadorCita / RB-04 |

## Controllers delgados

```js
// ✅
async function create(req, res) {
  const result = await bookAppointmentPublic.execute({
    ...req.body,
    slug: req.params.slug,
    idempotencyKey: req.headers['idempotency-key'],
  });
  res.status(201).json(result);
}
```

## Anti-patrones

- Fat controller con validación de solapamiento
- `Models.Cita.create` dentro de un “service” genérico sin dominio
- Shared kernel gigante con entidades de negocio
- Import circular module A ↔ module B (usar ports)

## Ámbitos API (no mezclar)

| Prefijo | JWT |
|---------|-----|
| `/api/v1/public` | none |
| `/api/v1/business` | JWT `scope=business` + `business_id` |
| `/api/v1/platform` | JWT `scope=platform` |

Ver [05b-roles-ambitos-api.md](../../../docs/design/05b-roles-ambitos-api.md).
