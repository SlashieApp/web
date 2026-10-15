import { describe, expect, it } from 'vitest'

import type { OrderItem } from '@/utils/orderHelpers'

import bag from '../i11n.json'
import type { TaskDetailPrimaryAction } from '../views'
import { buildTaskDetailMainCta } from './taskDetailMainCtaModel'
import type { TaskDetailRecord } from './taskDetailUtils'

const worker = {
  id: 'q1',
  status: 'ACCEPTED',
  worker: {
    id: 'worker-user',
    profile: { name: 'Jordan', contactNumber: '07700 900999' },
    worker: { id: 'worker-profile' },
  },
} as TaskDetailRecord['quotes'][number]

const task = {
  id: 'task-1',
  quotes: [worker],
  budget: { type: 'FIXED', paymentMethod: 'CASH', amount: 85, currency: 'GBP' },
  poster: {
    profile: { name: 'Ava', contactNumber: '07700 900123' },
    email: 'ava@example.com',
  },
} as unknown as TaskDetailRecord

const order = {
  id: 'order-1',
  quoteId: 'q1',
  agreedPrice: { amount: 85, currency: 'GBP' },
  bookedStart: '2026-10-18T09:00:00',
} as OrderItem

function cta(
  action: TaskDetailPrimaryAction | null,
  over: Partial<Parameters<typeof buildTaskDetailMainCta>[0]> = {},
) {
  return buildTaskDetailMainCta({
    action,
    task,
    order: null,
    myQuote: null,
    isOwner: false,
    viewerHasSubmittedReview: false,
    messageHref: '/messages',
    copy: bag.en,
    ...over,
  })
}

describe('buildTaskDetailMainCta', () => {
  it('owner of an open task gets a Preview button', () => {
    expect(cta('preview', { isOwner: true })).toMatchObject({
      presentation: 'button',
      buttonLabel: 'Preview',
      href: '/tasks/task-1/preview',
    })
  })

  it('worker who can quote sees the budget beside Send quote', () => {
    expect(cta('sendQuote')).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Send quote',
      href: '/tasks/task-1/quote',
      content: { eyebrow: 'Budget', value: '£85' },
    })
  })

  it('signed-in customer is sent to worker setup with the earn line', () => {
    expect(cta('becomeWorker')).toMatchObject({
      buttonLabel: 'Become a worker',
      href: '/worker/setup?next=%2Ftasks%2Ftask-1',
      content: { eyebrow: 'You can earn' },
    })
    expect(
      cta('becomeWorker', { task: { ...task, budget: null } })?.content
        ?.eyebrow,
    ).toBe('Budget')
  })

  it('guest is sent to sign in, then back to the quote form', () => {
    expect(cta('signInToQuote')).toMatchObject({
      presentation: 'button',
      buttonLabel: 'Sign in to quote',
      href: `/login?next=${encodeURIComponent('/tasks/task-1/quote')}`,
    })
  })

  it('worker with a pending quote sees their price beside Edit quote', () => {
    expect(
      cta('editQuote', {
        myQuote: {
          price: { amount: 70, currency: 'GBP' },
        } as TaskDetailRecord['quotes'][number],
      }),
    ).toMatchObject({
      buttonLabel: 'Edit quote',
      href: '/tasks/task-1/quote',
      content: { eyebrow: 'Quote sent', meta: 'Your asking price' },
    })
  })

  it("booked worker sees the customer's contact details; Message opens the thread (FE-271)", () => {
    expect(
      cta('message', { order, messageHref: '/messages/thread-1' }),
    ).toMatchObject({
      buttonLabel: 'Message',
      href: '/messages/thread-1',
      content: {
        eyebrow: 'Your customer',
        value: 'Ava',
        meta: '07700 900123 · ava@example.com',
      },
    })
  })

  it("owner sees the booked worker's phone", () => {
    expect(cta('message', { order, isOwner: true })).toMatchObject({
      content: {
        eyebrow: 'Your worker',
        value: 'Jordan',
        meta: '07700 900999',
      },
    })
  })

  it('once the job time starts, the main control is slide to mark Done', () => {
    expect(cta('markDone', { order })).toMatchObject({
      presentation: 'close',
      buttonLabel: 'Slide to mark Done',
      content: { eyebrow: 'Job time has started' },
    })
  })

  it('completed party reviews first, then gets the receipt without waiting', () => {
    expect(cta('review', { order, isOwner: true })).toMatchObject({
      buttonLabel: 'Review',
      href: '/tasks/task-1/review?orderId=order-1',
      content: { eyebrow: 'Completed', value: 'Jordan' },
    })
    expect(
      cta('review', { order, viewerHasSubmittedReview: true }),
    ).toMatchObject({
      buttonLabel: 'Get receipt',
      receipt: true,
      href: undefined,
      content: { value: '£85' },
    })
  })

  it('owner of a cancelled task or booking can post it again', () => {
    expect(cta('repost', { isOwner: true })).toMatchObject({
      presentation: 'button',
      buttonLabel: 'Repost this task',
      href: '/tasks/create?repost=task-1',
    })
  })

  it('worker who missed out is pointed to other tasks', () => {
    expect(cta('browseTasks')).toMatchObject({
      presentation: 'button',
      buttonLabel: 'Browse other tasks',
      href: '/search',
    })
  })

  it('has no button when the view has no primary action', () => {
    expect(cta(null)).toBeNull()
  })
})
