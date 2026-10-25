import { describe, expect, it } from 'vitest'

import { TASK_DETAIL_VIEWS } from '../views'
import type { TaskDetailViewName } from '../views/types'
import { availableActions } from './taskDetailActions'

const none = { showOrderActions: false, canWithdrawQuote: false }
const booking = { showOrderActions: true, canWithdrawQuote: false }
const withdrawable = { showOrderActions: false, canWithdrawQuote: true }

// BE-116: once someone else is booked, or the booking ended, the worker's
// quote is still pending and can be withdrawn; the owner isn't told.
const NOT_ON_THE_BOOKING: TaskDetailViewName[] = [
  'worker.bookedByOther',
  'worker.completedByOther',
  'worker.otherBookingEnded',
]

describe('availableActions', () => {
  it('offers Withdraw quote on all three views for a worker whose quote is pending', () => {
    for (const view of NOT_ON_THE_BOOKING) {
      expect(availableActions(view, withdrawable), view).toEqual([
        'withdrawQuote',
      ])
    }
  })

  it('offers it only when the API would allow it (a suspended task, or no pending quote, is not)', () => {
    for (const view of NOT_ON_THE_BOOKING) {
      expect(availableActions(view, none), view).toEqual([])
      // Booking actions don't unlock it: there is no booking.
      expect(availableActions(view, booking), view).toEqual([])
    }
  })

  it('offers no Withdraw quote on any other view, whatever the viewer can do', () => {
    for (const view of Object.keys(TASK_DETAIL_VIEWS) as TaskDetailViewName[]) {
      if (NOT_ON_THE_BOOKING.includes(view)) continue
      expect(availableActions(view, withdrawable), view).not.toContain(
        'withdrawQuote',
      )
    }
  })

  it('keeps the booking actions while the booking is live, and only Report once it is frozen', () => {
    expect(availableActions('owner.booked.beforeStart', booking)).toEqual(
      TASK_DETAIL_VIEWS['owner.booked.beforeStart'].actions,
    )
    expect(availableActions('worker.conflict.iMarkedDone', booking)).toContain(
      'reportOtherParty',
    )
    expect(availableActions('worker.conflict.iMarkedDone', none)).toEqual([
      'reportOtherParty',
    ])
    expect(availableActions('owner.booked.beforeStart', none)).toEqual([])
  })

  it('offers nothing on a view with no actions', () => {
    expect(availableActions('visitor.awarded', withdrawable)).toEqual([])
    expect(availableActions('loading', booking)).toEqual([])
  })
})
