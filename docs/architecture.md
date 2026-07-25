# Arquitectura frontend Turnify

## Capas

```
app/           → router, guards, providers
features/*/    → pages, hooks, components de dominio
shared/api/    → client HTTP, tipos, business/public services
shared/ui/     → design system (Atomic Design)
  atoms/
  molecules/
  organisms/
  templates/
shared/auth/   → sesión
shared/lib/    → datetime helpers vía shared/datetime, cn
shared/hooks/  → useAsyncResource
```

## Reglas

1. **Sin fetch en componentes** — solo vía `shared/api/*` o `features/*/api`.
2. **Features no importan otras features** — solo `shared`.
3. **UI desde el barrel** — `import { Button, Card } from '../../shared/ui'`.
4. **Estado global mínimo** — AuthContext; resto local o hooks de feature.
5. **Lazy routes** — por página / superficie.
6. **Mutaciones destructivas** — `ConfirmDialog` (nunca `window.confirm`).

## API

| Módulo | Prefijo |
|--------|---------|
| `shared/api/business.ts` | `/business/*` |
| `shared/api/public.ts` | `/public/*` |
| `features/auth/api.ts` | `/auth/*` |
| `features/platform/api.ts` | `/platform/*` |

## Design system (Atomic)

| Capa | Ejemplos |
|------|----------|
| Atoms | Button, Input, Label, Select, Alert, Badge, Spinner, BrandLogo |
| Molecules | FormField, Modal, ConfirmDialog, Card, EmptyState, PageHeader, WizardSteps |
| Organisms | UserMenu, SiteFooter |
| Templates | ShellFrame, AuthLayout, PublicLayout |

Ver `DESIGN.md` y `shared/ui/index.ts`. Toasts: Sonner.

## Decisiones

| Decisión | Por qué |
|----------|---------|
| Sin FullCalendar | Vista día/lista suficiente |
| Sonner | Toasts sin reinventar |
| clsx + cva | Variantes tipadas |
| Lazy + Suspense | Bundle por ruta |
| API en `shared/api` | Fronteras claras |
| 1 archivo por página platform | Chunks pequeños |
| Import barrel `shared/ui` | Evitar paths frágiles a atoms/* |
