# Guía de implementación frontend — MVP Turnify

**Audiencia:** equipo frontend que consume este backend.  
**Fuente de verdad de contratos:** OpenAPI en `/api-docs` (Scalar) y este documento para flujos de producto.

---

## 1. Idea del MVP (qué resuelve)

Turnify es un SaaS multi-tenant de **citas / turnos**:

1. Un **gerente** crea y opera **su negocio** (empleados, servicios, horarios, agenda, clientes).
2. Los **clientes** reservan y cancelan **sin login** en la vitrina pública (`/public`).
3. Un **admin de plataforma** supervisa el SaaS (tenants, métricas globales, salud, logs) **sin** operar el día a día de cada negocio.

**No en MVP:** login de empleados, app móvil nativa, email transaccional productivo, pasarela de pagos.

---

## 2. Roles y pantallas recomendadas

| Rol | Login | Ámbito JWT `scope` | App / área UI |
|-----|-------|--------------------|---------------|
| Admin plataforma | Sí | `platform` | Panel SaaS |
| Gerente | Sí | `business` (+ `business_id`) | Panel negocio |
| Empleado | No | — | Solo aparece como recurso agendable |
| Cliente | No | — | Web pública por `slug` |

**Regla de oro en el front:** después del login, ramificar por `scope`. Nunca mezclar menús platform y business en el mismo layout sin guardas.

```text
login → scope?
  platform → /platform/*
  business → /business/*
```

---

## 3. Auth (todos los flujos)

Base: `/api/v1/auth`

| Método | Ruta | Quién | Notas |
|--------|------|-------|-------|
| POST | `/register` | Visitante → gerente | Crea usuario + negocio + membresía. Body: `email`, `password`, `document`, `business{name,slug}` |
| POST | `/login` | Gerente / Admin | Un solo login; el `scope` viene en la respuesta |
| GET | `/me` | Autenticado | Refrescar sesión / hidratar store |
| POST | `/forgot-password` | Público | Siempre 200. En no-prod suele devolver `reset_token` |
| POST | `/reset-password` | Público | `{ token, password }` |
| POST | `/change-password` | Autenticado | `{ current_password, new_password }` |

**Bearer:** `Authorization: Bearer <access_token>`.

### UX auth sugerida

- Registro gerente: formulario con documento (cédula), email, password, nombre negocio, slug (preview URL pública).
- Login: un formulario; tras éxito redirigir según `scope`.
- Olvidé contraseña: pedir email → si hay `reset_token` (dev/staging), pantalla “pega token + nueva clave”; en prod conectar email más adelante o usar reset admin.
- Ajustes → cambiar contraseña (ambos roles).

---

## 4. Panel gerente (`scope=business`)

Prefijo: `/api/v1/business` — **todas** las llamadas llevan JWT business. El `business_id` **no** se elige en query: viene del token.

### 4.1 Home / dashboard

`GET /business/dashboard`

KPIs enriquecidos: hoy/mañana, próximas 24h, tasas de no-show/cancelación, canal público vs staff, top servicios/clientes, salud del catálogo y **`alerts[]`** accionables.

Detalle: [11-metricas-bloqueo-y-diferenciadores.md](./11-metricas-bloqueo-y-diferenciadores.md).

### 4.1b Equipo y clientes — bloqueos

| Acción | Ruta |
|--------|------|
| Bloquear empleado (agenda) | `POST /professionals/:id/block` `{ cancel_future?: boolean }` |
| Desbloquear empleado | `POST /professionals/:id/unblock` |
| Bloquear cliente | `POST /clients/:id/block` |
| Desbloquear cliente | `POST /clients/:id/unblock` |

Empleados **no tienen login** en MVP: bloquear = dejarlos inactivos para citas.

### 4.2 Negocio (abierto / cerrado)

| Método | Ruta | Uso UI |
|--------|------|--------|
| GET | `/profile` | Configuración |
| PATCH | `/profile` | Editar nombre, slug, política cancelación, `status: active\|suspended` |

**Toggle “negocio abierto/cerrado”** = `PATCH` con `status`. Suspendido → el público no puede reservar.

### 4.3 Catálogo

| Recurso | Rutas principales |
|---------|-------------------|
| Servicios | `GET/POST /services`, `PATCH/DELETE /services/:id` |
| Empleados (`professionals`) | `GET/POST /professionals`, `PATCH /professionals/:id` |
| Ofertas | `GET/PUT /professionals/:id/services` |
| Horario semanal | `GET/PUT /professionals/:id/weekly-schedule` |
| Bloqueos | `GET/POST .../availability-exceptions`, `DELETE .../:exceptionId` |

Pantallas sugeridas: Servicios, Equipo, Horarios (por empleado).

### 4.4 Agenda y citas

| Método | Ruta | Acción UI |
|--------|------|-----------|
| GET | `/appointments` | Agenda / lista (filtros fecha/estado) |
| POST | `/appointments` | Reserva asistida (teléfono) |
| POST | `.../cancel` | Anular |
| POST | `.../reschedule` | Reprogramar |
| POST | `.../complete` | Completada |
| POST | `.../no-show` | No asistió |

### 4.5 Clientes

`GET /clients`, `PATCH /clients/:id` — CRM mínimo del tenant.

---

## 5. Vitrina pública (cliente sin login)

Prefijo: `/api/v1/public`

Flujo feliz de reserva:

