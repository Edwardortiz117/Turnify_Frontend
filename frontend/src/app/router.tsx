import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { PageLoading } from '../shared/ui'

const AppShell = lazy(() =>
  import('../features/app/AppShell').then((m) => ({ default: m.AppShell })),
)
const PlatformShell = lazy(() =>
  import('../features/platform/PlatformShell').then((m) => ({ default: m.PlatformShell })),
)
const PlatformAccountPage = lazy(() =>
  import('../features/platform/PlatformAccountPage').then((m) => ({
    default: m.PlatformAccountPage,
  })),
)
const PlatformHealthPage = lazy(() =>
  import('../features/platform/PlatformHealthPage').then((m) => ({
    default: m.PlatformHealthPage,
  })),
)
const PlatformLogViewerPage = lazy(() =>
  import('../features/platform/PlatformLogViewerPage').then((m) => ({
    default: m.PlatformLogViewerPage,
  })),
)
const PlatformDashboardPage = lazy(() =>
  import('../features/platform/PlatformDashboardPage').then((m) => ({
    default: m.PlatformDashboardPage,
  })),
)
const PlatformBusinessesPage = lazy(() =>
  import('../features/platform/PlatformBusinessesPage').then((m) => ({
    default: m.PlatformBusinessesPage,
  })),
)
const PlatformBusinessDetailPage = lazy(() =>
  import('../features/platform/PlatformBusinessDetailPage').then((m) => ({
    default: m.PlatformBusinessDetailPage,
  })),
)
const HomePage = lazy(() =>
  import('../features/auth/HomePage').then((m) => ({ default: m.HomePage })),
)
const LoginPage = lazy(() =>
  import('../features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RegisterPage = lazy(() =>
  import('../features/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })),
)
const ForgotPasswordPage = lazy(() =>
  import('../features/auth/ForgotPasswordPage').then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import('../features/auth/ResetPasswordPage').then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
const PublicBookingPage = lazy(() =>
  import('../features/public-booking/PublicBookingPage').then((m) => ({
    default: m.PublicBookingPage,
  })),
)
const CancelAppointmentPage = lazy(() =>
  import('../features/public-booking/CancelAppointmentPage').then((m) => ({
    default: m.CancelAppointmentPage,
  })),
)
const MyAppointmentsPage = lazy(() =>
  import('../features/public-booking/MyAppointmentsPage').then((m) => ({
    default: m.MyAppointmentsPage,
  })),
)
const DashboardPage = lazy(() =>
  import('../features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const AppointmentsPage = lazy(() =>
  import('../features/appointments/AppointmentsPage').then((m) => ({
    default: m.AppointmentsPage,
  })),
)
const ServicesPage = lazy(() =>
  import('../features/catalog/ServicesPage').then((m) => ({ default: m.ServicesPage })),
)
const ProfessionalsPage = lazy(() =>
  import('../features/catalog/ProfessionalsPage').then((m) => ({
    default: m.ProfessionalsPage,
  })),
)
const AvailabilityPage = lazy(() =>
  import('../features/availability/AvailabilityPage').then((m) => ({
    default: m.AvailabilityPage,
  })),
)
const ClientsPage = lazy(() =>
  import('../features/clients/ClientsPage').then((m) => ({ default: m.ClientsPage })),
)
const ProfilePage = lazy(() =>
  import('../features/business-profile/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  })),
)

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageLoading />}>{children}</Suspense>
}

export function AppRouter() {
  return (
    <Lazy>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/cancel/:appointmentId" element={<CancelAppointmentPage />} />

        <Route element={<RequireAuth scope="business" />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="services" element={<ServicesPage />} />
            <Route path="professionals" element={<ProfessionalsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth scope="platform" />}>
          <Route path="/platform" element={<PlatformShell />}>
            <Route index element={<PlatformDashboardPage />} />
            <Route path="businesses" element={<PlatformBusinessesPage />} />
            <Route path="businesses/:businessId" element={<PlatformBusinessDetailPage />} />
            <Route path="log-viewer" element={<PlatformLogViewerPage />} />
            <Route path="health" element={<PlatformHealthPage />} />
            <Route path="account" element={<PlatformAccountPage />} />
          </Route>
        </Route>

        <Route path="/:slug/mis-citas" element={<MyAppointmentsPage />} />
        <Route path="/:slug" element={<PublicBookingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Lazy>
  )
}
