import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './shared/auth/AuthContext'
import { AppRouter } from './app/router'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  )
}
