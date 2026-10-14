import { FlashKind, QuoteStatus, ThreadItemType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import {
  flashAction,
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
