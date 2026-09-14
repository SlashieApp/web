import { beforeEach, describe, expect, it, vi } from 'vitest'

const capture = vi.fn()

vi.mock('./capture', () => ({
  capture: (...args: unknown[]) => capture(...args),
  getCurrentRoute: () => '/tasks/create',
}))

vi.mock('./capture-api-error', () => ({
  captureApiError: vi.fn(),
}))

vi.mock('@/utils/graphqlErrors', () => ({
  getGraphQLErrorCode: () => 'TEST_CODE',
}))

import { EVENTS } from './events'
import { trackFlowFailed, trackFlowSucceeded } from './flow-events'

describe('trackFlowSucceeded', () => {
  beforeEach(() => {
    capture.mockReset()
  })

  it('captures canonical success names immediately', () => {
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
  })

  it('captures canonical fail names immediately', () => {
    trackFlowFailed(EVENTS.quote_send_fail, new Error('nope'), {
      flow: 'quote_send',
      action: 'onSubmitQuote',
      operation: 'AddQuote',
      extra: { task_id: 't1' },
    })

    expect(capture).toHaveBeenCalledWith(
      'quote_send_fail',
      { error_code: 'TEST_CODE', task_id: 't1' },
      { sendInstantly: true },
    )
  })
})
