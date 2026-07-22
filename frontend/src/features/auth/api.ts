import { apiRequest } from '../../shared/api/client'
import type { AuthTokenResponse, UserMe } from '../../shared/api/types'

export function register(input: {
  email: string
  password: string
  document: string
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

export function forgotPassword(input: { email: string }) {
  return apiRequest<{ ok: boolean; reset_token?: string }>('/auth/forgot-password', {
    method: 'POST',
    body: input,
  })
}

export function resetPassword(input: { token: string; password: string }) {
  return apiRequest<{ ok: boolean }>('/auth/reset-password', {
    method: 'POST',
    body: input,
  })
}

export function changePassword(input: { current_password: string; new_password: string }) {
  return apiRequest<{ ok: boolean }>('/auth/change-password', {
    method: 'POST',
    auth: true,
    body: input,
  })
}
