import { describe, expect, it } from 'vitest'
import {
  looksLikeInfrastructureMessage,
  messageForErrorCode,
} from './errorMessages'
import { getErrorMessage } from './getErrorMessage'
import { ApiError } from './ApiError'
import { toDateInputValue } from '../datetime'

describe('errorMessages', () => {
  it('maps known codes to Spanish', () => {
    expect(messageForErrorCode('SLOT_OCCUPIED')).toMatch(/horario/i)
  })

  it('falls back for unknown codes', () => {
    expect(messageForErrorCode('UNKNOWN_X', 'fallback')).toBe('fallback')
  })

  it('never surfaces proxy host URLs', () => {
    expect(
      messageForErrorCode(
        'PROXY_ERROR',
        'Cannot reach backend at http://host.docker.internal:3000',
      ),
    ).not.toMatch(/docker|http|3000/i)
    expect(
      messageForErrorCode(
        'UNKNOWN',
        'Cannot reach backend at http://host.docker.internal:3000',
      ),
    ).not.toMatch(/docker|http|3000/i)
  })

  it('detects infrastructure messages', () => {
    expect(
      looksLikeInfrastructureMessage('Cannot reach backend at http://localhost:3000'),
    ).toBe(true)
  })
})

describe('getErrorMessage', () => {
  it('maps ApiError codes to Spanish without leaking fallback URLs', () => {
    const err = new ApiError(
      'PROXY_ERROR',
      'Cannot reach backend at http://host.docker.internal:3000',
      502,
    )
    expect(getErrorMessage(err)).toMatch(/conectar|servicio/i)
    expect(getErrorMessage(err)).not.toMatch(/docker|http/i)
  })

  it('maps Failed to fetch to network copy', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toMatch(/conexión|red|servicio/i)
  })
})

describe('datetime', () => {
  it('builds date input value as YYYY-MM-DD', () => {
    expect(toDateInputValue(new Date('2026-07-21T12:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
