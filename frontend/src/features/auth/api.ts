import { apiRequest } from '../../shared/api/client'
import type { AuthTokenResponse, UserMe } from '../../shared/api/types'

export function register(input: {
  email: string
  password: string
  business: { name: string; slug: string }
}) {
  return apiRequest<AuthTokenResponse>('/auth/register', { method: 'POST', body: input })
}

export function login(input: { email: string; password: string }) {
  return apiRequest<AuthTokenResponse>('/auth/login', { method: 'POST', body: input })
}

export function me() {
  return apiRequest<UserMe>('/auth/me', { auth: true })
}
