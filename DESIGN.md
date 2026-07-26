# Design System — Turnify

<!-- impeccable:design-schema 1 -->

## World

**Mode:** Operate (paneles) + Persuade ligero (pública/auth).  
**Thesis:** Software de citas premium, denso y calmado — acento teal Turnify sobre neutros slate, tipografía de trabajo, superficies glass coherentes (blur + blanco translúcido) y bordes hairline. Evita cards decorativas y dashboards de “metric soup”.

**Color strategy:** Restrained — neutros + un acento brand (teal). Light mode (oficinas/locales con luz diurna) con fondo atmosférico suave para que el glass se lea.

## Palette

| Token | Value | Role |
|-------|-------|------|
| `--color-brand-600/700` | teal | CTA, focus, links |
| `--color-ink` | `#0f172a` | Texto primario |
| `--color-muted` | `#64748b` | Secundario |
| `--color-surface` | `#f4f6f8` | Fondo app |
| `--color-card` | `#ffffff` | Superficies interactivas |
| `--color-border` | `#e2e8f0` | Hairlines |
| `--color-danger` | `#dc2626` | Destructivo |
| `--color-warning` | `#d97706` | Alertas |
| `--color-success` | `#059669` | Éxito |

## Typography

- **UI + display:** Manrope (una sola familia geometric sans; pesos 400–800). Evita Inter/DM Sans/Fraunces saturados en UIs AI.
- Títulos de página: `font-display font-bold tracking-tight` (mismo face, más peso).
- Escala: `text-xs` … `text-3xl`.

## Spacing & radius

- Base 4px. Ritmo: `gap-2` / `gap-3` / `gap-4` / `gap-6`.
- **Densidad Operate:** paneles con `max-w-7xl`, padding de página `py-4`–`py-5`, headers compactos.
- **Persuade (landing):** composición full-bleed (split copy + imagen), sin columna centrada estrecha.
- Radius: `sm` 6px, `md` 8px (`rounded-lg`), `lg` 12px (`rounded-xl`). Evitar `rounded-2xl` salvo media/modales.

## Elevation

- Sistema glass compartido (`glass-panel`, `glass-header`, `glass-nav`, `glass-popover` en `shared/ui/lib/glass.ts`).
- Cards, chrome (nav/header/footer), modales y menús usan el mismo blur (~18px) y blanco ~70–85%.
- Inputs/selects permanecen sólidos (legibilidad de formularios).
- Respetar `prefers-reduced-transparency`: superficies opacas.

## Motion

| Token | Value |
|-------|-------|
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` |
| Press | `scale(0.97)`, 100–160ms |
| Modal | 200–250ms opacity + scale 0.96 |
| Nav lateral | sin animación de contenido (alta frecuencia) |

Respetar `prefers-reduced-motion`: opacity only / sin scale.

## Components

Atomic Design en `frontend/src/shared/ui/`:

- **atoms** — Button, Input, Label, Select, Alert, Badge, Spinner, BrandLogo
- **molecules** — FormField, Modal, ConfirmDialog, Card, EmptyState, PageHeader, WizardSteps
- **organisms** — UserMenu, SiteFooter
- **templates** — ShellFrame, AuthLayout, PublicLayout

Importar desde el barrel: `import { Button, Card } from '../../shared/ui'`.

Cards solo cuando agrupan interacción o formularios. Empty/loading/error states obligatorios en listas.

## Anti-patterns

Glass inconsistente (blur/opacidad distintos por pantalla), pills excesivas, sombras multicapa, púrpura genérico AI, cream+terracotta, animar navegación o acciones de teclado.
