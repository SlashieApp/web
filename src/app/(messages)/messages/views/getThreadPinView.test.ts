import { afterAll, describe, expect, it } from 'vitest'

import { TASK_DETAIL_VIEWS } from '@/app/(task)/tasks/[slug]/views'
import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'
import { ASK_BY_VIEW } from '@/app/(task)/tasks/helpers/myTasksHub'

import { PIN_VIEWS, type ThreadPinViewName, getThreadPinView } from '.'

const seen = new Set<ThreadPinViewName>()
const pin = (view: TaskDetailViewName) => {
  const result = getThreadPinView(view)
  if (result) seen.add(result)
  return result
}

describe('getThreadPinView', () => {
  it('asks the owner to compare the quotes waiting on their task', () => {
    expect(pin('owner.open.quotes')).toBe('pin.quotes')
  })

  it("shows an owner's open task without quotes as a plain status", () => {
    expect(pin('owner.open.noQuotes')).toBe('pin.status')
  })

  it('lets a worker edit their pending quote', () => {
    expect(pin('worker.open.quoted')).toBe('pin.quoting')
  })

  it('offers Send quote again after a declined quote', () => {
    expect(pin('worker.open.declined')).toBe('pin.requote')
    expect(pin('worker.open.notQuoted')).toBe('pin.requote')
  })

  it("shows a booked job's time and agreed price", () => {
    expect(pin('owner.booked.beforeStart')).toBe('pin.booked')
  })

  it('says who you are waiting on after your own request', () => {
    expect(pin('worker.booked.rescheduleByMe')).toBe('pin.waiting')
  })

  it('puts the answer buttons in front of you when they ask to move or cancel', () => {
    expect(pin('owner.booked.rescheduleByThem')).toBe('pin.answer')
    expect(pin('worker.booked.cancelByThem')).toBe('pin.answer')
  })

  it('asks you to mark it Done once the job time has started', () => {
    expect(pin('worker.booked.ready')).toBe('pin.close')
  })

  it('asks you to mark it Done too when they marked it Done or Failed', () => {
    expect(pin('owner.booked.theyMarkedDone')).toBe('pin.confirm')
    expect(pin('worker.booked.theyMarkedFailed')).toBe('pin.confirm')
  })

  it('sends a conflict to the task', () => {
    expect(pin('owner.conflict.iMarkedDone')).toBe('pin.conflict')
  })

  it('offers a review once the job is complete', () => {
    expect(pin('worker.completed')).toBe('pin.done')
  })

  it('shows a worker who was not selected a Not selected pill', () => {
    expect(pin('worker.notSelected')).toBe('pin.notSelected')
  })

  it('shows a cancelled booking as a closed status', () => {
    expect(pin('owner.bookingCancelled')).toBe('pin.closed')
  })

  it('shows no status while the task loads', () => {
    expect(pin('loading')).toBeNull()
  })

  it('needs you exactly when My tasks lists the job under Needs you', () => {
    for (const name of Object.keys(TASK_DETAIL_VIEWS) as TaskDetailViewName[]) {
      const view = getThreadPinView(name)
      const asks = view ? PIN_VIEWS[view].ask : false
      expect(asks, name).toBe(ASK_BY_VIEW[name] != null)
    }
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PIN_VIEWS).sort())
  })
})
