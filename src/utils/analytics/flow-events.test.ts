import { beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()
const captureApiError = vi.fn()

vi.mock('./capture', () => ({
  capture: (...args: unknown[]) => capture(...args),
  getCurrentRoute: () => '/tasks/abc/quote',
}))

vi.mock('./capture-api-error', () => ({
  captureApiError: (...args: unknown[]) => captureApiError(...args),
}))

vi.mock('@/utils/graphqlErrors', () => ({
  getGraphQLErrorCode: () => 'QUOTE_LIMIT',
}))

import { EVENTS } from './events'
import { trackFlowFailed, trackFlowSucceeded } from './flow-events'

describe('trackFlowSucceeded', () => {
  beforeEach(() => {
    capture.mockReset()
  })

  it('flushes marketplace success events immediately', () => {
    trackFlowSucceeded(EVENTS.quote_send_success, {
      task_id: 't1',
      quote_id: 'q1',
    })
    expect(capture).toHaveBeenCalledWith(
      'quote_send_success',
      { task_id: 't1', quote_id: 'q1' },
      { sendInstantly: true },
    )
  })
})

describe('trackFlowFailed', () => {
  beforeEach(() => {
    capture.mockReset()
    captureApiError.mockReset()
  })

  it('flushes fail events immediately with error_code', () => {
    const err = new Error('nope')
    trackFlowFailed(EVENTS.quote_send_fail, err, {
      flow: 'quote_send',
      action: 'onSubmitQuote',
      operation: 'AddQuote',
      extra: { task_id: 't1' },
    })
    expect(capture).toHaveBeenCalledWith(
      'quote_send_fail',
      { error_code: 'QUOTE_LIMIT', task_id: 't1' },
      { sendInstantly: true },
    )
    expect(captureApiError).toHaveBeenCalled()
  })
})
