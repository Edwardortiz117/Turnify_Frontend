# 6. Diseño de pantallas — Turnify

Justificación: cada pantalla cubre un P0/P1 del alcance y un endpoint real.

## Auth

| Pantalla | Necesidad | Por qué existe |
|----------|-----------|----------------|
| Login | Acceder al panel | `POST /login` + redirect por scope |
| Registro | Alta gerente + negocio | `POST /register` |

## Pública

| Pantalla | Necesidad | Por qué |
|----------|-----------|---------|
| Vitrina `/:slug` | Ver negocio y empezar | `GET /businesses/:slug` |
| Paso servicio | Elegir qué reservar | Lista servicios activos |
| Paso profesional | Quién atiende | `.../professionals` |
| Paso fecha/slots | Cuándo | `.../slots` |
| Formulario contacto | Datos cliente | Body POST appointment |
| Confirmación | Cierre emocional + id | Post-éxito |
| Cancelar | Deshacer reserva | `POST .../cancel` |

*Implementación UX:* wizard en una ruta con pasos (mínimos clics, sin fragmentar URLs innecesarias) + ruta `/cancel/:appointmentId`.

## Gerente

| Pantalla | Necesidad | Por qué |
|----------|-----------|---------|
| Dashboard | Resumen del día/negocio | `GET /dashboard` |
| Agenda | Centro operativo | `GET /appointments` + mutaciones |
| Nueva/editar cita | Crear asistida / reprogramar | `POST` + reschedule |
| Servicios | Catálogo | CRUD services |
| Profesionales | Quién atiende + ofertas | professionals + PUT services |
| Disponibilidad | Horarios y bloques | weekly-schedule + exceptions |
| Clientes | Reutilizar datos | `GET /clients?q=` |
| Perfil | Slug, nombre, política | `GET\|PATCH /profile` |

## Plataforma

| Pantalla | Necesidad | Por qué |
|----------|-----------|---------|
| Dashboard | Salud SaaS | `GET /dashboard` |
| Negocios | Listar/crear | `GET\|POST /businesses` |
| Detalle negocio | Status + manager | GET + PATCH status + POST manager |

## Estados vacíos

- Sin servicios / sin profesionales / sin slots / agenda vacía / sin clientes / sin negocios.
- Cada uno con CTA hacia la acción que desbloquea el flujo.

## Errores

- Banner/toast por `error.code`.
- Página 404 genérica y “negocio no encontrado”.
- Bloqueo `BUSINESS_SUSPENDED` en público y gerente.

## Confirmaciones

- Cancelar cita, eliminar servicio, suspender negocio: modal de confirmación antes de mutar.
