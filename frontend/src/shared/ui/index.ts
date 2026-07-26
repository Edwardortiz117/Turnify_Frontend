/**
 * Design system public API (Atomic Design).
 *
 * Prefer: `import { Button, Card } from '../../shared/ui'`
 *
 * Layout:
 * - atoms/      — primitives
 * - molecules/  — composed controls
 * - organisms/  — complex UI blocks
 * - templates/  — page chrome / shells
 */

// Atoms
export { Alert } from './atoms/Alert'
export { Badge } from './atoms/Badge'
export { BrandLogo } from './atoms/BrandLogo'
export { Button } from './atoms/Button'
export type { ButtonProps } from './atoms/Button'
export { Input } from './atoms/Input'
export { Label } from './atoms/Label'
export { Select } from './atoms/Select'
export { Skeleton, Spinner } from './atoms/Spinner'

// Molecules
export { AppointmentStatusBadge } from './molecules/AppointmentStatusBadge'
export { Card, selectableCardClass } from './molecules/Card'
export { ConfirmDialog } from './molecules/ConfirmDialog'
export { EmptyState } from './molecules/EmptyState'
export { FormField, FormFieldInput, FormFieldSelect } from './molecules/FormField'
export type { FormFieldInputProps, FormFieldSelectProps } from './molecules/FormField'
export { Modal } from './molecules/Modal'
export { PageHeader } from './molecules/PageHeader'
export { PageLoading, PageSkeleton } from './molecules/PageLoading'
export { TextLink } from './molecules/TextLink'
export { WizardSteps } from './molecules/WizardSteps'

// Organisms
export { SiteFooter } from './organisms/SiteFooter'
export { UserMenu } from './organisms/UserMenu'

// Templates
export { AuthLayout, PublicLayout, ShellFrame } from './templates/ShellLayouts'
export { MarketingShell } from './templates/MarketingShell'

export {
  glassPanelClass,
  glassHeaderClass,
  glassNavClass,
  glassPopoverClass,
  glassCardAuthClass,
} from './lib/glass'

export type { ShellLink } from './templates/ShellLayouts'
