import { Navigate, Route, Routes } from 'react-router-dom'
import { RequireAuth } from './RequireAuth'
import { AppShell } from '../features/app/AppShell'
import { PlatformShell } from '../features/platform/PlatformShell'
import { PlatformAccountPage } from '../features/platform/PlatformAccountPage'
import { PlatformHealthPage } from '../features/platform/PlatformHealthPage'
import { PlatformLogViewerPage } from '../features/platform/PlatformLogViewerPage'
import { HomePage } from '../features/auth/HomePage'
import { LoginPage } from '../features/auth/LoginPage'
import { RegisterPage } from '../features/auth/RegisterPage'
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage'
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage'
import { PublicBookingPage } from '../features/public-booking/PublicBookingPage'
import { CancelAppointmentPage } from '../features/public-booking/CancelAppointmentPage'
import { MyAppointmentsPage } from '../features/public-booking/MyAppointmentsPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { AppointmentsPage } from '../features/appointments/AppointmentsPage'
import { ServicesPage } from '../features/catalog/ServicesPage'
import { ProfessionalsPage } from '../features/catalog/ProfessionalsPage'
import { AvailabilityPage } from '../features/availability/AvailabilityPage'
import { ClientsPage } from '../features/clients/ClientsPage'
import { ProfilePage } from '../features/business-profile/ProfilePage'
import {
  PlatformBusinessDetailPage,
  PlatformBusinessesPage,
  PlatformDashboardPage,
} from '../features/platform/PlatformPages'

export function AppRouter() {
  return (
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
  )
}
