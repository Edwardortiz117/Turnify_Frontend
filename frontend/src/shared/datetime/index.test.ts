import { describe, expect, it } from 'vitest'
import { datetimeLocalToUtcIso, endOfDayIso, startOfDayIso, wallTimeToUtcIso } from './index'

describe('datetime business timezone', () => {
  it('maps Bogotá start of day to 05:00Z', () => {
    expect(startOfDayIso('2026-07-21', 'America/Bogota')).toBe('2026-07-21T05:00:00.000Z')
  })

  it('maps Bogotá end of day to next day 04:59:59.999Z', () => {
    expect(endOfDayIso('2026-07-21', 'America/Bogota')).toBe('2026-07-22T04:59:59.999Z')
  })

  it('converts wall noon Bogotá to 17:00Z', () => {
    expect(wallTimeToUtcIso('2026-07-21', '12:00:00', 'America/Bogota')).toBe(
      '2026-07-21T17:00:00.000Z',
    )
  })

  it('converts datetime-local Bogotá to UTC', () => {
    expect(datetimeLocalToUtcIso('2026-07-21T09:30', 'America/Bogota')).toBe(
      '2026-07-21T14:30:00.000Z',
    )
  })
})
