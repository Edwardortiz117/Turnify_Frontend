# 7. Diseño de componentes — Turnify

## Capas (Atomic Design ligero, sin Design System completo)

1. **Primitivos UI** — Button, Input, Select, Textarea, Label, Badge, Spinner, Alert.
2. **Compuestos** — FormField, Modal, EmptyState, Pagination, ConfirmDialog, Table.
3. **Negocio** — AppointmentStatusBadge, SlotPicker, ServiceCard, ProfessionalCard, DateDayPicker.
4. **Layout** — PublicLayout, AppShell, PlatformShell, AuthLayout.
5. **Navegación** — AppNav, PlatformNav, WizardSteps.
6. **Feedback** — Toast/AlertRegion, InlineError, FormErrorSummary.

## Por dominio

| Dominio | Componentes |
|---------|-------------|
| Auth | LoginForm, RegisterForm |
| Pública | BookingWizard, ContactForm, BookingConfirmation |
| Agenda | AppointmentList, AppointmentFilters, AppointmentActions, AssistedBookingForm |
| Catálogo | ServiceForm, ProfessionalForm, OfferingsEditor |
| Disponibilidad | WeeklyScheduleEditor, ExceptionForm |
| Clientes | ClientSearch, ClientEditForm |
| Plataforma | BusinessTable, BusinessStatusToggle, AssignManagerForm |

## Estructura visual (tokens)

- Tipografía: fuente legible sans distintiva (no Inter/Roboto por defecto del sistema de diseño genérico).
- Color: dirección clara (teal/slate profesional servicios), evitar púrpura genérico AI.
- Espaciado consistente; shell con contenido ancho máximo cómodo.
- Mobile-first en pública; desktop-first aceptable en paneles.

## Qué no construir

Librería de componentes publicada, theming multi-marca, storybook completo en MVP.
