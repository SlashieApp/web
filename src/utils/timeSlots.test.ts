import { describe, expect, it } from 'vitest'

import {
  formatTimeSlotLabel,
  isTimeSlotPast,
  timeSlotDraftFromSlot,
  timeSlotInputsFromDrafts,
  validateTimeSlotDrafts,
} from './timeSlots'

const now = new Date('2026-10-12T12:00:00')

describe('validateTimeSlotDrafts', () => {
  it('accepts complete, future, distinct slots', () => {
    expect(
      validateTimeSlotDrafts(
        [
          { date: '2026-10-13', time: '09:00', durationMinutes: 120 },
          { date: '2026-10-14', time: '09:00', durationMinutes: null },
        ],
        now,
      ),
    ).toEqual([null, null])
  })

  it('flags incomplete, past, too-far, duplicate, and bad duration', () => {
    expect(
      validateTimeSlotDrafts(
        [{ date: '', time: '09:00', durationMinutes: null }],
        now,
      ),
    ).toEqual(['incomplete'])
    expect(
      validateTimeSlotDrafts(
        [{ date: '2026-10-12', time: '11:00', durationMinutes: null }],
        now,
      ),
    ).toEqual(['past'])
    expect(
      validateTimeSlotDrafts(
        [{ date: '2027-12-01', time: '09:00', durationMinutes: null }],
        now,
      ),
    ).toEqual(['too_far'])
    expect(
      validateTimeSlotDrafts(
        [
          { date: '2026-10-13', time: '09:00', durationMinutes: null },
          { date: '2026-10-13', time: '09:00', durationMinutes: 60 },
        ],
        now,
      ),
    ).toEqual([null, 'duplicate'])
    expect(
      validateTimeSlotDrafts(
        [{ date: '2026-10-13', time: '09:00', durationMinutes: 10 }],
        now,
      ),
    ).toEqual(['duration'])
  })
})

describe('timeSlotInputsFromDrafts', () => {
  it('sends an ISO start and the duration only when set', () => {
    const [withDuration, without] = timeSlotInputsFromDrafts([
      { date: '2026-10-13', time: '09:00', durationMinutes: 90 },
      { date: '2026-10-14', time: '13:30', durationMinutes: null },
    ])
    expect(withDuration.start).toBe(new Date('2026-10-13T09:00').toISOString())
    expect(withDuration.durationMinutes).toBe(90)
    expect(without).not.toHaveProperty('durationMinutes')
  })
})

describe('slot display', () => {
  it('labels a window and a start-only slot', () => {
    expect(
      formatTimeSlotLabel({
        start: '2026-10-13T09:00:00',
        end: '2026-10-13T11:00:00',
      }),
    ).toBe('Tue 13 Oct, 09:00–11:00')
    expect(formatTimeSlotLabel({ start: '2026-10-13T09:00:00' })).toBe(
      'Tue 13 Oct, 09:00',
    )
  })

  it('treats a passed or missing start as past', () => {
    expect(isTimeSlotPast({ start: '2026-10-12T11:59:00' }, now)).toBe(true)
    expect(isTimeSlotPast({ start: '2026-10-12T12:30:00' }, now)).toBe(false)
    expect(isTimeSlotPast({ start: null }, now)).toBe(true)
  })
})

describe('timeSlotDraftFromSlot', () => {
  it('round-trips a future slot and drops past ones', () => {
    expect(
      timeSlotDraftFromSlot(
        { start: '2026-10-13T09:00:00', end: '2026-10-13T11:00:00' },
        now,
      ),
    ).toEqual({ date: '2026-10-13', time: '09:00', durationMinutes: 120 })
    expect(timeSlotDraftFromSlot({ start: '2026-10-12T09:00:00' }, now)).toBe(
      null,
    )
  })
})
