import { describe, expect, it } from 'vitest'

import { formatQuoteDurationLabel } from './taskDetailUtils'

const copy = {
  durationEst: '{duration} est.',
  durationMinutes: '{count} min',
  durationHour: '{count} hr',
  durationHours: '{count} hrs',
}

describe('formatQuoteDurationLabel', () => {
  it('formats minutes under an hour', () => {
    expect(formatQuoteDurationLabel(45, copy)).toBe('45 min est.')
  })

  it('formats a single hour', () => {
    expect(formatQuoteDurationLabel(60, copy)).toBe('1 hr est.')
  })

  it('formats hours from minutes', () => {
    expect(formatQuoteDurationLabel(150, copy)).toBe('2.5 hrs est.')
  })

  it('keeps a human-readable duration string', () => {
    expect(formatQuoteDurationLabel('2–3 hrs', copy)).toBe('2–3 hrs est.')
  })

  it('returns null for empty values', () => {
    expect(formatQuoteDurationLabel(null, copy)).toBeNull()
    expect(formatQuoteDurationLabel(0, copy)).toBeNull()
    expect(formatQuoteDurationLabel('', copy)).toBeNull()
  })
})
