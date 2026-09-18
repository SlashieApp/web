import { readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  EVENTS,
  STALE_EVENT_ALIASES,
  isCanonicalAnalyticsEvent,
  resolveAnalyticsEvent,
} from './events'

const MARKETPLACE_SUCCESS = [
  'task_create_success',
  'quote_send_success',
  'quote_accept_success',
  'job_verify_success',
  'order_confirm_success',
] as const

const MARKETPLACE_FAIL = [
  'task_create_fail',
  'quote_send_fail',
  'quote_accept_fail',
  'job_verify_fail',
  'order_confirm_fail',
] as const

function readRepo(rel: string): string {
  return readFileSync(path.join(process.cwd(), rel), 'utf8')
}

describe('canonical marketplace event catalogue', () => {
  it('exports the funnel names Ledger already measured in production', () => {
    for (const name of [...MARKETPLACE_SUCCESS, ...MARKETPLACE_FAIL]) {
      expect(EVENTS[name]).toBe(name)
      expect(isCanonicalAnalyticsEvent(name)).toBe(true)
    }
  })

  it('rewrites stale / FE-64 names so they are not the only capture path', () => {
    expect(resolveAnalyticsEvent('task_created')).toBe('task_create_success')
    expect(resolveAnalyticsEvent('quote_submitted')).toBe('quote_send_success')
    expect(resolveAnalyticsEvent('quote_sent')).toBe('quote_send_success')
    expect(resolveAnalyticsEvent('quote_accepted')).toBe('quote_accept_success')
    expect(resolveAnalyticsEvent('order_completed')).toBe('job_verify_success')
    expect(resolveAnalyticsEvent('membership_checkout_started')).toBe(
      'checkout_start',
    )
    expect(resolveAnalyticsEvent('billing_portal_opened')).toBe(
      'billing_portal_open',
    )
    expect(resolveAnalyticsEvent('task_create_succeeded')).toBe(
      'task_create_success',
    )
    expect(resolveAnalyticsEvent('quote_send_succeeded')).toBe(
      'quote_send_success',
    )
    expect(resolveAnalyticsEvent('job_verify_code_succeeded')).toBe(
      'job_verify_success',
    )
    expect(resolveAnalyticsEvent('order_confirm_succeeded')).toBe(
      'order_confirm_success',
    )
    expect(resolveAnalyticsEvent('task_create_success')).toBe(
      'task_create_success',
    )
  })

  it('maps every stale alias onto an allowlisted canonical name', () => {
    for (const [stale, canonical] of Object.entries(STALE_EVENT_ALIASES)) {
      expect(isCanonicalAnalyticsEvent(canonical)).toBe(true)
      expect(stale).not.toBe(canonical)
    }
  })
})

describe('marketplace capture call sites', () => {
  it('create-task wizard emits task_create_success / fail', () => {
    const src = readRepo('src/app/(stepflow)/tasks/create/page.tsx')
    expect(src).toContain('EVENTS.task_create_success')
    expect(src).toContain('EVENTS.task_create_fail')
    expect(src).not.toMatch(/['"]task_created['"]/)
    expect(src).not.toMatch(/['"]task_create_succeeded['"]/)
  })

  it('quote send / accept / verify use canonical success names', () => {
    const src = readRepo(
      'src/app/(task)/tasks/[slug]/context/TaskDetailProvider.tsx',
    )
    expect(src).toContain('EVENTS.quote_send_success')
    expect(src).toContain('EVENTS.quote_send_fail')
    expect(src).toContain('EVENTS.quote_accept_success')
    expect(src).toContain('EVENTS.quote_accept_fail')
    expect(src).toContain('EVENTS.job_verify_success')
    expect(src).toContain('EVENTS.job_verify_fail')
    expect(src).not.toMatch(/['"]quote_submitted['"]/)
    expect(src).not.toMatch(/['"]quote_send_succeeded['"]/)
  })

  it('quote StepFlow submits through the provider (canonical capture path)', () => {
    const src = readRepo(
      'src/app/(stepflow)/tasks/[slug]/quote/components/TaskQuoteScreen.tsx',
    )
    expect(src).toContain('onSubmitQuote')
    expect(src).not.toMatch(/['"]quote_submitted['"]/)
  })

  it('product feedback uses canonical success names', () => {
    const src = readRepo('src/content/feedback/FeedbackProvider.tsx')
    expect(src).toContain('EVENTS.feedback_submit_success')
    expect(src).toContain('EVENTS.feedback_submit_fail')
    expect(EVENTS.feedback_submit_success).toBe('feedback_submit_success')
    expect(EVENTS.feedback_submit_fail).toBe('feedback_submit_fail')
  })
})