1. `GET /public/businesses/:slug` — perfil + servicios  
2. Elegir servicio → profesionales que lo ofrecen  
3. `GET .../slots` — slots libres  
4. `POST .../book` — crear cita `confirmed` (header opcional `Idempotency-Key`)  
5. `POST .../appointments/:id/cancel` — cancelar con id + teléfono  

UI: landing por slug, wizard servicio → profesional → fecha → datos de contacto.

---

## 6. Panel admin plataforma (`scope=platform`)

Prefijo: `/api/v1/platform`

### 6.1 Dashboard SaaS

`GET /platform/dashboard` — activos/suspendidos, altas 7d, citas por estado, serie diaria, top tenants, managers bloqueados.

Ver [11-metricas-bloqueo-y-diferenciadores.md](./11-metricas-bloqueo-y-diferenciadores.md).

### 6.1b Dar de baja (cascada)

`PATCH /platform/businesses/:id/status` `{ "status": "suspended", "reason": "..." }`  
Bloquea login de gerentes del tenant (`ACCESS_DISABLED`) + cierra público.

### 6.2 Tenants

| Método | Ruta | Uso |
|--------|------|-----|
| GET | `/businesses` | Listado |
| POST | `/businesses` | Alta tenant (`manager_document` opcional) |
| GET | `/businesses/:id` | Detalle + gerente vinculado |
| PATCH | `/businesses/:id/status` | Suspender / reactivar a nivel SaaS |

**Producto recomendado:** el happy path de onboarding es **autoregistro del gerente**. Crear tenant + vincular gerente es camino secundario (ops). Si no quieren “asignar gerentes” en UI, oculten esas pantallas.

### 6.3 Log viewer (esencial ops)

`GET /platform/log-viewer?level=error&limit=100&q=SLOT`

- Buffer en memoria (últimos ~1000 logs del proceso).
- No sobrevive a redeploy; sirve para diagnóstico sin CapRover.
- Secretos redactados.
- UI: tabla con nivel, tiempo, mensaje, filtros.

### 6.4 Salud del sistema

`GET /platform/health` — DB, uptime, tamaño del buffer de logs.  
(Complementa el `GET /health` público liviano.)

### 6.5 Ops de identidad

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/managers` | Alta gerente sin membresía |
| POST | `/businesses/:id/manager` | Vincular por `user_id` \| `document` \| create+assign |
| POST | `/users/:userId/password` | Forzar nueva contraseña |

---

## 7. Errores y convención HTTP

Envelope:

```json
{
  "error": {
    "code": "SLOT_OCCUPIED",
    "message": "The selected time slot is no longer available.",
    "details": {}
  }
}
```

| HTTP | Uso en UI |
|------|-----------|
| 400 | Formulario / `VALIDATION_ERROR` + `details` por campo |
| 401 | Sesión inválida → login |
| 403 | Scope incorrecto o negocio suspendido en público |
| 404 | Recurso inexistente (no filtrar existencia cross-tenant) |
| 409 | Conflicto (slug, solape, membresía) |
| 422 | Regla de negocio (fuera de horario, cancel tarde) |

Mostrar `error.message` al usuario; usar `error.code` para lógica (toasts, reintentos).

Correlación: header `X-Request-Id` / campo `requestId` en logs.

---

## 8. Mapa de navegación sugerido

### App gerente

```text
/login | /register | /forgot-password | /reset-password
/app
  /dashboard
  /agenda
  /services
  /team
  /clients
  /settings   (perfil negocio + change-password)
```

### App plataforma

```text
/login
/platform
  /dashboard
  /businesses
  /businesses/:id
  /log-viewer
  /health
  /settings   (change-password)
```

### Web pública

```text
/:slug
/:slug/book
/:slug/cancel
```

---

## 9. Cómo sacar provecho de todo el backend

1. **Un token, dos UIs** — mismo login; guards por `scope`.  
2. **Documento en registro** — identidad del gerente sin UUID manual.  
3. **Dashboard dual** — KPIs distintos; no reutilizar el mismo widget.  
4. **Idempotency-Key** en reserva pública — botón “Reservar” a prueba de doble click.  
5. **Suspender** en gerente (propio) y en admin (SaaS) — ambos afectan `/public`.  
6. **Log viewer + health** — panel ops para el admin sin SSH/CapRover.  
7. **Reset password** — flujo self-service + botón admin “definir contraseña”.  
8. **OpenAPI** — generar tipos/cliente desde `/openapi.json` o Scalar.

---

## 10. Checklist de aceptación frontend

- [ ] Login único → redirect por `scope`
- [ ] Registro con `document` + slug válido
- [ ] Dashboard gerente y dashboard platform (métricas + `alerts`)
- [ ] CRUD servicios/empleados/horarios
- [ ] Block/unblock profesional y cliente
- [ ] Agenda: cancel / reschedule / complete / no-show
- [ ] Toggle abierto/cerrado del negocio (gerente, sin echarse del panel)
- [ ] Admin: dar de baja con cascada + manejar `ACCESS_DISABLED`
- [ ] Flujo público completo por slug
- [ ] Forgot / reset / change password
- [ ] Log viewer + health solo admin
- [ ] Manejo envelope de errores + 401→logout

---

## 11. Referencias

- Diseño cerrado: `docs/design/01` … `09`
- Roles: [05b-roles-ambitos-api.md](./05b-roles-ambitos-api.md)
- Contratos REST: [07-diseno-apis.md](./07-diseno-apis.md) + OpenAPI live
- Métricas / bloqueos: [11-metricas-bloqueo-y-diferenciadores.md](./11-metricas-bloqueo-y-diferenciadores.md)
- README del repo: variables, seed demo, deploy CapRover
