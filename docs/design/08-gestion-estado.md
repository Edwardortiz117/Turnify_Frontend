# 8. Gestión del estado — Turnify

Definido tras el modelado funcional.

## Estado global (mínimo)

| Dato | Motivo |
|------|--------|
| `access_token` | Bearer en requests |
| `scope` | Guards y redirect |
| `business_id` | Contexto gerente (informativo; tenant viene del JWT) |
| `user` / email | Cabecera UI |
| `business.timezone` (caché perfil/vitrina) | Conversión de fechas |

Persistencia: `localStorage` para token + scope (MVP simple).

## Estado local

- Formularios (login, reserva, CRUD).
- Paso del wizard público.
- Filtros de agenda (`from`, `to`, `status`, `professional_id`).
- Modales abiertos / fila seleccionada.

## Caché

- Listas (services, professionals, appointments, clients, businesses) en memoria del feature tras fetch.
- Invalidar tras mutación exitosa (refetch de la lista afectada).
- Sin caché normalizada global en MVP (evita overengineering).

## Sincronización

1. Fetch al montar pantalla / cambiar filtros.
2. Mutación → toast éxito/error → refetch.
3. 401 → limpiar sesión → `/login`.

## Comunicación con APIs

- Un `apiClient` central.
- Funciones por dominio (`authApi`, `publicApi`, `businessApi`, `platformApi`).
- Envelope de error `{ error: { code, message, details } }` → `ApiError` tipado.

## Alternativa descartada

Redux/Zustand masivo para todo: costo sin beneficio con pantallas mayormente server-driven.
