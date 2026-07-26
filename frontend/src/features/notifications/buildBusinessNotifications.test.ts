import { describe, expect, it } from 'vitest'
import { buildBusinessNotifications } from './buildBusinessNotifications'
import type { Appointment, Professional } from '../../shared/api/types'

const pro: Professional = { id: 'p1', name: 'Ana', status: 'active' }

function appt(partial: Partial<Appointment> & Pick<Appointment, 'id' | 'starts_at' | 'status'>): Appointment {
  return {
    ends_at: partial.starts_at,
    professional_id: 'p1',
    service_id: 's1',
    client_id: 'c1',
    client: { id: 'c1', name: 'Luis', phone: '300' },
    ...partial,
  }
}

describe('buildBusinessNotifications', () => {
  it('flags confirmed appointments in the past as expired', () => {
    const now = new Date('2026-07-22T15:00:00.000Z')
    const notes = buildBusinessNotifications({
      now,
      appointments: [
        appt({
          id: 'a1',
          status: 'confirmed',
          starts_at: '2026-07-22T12:00:00.000Z',
        }),
      ],
      professionals: [pro],
      schedulesByProfessionalId: {},
    })
    expect(notes.some((n) => n.title === 'Reservación vencida')).toBe(true)
  })

  it('flags nearly full agenda when ratio is high', () => {
    const now = new Date('2026-07-22T15:00:00.000Z')
    // Wed 2026-07-22 → day_of_week 3; 09:00-12:00 = 180 min → 6 slots
    const appointments = Array.from({ length: 5 }, (_, i) =>
      appt({
        id: `a${i}`,
        status: 'confirmed',
        starts_at: `2026-07-22T1${i}:00:00.000Z`,
        professional_id: 'p1',
      }),
    )
    const notes = buildBusinessNotifications({
      now,
      appointments,
      professionals: [pro],
      schedulesByProfessionalId: {
        p1: [{ day_of_week: 3, start_time: '09:00', end_time: '12:00' }],
      },
    })
    expect(notes.some((n) => n.title === 'Agenda casi llena')).toBe(true)
  })

  it('includes public reschedule requests', () => {
    const notes = buildBusinessNotifications({
      now: new Date('2026-07-22T15:00:00.000Z'),
      appointments: [],
      professionals: [pro],
      schedulesByProfessionalId: {},
      rescheduleRequests: [
        {
          id: 'r1',
          slug: 'demo',
          appointmentId: 'a1',
          phone: '300',
          clientName: 'Paula',
          message: '¿Pueden moverme al viernes?',
          createdAt: '2026-07-22T14:00:00.000Z',
        },
      ],
    })
    expect(notes[0]?.title).toBe('Solicitud de reprogramación')
    expect(notes[0]?.body).toContain('Paula')
    expect(notes[0]?.href).toBe('/app/appointments?reschedule=a1')
  })

  it('flags cancelled public appointments', () => {
    const now = new Date('2026-07-22T15:00:00.000Z')
    const notes = buildBusinessNotifications({
      now,
      appointments: [
        appt({
          id: 'c1',
          status: 'cancelled',
          starts_at: '2026-07-25T14:00:00.000Z',
          channel: 'self_service',
        }),
        appt({
          id: 'c2',
          status: 'cancelled',
          starts_at: '2026-07-25T16:00:00.000Z',
          channel: 'staff',
        }),
      ],
      professionals: [pro],
      schedulesByProfessionalId: {},
    })
    expect(notes.some((n) => n.id === 'cancelled:c1')).toBe(true)
    expect(notes.some((n) => n.id === 'cancelled:c2')).toBe(false)
    expect(notes.find((n) => n.id === 'cancelled:c1')?.href).toBe(
      '/app/appointments?focus=c1',
    )
  })
})
