import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { purgeLegacyRescheduleRequestStorage } from './shared/storage/rescheduleRequestStorage'
import { API_V1 } from './shared/config/env'

purgeLegacyRescheduleRequestStorage()

if (import.meta.env.DEV) {
  console.info(`[turnify] API → ${API_V1} (proxy/same-origin; not remote unless .env says so)`)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
