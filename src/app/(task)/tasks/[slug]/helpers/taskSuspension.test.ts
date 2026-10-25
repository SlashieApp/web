import { describe, expect, it } from 'vitest'

import type { TaskDetailPrimaryAction } from '../views/types'
import { availablePrimaryAction, taskReopenFrom } from './taskSuspension'

describe('availablePrimaryAction', () => {
  const free = {
    isSuspended: false,
    isFrozen: false,
    canReopen: false,
    viewerHasSubmittedReview: false,
  }
  const frozenBooking = { ...free, isFrozen: true }
  const suspended = { ...free, isSuspended: true, isFrozen: true }
  const reopenable = { ...free, canReopen: true }
  const all: TaskDetailPrimaryAction[] = [
    'preview',
    'sendQuote',
    'editQuote',
    'becomeWorker',
    'signInToQuote',
    'message',
    'markDone',
    'review',
    'repost',
    'reopen',
    'browseTasks',
  ]

  it('keeps every action when nothing is suspended, but Reopen waits for the API', () => {
    for (const action of all.filter((a) => a !== 'reopen')) {
      expect(availablePrimaryAction(action, free)).toBe(action)
    }
    expect(availablePrimaryAction('reopen', free)).toBeNull()
    expect(availablePrimaryAction(null, free)).toBeNull()
  })

  it('drops what a frozen booking refuses: Mark Done and an unsent review', () => {
    expect(availablePrimaryAction('markDone', frozenBooking)).toBeNull()
    expect(availablePrimaryAction('review', frozenBooking)).toBeNull()
    // Once reviewed it is Get receipt, which still works.
    expect(
      availablePrimaryAction('review', {
        ...frozenBooking,
        viewerHasSubmittedReview: true,
      }),
    ).toBe('review')
    expect(availablePrimaryAction('message', frozenBooking)).toBe('message')
    expect(availablePrimaryAction('editQuote', frozenBooking)).toBe('editQuote')
  })

  it('drops quoting on a suspended task, and keeps Repost', () => {
    for (const action of [
      'sendQuote',
      'editQuote',
      'markDone',
      'review',
    ] as const) {
      expect(availablePrimaryAction(action, suspended)).toBeNull()
    }
    for (const action of [
      'preview',
      'message',
      'repost',
      'browseTasks',
    ] as const) {
      expect(availablePrimaryAction(action, suspended)).toBe(action)
    }
  })

  it('offers Reopen only when the API says the owner can', () => {
    expect(availablePrimaryAction('reopen', reopenable)).toBe('reopen')
    expect(availablePrimaryAction('reopen', free)).toBeNull()
    // A suspended task isn't reopenable: the API says so, not this function.
    expect(availablePrimaryAction('reopen', suspended)).toBeNull()
  })

  it('offers Reopen in place of Repost once a booking ended early and can be reopened', () => {
    expect(availablePrimaryAction('repost', reopenable)).toBe('reopen')
    expect(availablePrimaryAction('repost', free)).toBe('repost')
    expect(availablePrimaryAction('repost', suspended)).toBe('repost')
  })

  it('leaves every other action alone when the owner can reopen', () => {
    for (const action of all.filter((a) => a !== 'reopen' && a !== 'repost')) {
      expect(availablePrimaryAction(action, reopenable)).toBe(action)
    }
  })
})

// The `from` on the task_reopened and task_reopen_fail events.
describe('taskReopenFrom', () => {
  const suspendedWorker = { canReopen: true }

  it('is booking when the worker on a live booking is suspended', () => {
    expect(
      taskReopenFrom({
        taskStatus: 'AWARDED',
        order: { status: 'ACTIVE', counterpartySuspension: suspendedWorker },
      }),
    ).toBe('booking')
  })

  it('is bookingEnded once the booking was cancelled, or both marked it Failed', () => {
    // A failed booking is a CANCELLED order too (there is no FAILED status).
    expect(
      taskReopenFrom({
        taskStatus: 'AWARDED',
        order: { status: 'CANCELLED' },
      }),
    ).toBe('bookingEnded')
    expect(
      taskReopenFrom({
        taskStatus: 'AWARDED',
        order: { status: 'CANCELLED', counterpartySuspension: null },
      }),
    ).toBe('bookingEnded')
  })

  it('is booking, not bookingEnded, when a suspended worker is why it is reopened', () => {
    expect(
      taskReopenFrom({
        taskStatus: 'AWARDED',
        order: {
          status: 'CANCELLED',
          counterpartySuspension: suspendedWorker,
        },
      }),
    ).toBe('booking')
  })

  it('is cancelled for a cancelled task, whatever an earlier booking did', () => {
    expect(taskReopenFrom({ taskStatus: 'CANCELLED', order: null })).toBe(
      'cancelled',
    )
    expect(
      taskReopenFrom({
        taskStatus: 'cancelled',
        order: { status: 'CANCELLED' },
      }),
    ).toBe('cancelled')
  })

  it('is cancelled when there is no booking behind it, or a suspension that cannot reopen', () => {
    expect(taskReopenFrom({ taskStatus: 'AWARDED', order: null })).toBe(
      'cancelled',
    )
    expect(
      taskReopenFrom({
        taskStatus: 'AWARDED',
        order: {
          status: 'ACTIVE',
          counterpartySuspension: { canReopen: false },
        },
      }),
    ).toBe('cancelled')
  })
})
