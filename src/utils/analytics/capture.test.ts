import { beforeEach, describe, expect, it, vi } from 'vitest'

const queueCapture = vi.fn()

vi.mock('./posthog-client', () => ({
  queueCapture: (...args: unknown[]) => queueCapture(...args),
}))

import { capture } from './capture'
import { EVENTS } from './events'

describe('capture', () => {
  beforeEach(() => {
    queueCapture.mockReset()
  })

  it('sends canonical marketplace names as-is', () => {
    capture(EVENTS.quote_send_success, { task_id: 't1', quote_id: 'q1' })

    expect(queueCapture).toHaveBeenCalledWith(
      'quote_send_success',
      { task_id: 't1', quote_id: 'q1' },
      undefined,
    )
  })

  it('remaps stale wizard names so they are not the ingested path', () => {
    capture('task_created', { task_id: 't1' })
    capture('quote_submitted', { task_id: 't1' })

    expect(queueCapture).toHaveBeenNthCalledWith(
      1,
      'task_create_success',
      { task_id: 't1' },
      undefined,
    )
    expect(queueCapture).toHaveBeenNthCalledWith(
      2,
      'quote_send_success',
      { task_id: 't1' },
      undefined,
    )
  })

  it('forwards sendInstantly for mutation success/fail', () => {
    capture(
      EVENTS.task_create_success,
      { task_id: 't1' },
      { sendInstantly: true },
    )

    expect(queueCapture).toHaveBeenCalledWith(
      'task_create_success',
      { task_id: 't1' },
      { sendInstantly: true },
    )
  })
})
