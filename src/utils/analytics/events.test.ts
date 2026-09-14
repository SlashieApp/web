import { describe, expect, it } from 'vitest'

import {
  EVENTS,
  STALE_EVENT_ALIASES,
  toCanonicalAnalyticsEvent,
} from './events'

const MARKETPLACE_EVENTS = [
  'task_create_success',
  'task_create_fail',
  'quote_send_success',
  'quote_send_fail',
  'quote_accept_success',
  'quote_accept_fail',
  'job_verify_success',
  'job_verify_fail',
  'order_confirm_success',
  'order_confirm_fail',
] as const

describe('EVENTS catalogue', () => {
  it('includes canonical marketplace success/fail names', () => {
    for (const name of MARKETPLACE_EVENTS) {
      expect(EVENTS[name]).toBe(name)
    }
  })
})

describe('toCanonicalAnalyticsEvent', () => {
  it('remaps wizard and native dead names onto the catalogue', () => {
    expect(toCanonicalAnalyticsEvent('task_created')).toBe(
      EVENTS.task_create_success,
    )
    expect(toCanonicalAnalyticsEvent('quote_submitted')).toBe(
      EVENTS.quote_send_success,
    )
    expect(toCanonicalAnalyticsEvent('quote_accepted')).toBe(
      EVENTS.quote_accept_success,
    )
    expect(toCanonicalAnalyticsEvent('order_completed')).toBe(
      EVENTS.job_verify_success,
    )
  })

  it('leaves canonical names unchanged', () => {
    expect(toCanonicalAnalyticsEvent(EVENTS.quote_send_success)).toBe(
      EVENTS.quote_send_success,
    )
    expect(toCanonicalAnalyticsEvent(EVENTS.task_create_success)).toBe(
      EVENTS.task_create_success,
    )
  })

  it('only aliases onto allowlisted catalogue names', () => {
    for (const canonical of Object.values(STALE_EVENT_ALIASES)) {
      expect(Object.values(EVENTS)).toContain(canonical)
    }
  })
})
