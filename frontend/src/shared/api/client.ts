import { API_V1 } from '../config/env'
import { ApiError } from './ApiError'
import type { ApiErrorBody } from './types'
import { clearSession, getAccessToken } from '../auth/session'

export interface RequestOptions {
  method?: string
  body?: unknown
  auth?: boolean
  headers?: Record<string, string>
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, headers = {}, signal } = options
  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  if (auth) {
    const token = getAccessToken()
    if (token) reqHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API_V1}${path}`, {
    method,
    headers: reqHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (res.status === 204) {
    return undefined as T
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    // Clears storage and notifies AuthContext so RequireAuth redirects to login
    if (auth && (res.status === 401 || isAccessDisabled(data))) {
      clearSession()
    }
    const bodyErr = data as ApiErrorBody | null
    if (bodyErr?.error?.code) {
      throw ApiError.fromBody(res.status, bodyErr)
    }
    throw new ApiError('INTERNAL_ERROR', 'Error de red o servidor.', res.status)
  }

  return data as T
}

function isAccessDisabled(data: unknown): boolean {
  const body = data as ApiErrorBody | null
  return body?.error?.code === 'ACCESS_DISABLED'
}
