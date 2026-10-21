import { ThreadAttentionKind } from '@codegen/schema'
import { afterAll, describe, expect, it } from 'vitest'

import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import { BOTTOM_PIN_VIEWS, type BottomPinViewName, getBottomPinView } from '.'

const seen = new Set<BottomPinViewName>()
const pin = (kind: ThreadAttentionKind | null, view: TaskDetailViewName) => {
  const result = getBottomPinView({
    attention: kind ? { kind } : null,
    view,
  })
  if (result) seen.add(result)
  return result
}

describe('getBottomPinView', () => {
  it('asks you to answer their reschedule request', () => {
    expect(
      pin(
        ThreadAttentionKind.AnswerReschedule,
        'owner.booked.rescheduleByThem',
      ),
    ).toBe('bottomPin.reschedule')
  })

  it('asks you to answer their cancellation request', () => {
    expect(
      pin(ThreadAttentionKind.AnswerCancel, 'worker.booked.cancelByThem'),
    ).toBe('bottomPin.cancel')
  })

  it('asks you to mark it Done once the booked start has passed', () => {
    expect(pin(ThreadAttentionKind.MarkDone, 'worker.booked.ready')).toBe(
      'bottomPin.markDone',
    )
  })

  it('asks you to confirm when they marked it Done', () => {
    expect(
      pin(ThreadAttentionKind.ConfirmDone, 'owner.booked.theyMarkedDone'),
    ).toBe('bottomPin.confirmDone')
  })

  it('asks you to answer when they marked it Failed', () => {
    expect(
      pin(ThreadAttentionKind.AnswerFailed, 'worker.booked.theyMarkedFailed'),
    ).toBe('bottomPin.answerFailed')
  })

  it('sends a conflict to the task', () => {
    expect(
      pin(ThreadAttentionKind.Conflict, 'owner.conflict.iMarkedDone'),
    ).toBe('bottomPin.conflict')
  })

  it('leaves comparing quotes to the quote cards', () => {
    expect(
      pin(ThreadAttentionKind.CompareQuotes, 'owner.open.quotes'),
    ).toBeNull()
  })

  it('stays hidden when nothing needs you', () => {
    expect(pin(null, 'owner.booked.rescheduleByThem')).toBeNull()
  })

  it('hides once task detail shows you answered', () => {
    expect(
      pin(ThreadAttentionKind.MarkDone, 'owner.booked.iMarkedDone'),
    ).toBeNull()
    expect(pin(ThreadAttentionKind.AnswerCancel, 'loading')).toBeNull()
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(BOTTOM_PIN_VIEWS).sort())
  })
})
