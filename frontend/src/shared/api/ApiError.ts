import { messageForErrorCode } from './errorMessages'
import type { ApiErrorBody } from './types'

export class ApiError extends Error {
  readonly code: string
  readonly status: number
  readonly details?: Record<string, unknown>
  /** Original API `error.message` (usually English) before UI mapping. */
  readonly rawMessage?: string

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>,
    rawMessage?: string,
  ) {
    super(message)
    this.name = 'ApiError'
    this.code = code
    this.status = status
    this.details = details
    this.rawMessage = rawMessage
  }

  static fromBody(status: number, body: ApiErrorBody): ApiError {
    const code = body.error?.code ?? 'INTERNAL_ERROR'
    const raw = body.error?.message
    return new ApiError(
      code,
      messageForErrorCode(code, raw),
      status,
      body.error?.details,
      raw,
    )
  }
}
