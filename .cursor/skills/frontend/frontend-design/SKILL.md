---
name: frontend-design
description: >-
  Guidance for distinctive, intentional visual design in the Turnify frontend
  (React + Vite + Tailwind SPA). Use when building or reshaping UI under
  frontend/, marketing/public booking surfaces, auth screens, manager or
  platform shells, shared UI primitives, tokens in index.css, or when aligning
  visuals with docs/design (screens, components, product).
---

# Turnify — Frontend Design

Approach UI work as design lead for Turnify: deliberate choices on palette,
typography, and layout that fit this product — not a generic SaaS template.
Take one justified aesthetic risk when creating a **new** surface; when editing
an existing one, preserve the established system unless the brief asks to change it.

## Scope

| In scope | Out of scope |
|----------|--------------|
| Visual/UX under `frontend/` | Inventing API contracts or domain rules |
| Tokens, layouts, primitives, feature screens | Published component library / multi-brand theming |
| Copy visible in the UI (Spanish) | Backend English identifiers / error `message` strings |

Stack: React + Vite + TypeScript + Tailwind + React Router. Features import only
`shared`; screens orchestrate, business components present
(`docs/design/05-arquitectura-frontend.md`).

## Ground it in the product

Turnify is a multi-tenant SaaS MVP for appointment management (San José de
Cúcuta). Before designing, name: **surface**, **actor**, and the screen’s
**single job**.

| Surface | Path | Actor | Job tone |
|---------|------|-------|----------|
| Public booking | `/:slug`, `/cancel/:…` | Cliente (no login) | Low friction; mobile-first |
| Auth | `/login`, `/register` | Gerente / platform | Clear, trustworthy |
| Business app | `/app/*` | Gerente (`scope=business`) | Operational; agenda-centric |
| Platform | `/platform/*` | Admin (`scope=platform`) | Dense admin; desktop-first OK |

If memory or prior work in this repo exists, use it as a hint. Prefer real
domain content (servicios, profesionales, slots, citas) over placeholder
marketing filler.

Product/UX source of truth: `docs/design/` (esp. 01, 06, 07). Do not contradict
closed design decisions; if UI needs a deviation, say so explicitly.

## Established visual system (do not fight it)

Existing tokens live in `frontend/src/index.css` (`@theme`): brand teal scale,
ink/muted/surface/card/border, danger/warning, `--font-sans` (DM Sans),
`--font-display` (Fraunces). Docs (`07-diseno-componentes.md`) already pin:
legible distinctive sans (not Inter/Roboto as the design-system default),
teal/slate professional services direction, avoid generic purple AI look.

- **Editing existing UI**: reuse these tokens, layouts
  (`PublicLayout` / `AppShell` / `PlatformShell` / `AuthLayout`), and primitives
  in `frontend/src/shared/ui/`. Derive colors and type from the token set.
- **New surface or explicit redesign**: still start from the token system; only
  extend it when the brief requires it, and keep extensions named and coherent.
- Where `docs/design/` or the user brief pins a direction, that wins — including
  when it asks for a look that would otherwise be “default.”

## Design principles

**Hero is a thesis (public / promotional only).** Open with the most
characteristic thing for that surface. Panels (`/app`, `/platform`) are tools:
prioritize hierarchy, scanability, and task completion over marketing heroes.

**Typography carries personality.** Pair display and body deliberately; use
`--font-display` with restraint and `--font-sans` for UI chrome and forms. Set a
clear type scale. Do not introduce new font families without a brief reason.

**Structure is information.** Eyebrows, dividers, numbered steps should encode
something true (e.g. booking wizard steps). Numbered markers (01 / 02 / 03) only
when order is meaningful.

**Motion with purpose.** Prefer one orchestrated moment (step change, confirm)
over scattered effects. Respect `prefers-reduced-motion`. Extra animation that
reads as “AI-generated polish” is a net negative.

**Match complexity to the surface.** Public vitrina can be more expressive;
manager/platform shells need precision in spacing, density, and feedback states
(empty, loading, error). Elegance is executing the chosen vision well.

**Cards and chrome.** Prefer existing patterns. Cards only when they aid an
interaction or group a real unit of work; avoid decorative card stacks in heroes.

## Process: plan, critique, build

For calibration: AI-default looks to avoid **unless the brief asks for them** —
(1) warm cream + high-contrast serif + terracotta; (2) near-black + single acid
accent; (3) broadsheet hairline / zero-radius newspaper columns; also generic
purple-on-white gradients. Prefer Turnify’s teal/slate system over those
clusters when the axis is free.

Work in two passes:

1. **Plan** — Compact tokens (or “reuse `index.css`”), type roles, layout concept
   (one-sentence + ASCII if helpful), and one **signature** element appropriate
   to the surface (public may have one; app shells often already have brand in
   the shell — don’t force a second signature).
2. **Critique** — If any part reads like a generic template for “any SaaS,”
   revise before coding. Then implement from the plan; derive colors/type from
   tokens. Watch CSS specificity clashes (utility + custom classes cancelling
   paddings/margins between sections).

Keep iteration in thinking; show the user plans when confidence is high enough
to be useful.

## Restraint and quality floor

Spend boldness in one place. Cut decoration that does not serve the brief.
Quality floor without announcing it: responsive (public mobile-first; panels
usable on narrow viewports), visible keyboard focus, reduced motion respected.
Critique as you build (screenshots if available). Before finishing, remove one
non-essential accessory.

## Writing in the UI

UI language is **Spanish**; code, routes, and API fields stay **English**
(`docs/design/01-comprension-producto.md`). Map API `error.code` to user-facing
Spanish via shared error helpers — never expose raw envelope English to end users
as the primary message.

Words exist to make the product easier to understand and use. Name controls by
what people manage (cita, servicio, horario), not by system internals. Active
voice; sentence case; same action name through the flow (“Cancelar cita” →
confirmation that the cita was cancelled). Failure and empty states give
direction and a CTA that unblocks the flow (see empty states in
`docs/design/06-diseno-pantallas.md`). Errors do not apologize vaguely; empty
screens invite the next useful action.

## Component layers (reuse before invent)

Follow Atomic Design light from `docs/design/07-diseno-componentes.md`:

1. Primitives → 2. Compounds → 3. Business → 4. Layout → 5. Nav → 6. Feedback

Do not build a published design system, Storybook suite, or multi-brand theming
in MVP unless explicitly requested.

## Related docs

| Topic | Doc |
|-------|-----|
| Product / actors | `docs/design/01-comprension-producto.md` |
| Screens | `docs/design/06-diseno-pantallas.md` |
| Components / tokens intent | `docs/design/07-diseno-componentes.md` |
| Feature modules | `docs/design/05-arquitectura-frontend.md` |
| API for UI | `docs/frontend-api-contract.md` |
| Domain/API compliance (backend-facing) | `.cursor/skills/turnify-design-compliance/SKILL.md` |
