// Vacío (p. ej. Docker + Nginx) → same-origin `/api/v1`.
// Sin definir → backend local por defecto.
const raw = import.meta.env.VITE_API_BASE_URL

export const API_BASE_URL =
  raw === undefined ? 'http://localhost:3000' : String(raw).replace(/\/$/, '')

export const API_V1 = `${API_BASE_URL}/api/v1`
