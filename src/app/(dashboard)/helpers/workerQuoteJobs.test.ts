import { describe, expect, it } from 'vitest'

import type { TaskItem, TaskQuoteItem } from '@/utils/dashboardHelpers'

import { workerQuoteStage } from './workerQuoteJobs'

const task = (status = 'OPEN', quotes: unknown[] = []) =>
  ({ id: 'task-1', status, quotes }) as unknown as TaskItem

const quote = (status: string) =>
  ({ id: 'quote-1', taskId: 'task-1', status }) as unknown as TaskQuoteItem

describe('workerQuoteStage', () => {
  it('reads a pending quote on an open task as pending, and an accepted one as booked', () => {
    expect(workerQuoteStage(task(), quote('PENDING'), null)).toBe('pending')
    expect(workerQuoteStage(task('AWARDED'), quote('ACCEPTED'), null)).toBe(
      'booked',
    )
  })

  it('reads any quote that is not pending as ended, even one this build does not know', () => {
    // CLOSED is the API's newest status and has no typed value here; the
    // second is one nobody has sent yet.
    for (const status of ['WITHDRAWN', 'CLOSED', 'A_STATUS_FOR_LATER']) {
      expect(workerQuoteStage(task(), quote(status), null)).toBe('ended')
    }
  })
})
