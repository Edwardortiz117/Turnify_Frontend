# Métricas enriquecidas, bloqueos y diferenciadores

**Estado:** Implementado en API (complementa [10-guia-implementacion-frontend-mvp.md](./10-guia-implementacion-frontend-mvp.md)).

---

## 1. Aclaración de producto: empleados vs acceso

En el MVP los **empleados no tienen login**. Son `Professional` (recurso agendable).

| Acción del gerente | Qué hace realmente |
|-------------------|--------------------|
| “Bloquear empleado” | `POST .../professionals/:id/block` → `status=inactive` (no aparece en público ni recibe citas). Opción `cancel_future` cancela citas confirmadas futuras. |
| “Desbloquear” | `POST .../professionals/:id/unblock` → `active` |

No hay “quitar acceso al panel” del empleado porque **no hay panel de empleado** aún. Eso queda como evolución post-MVP (rol `empleado` con JWT).

---

## 2. Dar de baja un negocio (admin plataforma) — cascada

`PATCH /api/v1/platform/businesses/:businessId/status`

```json
{ "status": "suspended", "reason": "Non-payment" }
```

Efectos:

1. `businesses.status = suspended` (+ `suspended_at`, `suspension_reason`)
2. **Todas** las cuentas gerente del tenant: `users.access_enabled = false`
3. Login del gerente → `403 ACCESS_DISABLED`
4. Rutas `/business/*` con JWT viejo → `403 ACCESS_DISABLED`
5. Vitrina `/public` → `403 BUSINESS_SUSPENDED`

Reactivar:

```json
{ "status": "active" }
```

Restaura `access_enabled=true` en membresías del negocio.

### Pausa del gerente (abierto/cerrado)

`PATCH /api/v1/business/profile` con `{ "status": "suspended" }`:

- Cierra reservas públicas.
- **No** bloquea el login del gerente (sigue operando el panel para reabrir).

---

## 3. Dashboards enriquecidos

### Gerente — `GET /api/v1/business/dashboard`

| Métrica | Uso en UI |
|---------|-----------|
| `appointments_today` / `appointments_tomorrow` | KPI del día |
| `upcoming_next_24h` | Urgencia operativa |
| `confirmed/cancelled/completed/no_show_this_week` | Volumen semanal |
| `no_show_rate_week` / `cancellation_rate_week` | Calidad / fricción |
| `public_bookings_week` vs `staff_bookings_week` | Canal (autoservicio vs asistida) |
| `by_status` | Distribución |
| `by_professional_today` | Carga del equipo |
| `top_services_week` | Qué vende |
| `top_clients_week` | Fidelidad |
| `catalog.*` | Salud del catálogo |
| `alerts[]` | Acciones: sin profesionales, sin horario, no-show alto |

### Admin — `GET /api/v1/platform/dashboard`

| Métrica | Uso en UI |
|---------|-----------|
| `businesses_active` / `businesses_suspended` | Portfolio |
| `businesses_created_last_7_days` | Crecimiento |
| Citas 7d por estado | Salud global |
| `avg_bookings_per_active_business_7d` | Intensidad media |
| `managers_access_locked` | Cuentas bloqueadas por baja |
| `appointments_by_day_last_7_days` | Serie temporal |
| `top_businesses_by_bookings_7d` | Ranking tenants |
| `recent_businesses` | Altas recientes |

---

## 4. Bloqueo de clientes (diferenciador operativo)

| Método | Ruta | Efecto |
|--------|------|--------|
| POST | `/business/clients/:id/block` | `active=false` |
| POST | `/business/clients/:id/unblock` | `active=true` |

Si un cliente bloqueado intenta reservar (público o asistido) → `403 CLIENT_BLOCKED`.

Caso de uso: no-shows reiterados, abuso, conflictos.

---

## 5. Otros diferenciadores ya en la API (aprovechar en front)

| Capacidad | Dónde |
|-----------|--------|
| Alertas accionables en dashboard | `alerts[]` del gerente |
| Log viewer sin CapRover | `GET /platform/log-viewer` |
| Health detallado | `GET /platform/health` |
| Reset / change password | `/auth/*` + admin set password |
| Idempotency-Key en reserva pública | Header en `POST .../book` |
| Documento (cédula) en registro/vínculo | Identity |
| Motivo de suspensión SaaS | `reason` en status platform |

---

## 6. Códigos de error nuevos / relevantes

| Code | HTTP | Cuándo |
|------|------|--------|
| `ACCESS_DISABLED` | 403 | Cuenta gerente bloqueada por baja del tenant |
| `BUSINESS_SUSPENDED` | 403 | Público público (o negocio cerrado) |
| `CLIENT_BLOCKED` | 403 | Cliente en lista de bloqueo |
| `PROFESSIONAL_INACTIVE` | 409 | Empleado bloqueado al agendar |

---

## 7. Checklist UI

- [ ] Dashboard gerente con tasas, tops y alertas (no solo 2 KPIs)
- [ ] Dashboard platform con serie 7d + top tenants + locked managers
- [ ] Toggle abierto/cerrado del gerente (`profile.status`) sin echarlo del panel
- [ ] Botón admin “Dar de baja” con `reason` + confirmación de cascada
- [ ] Equipo: Block / Unblock profesional (+ checkbox cancelar citas futuras)
- [ ] Clientes: Block / Unblock
- [ ] Manejar `ACCESS_DISABLED` → mensaje “negocio dado de baja; contacte soporte”
