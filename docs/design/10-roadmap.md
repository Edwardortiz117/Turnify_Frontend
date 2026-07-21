# 10. Roadmap — 3 semanas Frontend

## Semana 1 — Diseño cerrado + cimientos + pública

| Día | Entrega |
|-----|---------|
| 1–2 | Docs diseño 1–10 (este set) |
| 2–3 | Fase A: scaffold, api client, auth session, tipos, errores, datetime |
| 4–5 | Fase B iniciada: vitrina + wizard hasta slots |

**DoD semana 1:** app corre; login/register UI; reserva hasta ver slots (mock o API).

## Semana 2 — Pública + núcleo gerente

| Día | Entrega |
|-----|---------|
| 1–2 | Fase B: POST reserva, confirmación, cancel |
| 3–5 | Fase C: shell, dashboard, servicios, profesionales, ofertas, agenda básica |

**DoD semana 2:** circuito público completo; gerente crea catálogo y ve citas.

## Semana 3 — Gerente completo + plataforma + QA

| Día | Entrega |
|-----|---------|
| 1–2 | Disponibilidad, clientes, perfil, mutaciones cita |
| 3 | Fase D: panel plataforma delgado |
| 4–5 | Fase E: CORS, smoke 2 tenants, checklist `/api-docs` |

**DoD semana 3:** P0+P1 usable; sin fuga cross-tenant; errores críticos mapeados.

## Fases de build (orden fijo)

A → B → C → D → E (ver plan unificado).

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Backend no disponible | Mock layer en api client |
| Scope creep plataforma | Panel delgado fijo |
| Calendario complejo | Lista + date picker, no full calendar lib |
