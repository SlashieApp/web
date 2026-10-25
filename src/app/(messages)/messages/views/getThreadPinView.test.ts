import { afterAll, describe, expect, it } from 'vitest'

import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import { PIN_VIEWS, type ThreadPinViewName, getThreadPinView } from '.'

const seen = new Set<ThreadPinViewName>()
const pin = (view: TaskDetailViewName) => {
  const result = getThreadPinView(view)
  if (result) seen.add(result)
  return result
}

describe('getThreadPinView', () => {
  it('lists the live quotes for the poster before anyone is booked', () => {
    expect(pin('owner.open.quotes')).toBe('pin.quotes')
  })

  it("shows a poster's open task without live quotes as a plain status", () => {
    expect(pin('owner.open.noQuotes')).toBe('pin.status')
  })

  it('shows a worker their own quote and where it stands', () => {
    expect(pin('worker.open.quoted')).toBe('pin.myQuote')
  })

  it('shows a worker without a live quote the task status', () => {
    expect(pin('worker.open.notQuoted')).toBe('pin.status')
    expect(pin('worker.open.closed')).toBe('pin.status')
  })

  it('shows the booking to both sides once a quote is accepted', () => {
    expect(pin('owner.booked.beforeStart')).toBe('pin.booking')
    expect(pin('worker.booked.rescheduleByThem')).toBe('pin.booking')
    expect(pin('owner.booked.ready')).toBe('pin.booking')
    expect(pin('worker.conflict.iMarkedFailed')).toBe('pin.booking')
  })

  it('shows the final status once the job or task is closed', () => {
    expect(pin('worker.completed')).toBe('pin.closed')
    expect(pin('owner.bookingCancelled')).toBe('pin.closed')
    expect(pin('owner.cancelled')).toBe('pin.closed')
  })

  // BE-113: the worker's quote stays pending, so the pin carries the status
  // ("Booked by someone else", "Task completed") rather than the quote.
  it("shows a worker whose quote lost to someone else's booking the task's status, not their quote", () => {
    expect(pin('worker.bookedByOther')).toBe('pin.closed')
    expect(pin('worker.completedByOther')).toBe('pin.closed')
    expect(pin('visitor.awarded')).toBe('pin.closed')
    expect(pin('visitor.completed')).toBe('pin.closed')
  })

  it('shows no pin while the task loads', () => {
    expect(pin('loading')).toBeNull()
  })

  afterAll(() => {
    expect([...seen].sort()).toEqual(Object.keys(PIN_VIEWS).sort())
  })
})
