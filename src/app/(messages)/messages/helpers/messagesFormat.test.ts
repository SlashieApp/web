import { FlashKind, QuoteStatus, ThreadItemType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  flashAction,
  flashSlot,
  formatMessageTime,
  quoteFlashStatus,
  threadMenuActions,
  threadPreviewText,
  wasNotSelected,
} from './messagesFormat'

const copy = { yesterday: 'Yesterday' }
const now = new Date(2026, 9, 12, 15, 0)

describe('formatMessageTime', () => {
  it('shows the clock today, then Yesterday, weekday, date', () => {
    expect(
      formatMessageTime(
        new Date(2026, 9, 12, 9, 5).toISOString(),
        'en-GB',
        copy,
        now,
      ),
    ).toBe('09:05')
    expect(
      formatMessageTime(
        new Date(2026, 9, 11, 22).toISOString(),
        'en-GB',
        copy,
        now,
      ),
    ).toBe('Yesterday')
    expect(
      formatMessageTime(
        new Date(2026, 9, 8, 12).toISOString(),
        'en-GB',
        copy,
        now,
      ),
    ).toBe('Thu')
    expect(
      formatMessageTime(
        new Date(2026, 8, 30, 12).toISOString(),
        'en-GB',
        copy,
        now,
      ),
    ).toBe('30 Sept')
    expect(formatMessageTime(null, 'en-GB', copy, now)).toBe('')
  })
})

describe('threadPreviewText', () => {
  it('uses the flash title, or the message text on one line', () => {
    expect(
      threadPreviewText({
        type: ThreadItemType.Flash,
        title: 'New quote',
        body: '£80 from Sam',
      }),
    ).toBe('New quote')
    expect(
      threadPreviewText({
        type: ThreadItemType.Message,
        body: 'See you\n at 9',
      }),
    ).toBe('See you at 9')
  })
})

describe('flashAction', () => {
  it('links review prompts to the review page and other flashes to the task', () => {
    expect(
      flashAction({
        type: ThreadItemType.Flash,
        flashKind: FlashKind.ReviewPrompt,
        taskId: 't1',
        orderId: 'o1',
        body: '',
      }),
    ).toEqual({ kind: 'review', href: '/tasks/t1/review?orderId=o1' })
    expect(
      flashAction({
        type: ThreadItemType.Flash,
        flashKind: FlashKind.QuoteReceived,
        taskId: 't1',
        body: '',
      }),
    ).toEqual({ kind: 'task', href: '/tasks/t1' })
    expect(
      flashAction({ type: ThreadItemType.Message, taskId: 't1', body: 'hi' }),
    ).toBeNull()
  })
})

describe('wasNotSelected', () => {
  it('spots the not-selected flash', () => {
    expect(
      wasNotSelected([
        {
          type: ThreadItemType.Flash,
          flashKind: FlashKind.QuoteNotSelected,
          body: '',
        },
      ]),
    ).toBe(true)
    expect(wasNotSelected([])).toBe(false)
  })
})

describe('quoteFlashStatus (BE-81)', () => {
  it('maps live quote statuses, including the new ones', () => {
    expect(quoteFlashStatus(QuoteStatus.Pending)).toBe('pending')
    expect(quoteFlashStatus(QuoteStatus.Accepted)).toBe('accepted')
    expect(quoteFlashStatus(QuoteStatus.Declined)).toBe('declined')
    expect(quoteFlashStatus(QuoteStatus.NotSelected)).toBe('notSelected')
    expect(quoteFlashStatus(QuoteStatus.Withdrawn)).toBe('withdrawn')
    expect(quoteFlashStatus(QuoteStatus.Expired)).toBe('replaced')
  })
})

describe('threadMenuActions (FE-272)', () => {
  const none = { hasPendingQuote: false, canCancelTask: false, booking: null }

  it('offers withdraw to a worker and cancel task to an owner before booking', () => {
    expect(threadMenuActions({ ...none, hasPendingQuote: true })).toEqual([
      'withdrawQuote',
    ])
    expect(threadMenuActions({ ...none, canCancelTask: true })).toEqual([
      'cancelTask',
    ])
  })

  it('offers reschedule and cancel booking once booked, as task detail allows', () => {
    expect(
      threadMenuActions({
        ...none,
        booking: { canReschedule: true, canCancel: true },
      }),
    ).toEqual(['reschedule', 'cancelBooking'])
    // In CONFLICT only cancelling is possible; a pending request blocks both.
    expect(
      threadMenuActions({
        ...none,
        booking: { canReschedule: false, canCancel: true },
      }),
    ).toEqual(['cancelBooking'])
    expect(
      threadMenuActions({
        ...none,
        booking: { canReschedule: false, canCancel: false },
      }),
    ).toEqual([])
  })
})

describe('flashSlot', () => {
  type Slot = { id: string; start: string; end: string | null }
  const morning: Slot = {
    id: 's1',
    start: '2030-10-22T11:00:00.000Z',
    end: '2030-10-22T12:00:00.000Z',
  }
  const afternoon: Slot = {
    id: 's2',
    start: '2030-10-23T14:00:00.000Z',
    end: null,
  }
  const accepted = (...proposedSlots: Slot[]) => ({
    flashKind: FlashKind.QuoteAccepted,
    quote: { id: 'q1', proposedSlots },
  })
  const booking = (bookedStart: string, quoteId = 'q1') => ({
    quoteId,
    bookedStart,
  })

  it('uses the only proposed slot, with or without a booking', () => {
    expect(flashSlot(accepted(morning), null)).toBe(morning)
    expect(flashSlot(accepted(morning), undefined)).toBe(morning)
    expect(flashSlot(accepted(morning), booking(afternoon.start, 'q2'))).toBe(
      morning,
    )
  })

  it('picks the proposed slot the booking starts at when there are two', () => {
    const item = accepted(morning, afternoon)
    expect(flashSlot(item, booking(afternoon.start))).toBe(afternoon)
    expect(flashSlot(item, booking(morning.start))).toBe(morning)
  })

  it('compares instants, not how the start is written', () => {
    expect(
      flashSlot(
        accepted(morning, afternoon),
        booking('2030-10-23T15:00:00+01:00'),
      ),
    ).toBe(afternoon)
  })

  it('shows no slot when it cannot tell which of two was booked', () => {
    const item = accepted(morning, afternoon)
    expect(flashSlot(item, null)).toBeNull()
    expect(flashSlot(item, undefined)).toBeNull()
    expect(flashSlot(item, booking(afternoon.start, 'q2'))).toBeNull()
    expect(flashSlot(item, booking('2030-10-25T09:00:00.000Z'))).toBeNull()
  })

  it('shows no slot when the quote proposed none', () => {
    expect(flashSlot(accepted(), booking(morning.start))).toBeNull()
  })

  it('is only for the Quote accepted line', () => {
    const received = {
      flashKind: FlashKind.QuoteReceived,
      quote: { id: 'q1', proposedSlots: [morning] },
    }
    expect(flashSlot(received, null)).toBeNull()
    expect(flashSlot({ flashKind: FlashKind.QuoteAccepted }, null)).toBeNull()
    expect(
      flashSlot({ flashKind: FlashKind.QuoteAccepted, quote: null }, null),
    ).toBeNull()
  })
})
