---
name: turnify-rest-errors
description: >-
  Enforces strict REST API error handling for Turnify backend: no silent catches,
  domain/app error hierarchy, HTTP envelope mapping, and logging. Use when writing
  Express controllers, use cases, middleware, repositories, or any Node.js API code
  in turnify_backend; also when reviewing error paths, 4xx/5xx responses, or fixing
  swallowed exceptions.
---

# Turnify — Control estricto de errores (REST)

## Obligatorio

1. **Nunca** `catch` vacío ni `catch` que solo loguee y continúe sin respuesta/rethrow.
2. **Nunca** devolver `200` con cuerpo de error. Usar códigos HTTP del diseño ([07-diseno-apis.md](../../../docs/design/07-diseno-apis.md)).
3. Toda falla de negocio → `DomainError` / `AppError` con `code` estable (no strings sueltos en controllers).
4. Errores inesperados → `INTERNAL_ERROR` 500; **no** filtrar stack ni SQL al cliente.
5. Validación de entrada (Zod) → `VALIDATION_ERROR` 400 con `details` de campos.

## Envelope de respuesta de error

```json
{
  "error": {
    "code": "SLOT_OCCUPIED",
    "message": "The selected time slot is no longer available.",
    "details": {}
  }
}
```

## Jerarquía

| Tipo | Cuándo | HTTP vía mapper |
|------|--------|-----------------|
| `ValidationError` | Body/query inválido | 400 |
| `UnauthenticatedError` | Sin/invalid JWT | 401 |
| `ForbiddenError` | Ámbito incorrecto / RB-IA | 403 |
| `NotFoundError` | Recurso ausente o fuera de tenant | 404 |
| `ConflictError` / domain codes | Solapamiento, slug, estado | 409 |
| `UnprocessableError` | Fuera disponibilidad, cancel tarde | 422 |
| `DomainError` genérico | Otras reglas | mapear por `code` |
| Error desconocido | Bug / infra | 500 |

## Patrones

```js
// ❌ MAL
try {
  await repo.save(cita);
} catch (e) {}

// ❌ MAL
catch (e) {
  console.log(e);
  return res.json({ ok: false });
}

// ✅ BIEN — dejar subir; error-handler mapea
await repo.save(cita);

// ✅ BIEN — convertir infra a AppError solo si es esperado
try {
  await repo.save(cita);
} catch (e) {
  if (e.name === 'SequelizeUniqueConstraintError') {
    throw new ConflictError('SLUG_ALREADY_EXISTS', 'El slug ya está en uso.');
  }
  throw e; // desconocido → 500
}
```

## Controllers

- Controllers **async**; errores no capturados llegan al `error-handler` (wrapper `asyncHandler`).
- Controllers no construyen mensajes de dominio; solo invocan use case y `res.status().json()`.

## Logging

- Log `warn`/`error` en el error-handler con `request_id`, `code`, `path`, `usuario_id`.
- Nunca loguear passwords, JWT ni cuerpos con secretos.

## Checklist antes de merge de un endpoint

- [ ] Happy path + al menos un error de dominio documentado
- [ ] 401/403 si la ruta es autenticada
- [ ] Not found de otro tenant → 404 (no filtrar existencia)
- [ ] Sin `console.log` de errores; usar logger
