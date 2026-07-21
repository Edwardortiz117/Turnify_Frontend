import { describe, expect, it } from 'vitest'
import { messageForErrorCode } from './errorMessages'
import { toDateInputValue } from '../datetime'

describe('errorMessages', () => {
  it('maps known codes to Spanish', () => {
    expect(messageForErrorCode('SLOT_OCCUPIED')).toMatch(/horario/i)
  })

  it('falls back for unknown codes', () => {
    expect(messageForErrorCode('UNKNOWN_X', 'fallback')).toBe('fallback')
  })
})

describe('datetime', () => {
  it('builds date input value as YYYY-MM-DD', () => {
    expect(toDateInputValue(new Date('2026-07-21T12:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
