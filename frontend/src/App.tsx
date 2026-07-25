import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AuthProvider } from './shared/auth/AuthContext'
import { AppRouter } from './app/router'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            className: 'font-sans text-sm',
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
