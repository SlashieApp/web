import { TaskStatus } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { TaskDetailPrimaryAction } from '../views/types'
import { availablePrimaryAction, taskReopenKind } from './taskSuspension'

const BY_SLASHIE = { bySlashie: true, posterSuspended: false }
const WITH_POSTER = { bySlashie: false, posterSuspended: true }

function booking(canReopen: boolean) {
  return { counterpartySuspension: { canReopen } }
}

describe('taskReopenKind', () => {
  const reopen = (input: Partial<Parameters<typeof taskReopenKind>[0]>) =>
    taskReopenKind({
      isOwner: true,
      taskStatus: TaskStatus.Awarded,
      suspension: null,
      order: null,
      ...input,
    })

  it('reopens a booking whose worker is suspended, when the API says it can', () => {
    expect(reopen({ order: booking(true) })).toBe('booking')
    expect(reopen({ order: booking(false) })).toBeNull()
    expect(reopen({ order: { counterpartySuspension: null } })).toBeNull()
  })

  it('reopens a cancelled task', () => {
    expect(reopen({ taskStatus: TaskStatus.Cancelled })).toBe('cancelled')
    expect(reopen({ taskStatus: TaskStatus.Open })).toBeNull()
    expect(reopen({ taskStatus: TaskStatus.Awarded })).toBeNull()
  })

  it('reopens nothing on a suspended task, or for anyone but the owner', () => {
    expect(
      reopen({ taskStatus: TaskStatus.Cancelled, suspension: BY_SLASHIE }),
    ).toBeNull()
    expect(reopen({ order: booking(true), suspension: WITH_POSTER })).toBeNull()
    expect(
      reopen({ isOwner: false, taskStatus: TaskStatus.Cancelled }),
    ).toBeNull()
  })
})

describe('availablePrimaryAction', () => {
  const free = {
    isSuspended: false,
    isFrozen: false,
    viewerHasSubmittedReview: false,
  }
  const frozenBooking = { ...free, isFrozen: true }
  const suspended = { ...free, isSuspended: true, isFrozen: true }
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

  it('keeps every action when nothing is suspended', () => {
    for (const action of all) {
      expect(availablePrimaryAction(action, free)).toBe(action)
    }
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

  it('drops quoting and reopening on a suspended task, and keeps Repost', () => {
    for (const action of [
      'sendQuote',
      'editQuote',
      'reopen',
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
})
