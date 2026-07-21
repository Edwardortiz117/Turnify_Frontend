# 2. Alcance del MVP — Turnify Frontend

## Prioridades

| Prioridad | Criterio |
|-----------|----------|
| P0 | Sin esto no hay circuito de valor |
| P1 | Cierra el SaaS multiempresa |
| P2 | Diferido post-MVP |

## Incluye — P0 Público (`/api/v1/public`)

| Funcionalidad | Endpoints |
|---------------|-----------|
| Vitrina negocio | `GET /businesses/:slug` |
| Listar servicios | `GET .../services` |
| Profesionales por servicio | `GET .../services/:id/professionals` |
| Slots | `GET .../slots?date=` |
| Reservar (+ Idempotency-Key) | `POST .../appointments` |
| Cancelar con teléfono | `POST /appointments/:id/cancel` |

## Incluye — P0 Gerente (`/api/v1/auth` + `/business`)

| Funcionalidad | Endpoints |
|---------------|-----------|
| Registro / login / me | `POST /register`, `POST /login`, `GET /me` |
| Dashboard | `GET /dashboard` |
| Perfil negocio | `GET\|PATCH /profile` |
| Servicios CRUD | `GET\|POST /services`, `PATCH\|DELETE /services/:id` |
| Profesionales | `GET\|POST /professionals`, `PATCH /:id` |
| Ofertas | `GET\|PUT /professionals/:id/services` |
| Horario semanal | `GET\|PUT .../weekly-schedule` |
| Excepciones | `GET\|POST .../availability-exceptions`, `DELETE` |
| Citas | `GET\|POST /appointments`, acciones cancel/reschedule/complete/no-show |
| Clientes | `GET /clients?q=`, `PATCH /clients/:id` |

## Incluye — P1 Plataforma (`/api/v1/platform`)

| Funcionalidad | Endpoints |
|---------------|-----------|
| Dashboard | `GET /dashboard` |
| Listar/crear negocios | `GET\|POST /businesses` |
| Detalle | `GET /businesses/:id` |
| Suspender/activar | `PATCH .../status` |
| Vincular gerente | `POST .../manager` |

## Exclusiones explícitas

- App nativa / PWA avanzada
- Pagos y facturación
- Notificaciones WhatsApp/SMS
- Login de empleados (Professional ≠ User)
- GET detalle servicio/profesional/cliente (API no lo expone; usar listas)
- Rate-limit UX avanzada
- Marketplace / descubrimiento de negocios
- Multi-idioma

## Alternativas descartadas

| Alternativa | Por qué no |
|-------------|------------|
| Solo panel gerente | Rompe el circuito “publicar y recibir reservas” |
| Tres repos frontend | Overengineering en 3 semanas |
| Portal con cuenta de cliente | API pública no requiere auth de cliente |

## Impacto

- **UX:** foco en dos caminos felices (reservar / operar agenda).
- **Mantenimiento:** superficie acotada a endpoints reales; sin deuda de features fantasma.
