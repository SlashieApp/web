import { beforeEach, describe, expect, it, vi } from 'vitest'

const queueCapture = vi.fn()

vi.mock('./posthog-client', () => ({
  queueCapture: (...args: unknown[]) => queueCapture(...args),
}))

import { capture } from './capture'

describe('capture', () => {
  beforeEach(() => {
    queueCapture.mockReset()
  })

  it('rewrites stale names to canonical before queueing', () => {
    capture('task_created', { task_id: 't1' })
    expect(queueCapture).toHaveBeenCalledWith(
      'task_create_success',
      { task_id: 't1' },
      undefined,
    )

    capture('quote_submitted', { quote_id: 'q1' })
    expect(queueCapture).toHaveBeenCalledWith(
      'quote_send_success',
      { quote_id: 'q1' },
      undefined,
    )
  })

  it('passes through canonical names unchanged', () => {
    capture('quote_accept_success', { task_id: 't1' })
    expect(queueCapture).toHaveBeenCalledWith(
      'quote_accept_success',
      { task_id: 't1' },
      undefined,
    )
  })

  it('forwards sendInstantly for mutation flushes', () => {
    capture('job_verify_success', { order_id: 'o1' }, { sendInstantly: true })
    expect(queueCapture).toHaveBeenCalledWith(
      'job_verify_success',
      { order_id: 'o1' },
      { sendInstantly: true },
    )
  })
})
