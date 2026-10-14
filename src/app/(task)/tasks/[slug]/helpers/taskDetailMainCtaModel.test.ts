import { TaskDateTimeType } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import {
  type TaskDetailMainCtaCopy,
  buildTaskDetailMainCta,
} from './taskDetailMainCtaModel'
import type { TaskDetailRecord } from './taskDetailUtils'

const copy: TaskDetailMainCtaCopy = {
  preview: 'Preview',
  sendQuote: 'Send quote',
  becomeWorker: 'Become a worker',
  youCanEarn: 'You can earn',
  editQuote: 'Edit quote',
  quoteSent: 'Quote sent',
  yourQuote: 'Your quote',
  quoteSentValue: 'Sent',
  askingPrice: 'Your asking price',
  awaitingReview: 'Waiting for the owner to review',
  budget: 'Budget',
  customerTitle: 'Job in progress',
  workerTitle: 'You are booked for this job',
  closeEyebrow: 'Job time has started',
  slideDone: 'Slide to mark Done',
  owner: 'Owner',
  message: 'Message',
  yourCustomer: 'Your customer',
  ownerFallback: 'Task owner',
  flexibleWhen: 'Flexible',
  workerEyebrow: 'Your job',
  yourWorker: 'Your worker',
  workerFallback: 'Your worker',
  review: 'Review',
  getReceipt: 'Get receipt',
  completed: 'Completed',
}

function permissions(
  overrides: Partial<TaskDetailPermissions> = {},
): TaskDetailPermissions {
  return {
    isOwner: false,
    taskStatus: 'OPEN',
    isOpen: true,
    isAwarded: false,
    isClosed: false,
    isCancelled: false,
    isJobCompleted: false,
    isOrderWorker: false,
    isOrderActive: false,
    isOrderConflict: false,
    hasWorkerProfile: true,
    atCap: false,
    canSubmitQuote: false,
    hasPendingQuote: false,
    showQuoteForm: false,
    showGuestQuoteCta: false,
    showBecomeWorkerCta: false,
    showQuoteUnavailableNotice: false,
    showOwnerQuoteList: false,
    showAcceptDecline: false,
    showWorkerJobBanner: false,
    showOrderActions: false,
    showFullAddress: false,
    canCancelTask: false,
    canEditTask: false,
    canRepostTask: false,
    ...overrides,
  }
}

function task(overrides: Partial<TaskDetailRecord> = {}): TaskDetailRecord {
  return {
    id: 'task-1',
    quotes: [],
    budget: {
      type: 'FIXED',
      paymentMethod: 'CASH',
      amount: 8500,
      currency: 'GBP',
    },
    poster: {
      profile: { name: 'Ava', contactNumber: '07700 900123' },
      email: 'ava@example.com',
    },
    ...overrides,
  } as TaskDetailRecord
}

describe('buildTaskDetailMainCta', () => {
  it('uses the preview layout for an owner with an open task', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({ isOwner: true }),
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'preview',
      buttonLabel: 'Preview',
      href: '/tasks/task-1/preview',
      hideOverviewCards: [],
    })
    expect(model?.content).toBeUndefined()
  })

  it('uses the quoted layout and hides pricing when the viewer can send a quote', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({ showQuoteForm: true }),
      copy,
    })
    expect(model?.presentation).toBe('quoted')
    expect(model?.buttonLabel).toBe('Send quote')
    expect(model?.content?.eyebrow).toBe('Budget')
    expect(model?.href).toBe('/tasks/task-1/quote')
    expect(model?.hideOverviewCards).toEqual(['pricing'])
  })

  it('offers Become a worker with the earn line to a non-worker', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({
        hasWorkerProfile: false,
        showBecomeWorkerCta: true,
      }),
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Become a worker',
      href: '/worker/setup?next=%2Ftasks%2Ftask-1',
      hideOverviewCards: ['pricing'],
      content: { eyebrow: 'You can earn' },
    })
  })

  it('sends a guest to sign up before setup', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({
        hasWorkerProfile: false,
        showGuestQuoteCta: true,
        showBecomeWorkerCta: true,
      }),
      copy,
    })
    expect(model?.href).toBe(
      `/register?next=${encodeURIComponent('/worker/setup?next=%2Ftasks%2Ftask-1')}`,
    )
  })

  it('keeps the Budget eyebrow when a non-worker task has no budget', () => {
    const model = buildTaskDetailMainCta({
      task: task({ budget: null }),
      myQuote: null,
      permissions: permissions({
        hasWorkerProfile: false,
        showBecomeWorkerCta: true,
      }),
      copy,
    })
    expect(model?.content?.eyebrow).toBe('Budget')
  })

  it('shows the sent quote and leaves the pricing card visible', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: {
        price: { amount: 7000, currency: 'GBP' },
      } as TaskDetailRecord['quotes'][number],
      permissions: permissions({ hasPendingQuote: true }),
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Edit quote',
      href: '/tasks/task-1/quote',
      hideOverviewCards: [],
      content: {
        eyebrow: 'Quote sent',
        meta: 'Your asking price',
      },
    })
  })

  it('shows the customer and their contact details; Message opens the thread (FE-271)', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({
        isOpen: false,
        isOrderWorker: true,
        showOrderActions: true,
      }),
      schedule: {
        type: TaskDateTimeType.Exact,
        date: '2020-01-01',
        time: '09:00',
      },
      now: new Date('2026-01-01T12:00:00'),
      copy,
      messageHref: '/messages/thread-1',
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Message',
      href: '/messages/thread-1',
      hideOverviewCards: ['pricing'],
      content: {
        eyebrow: 'Your customer',
        value: 'Ava',
        meta: '07700 900123 · ava@example.com',
      },
    })
    expect(model?.scrollTo).toBeUndefined()
  })

  it('swaps to the close control once the booked time starts, until the viewer acts', () => {
    const close = {
      canClose: true,
      startsAt: new Date('2026-01-01T09:00:00'),
      mine: null,
      theirs: null,
      autoDoneAt: null,
    }
    const input = {
      task: task(),
      myQuote: null,
      permissions: permissions({
        isOpen: false,
        isOrderWorker: true,
        showOrderActions: true,
      }),
      copy,
    }
    expect(buildTaskDetailMainCta({ ...input, close })).toMatchObject({
      presentation: 'close',
      buttonLabel: 'Slide to mark Done',
      content: { eyebrow: 'Job time has started' },
      hideOverviewCards: ['pricing'],
    })
    expect(
      buildTaskDetailMainCta({ ...input, close: { ...close, mine: 'DONE' } }),
    ).toMatchObject({ presentation: 'quoted', buttonLabel: 'Message' })
    expect(
      buildTaskDetailMainCta({
        ...input,
        close: { ...close, canClose: false },
      }),
    ).toMatchObject({ presentation: 'quoted' })
  })

  it('shows the booked worker and their phone; Message falls back to the inbox', () => {
    const model = buildTaskDetailMainCta({
      task: task({
        quotes: [
          {
            id: 'q1',
            status: 'ACCEPTED',
            worker: {
              id: 'worker-user',
              profile: { name: 'Jordan', contactNumber: '07700 900999' },
              worker: { id: 'worker-profile' },
            },
          } as TaskDetailRecord['quotes'][number],
        ],
      }),
      myQuote: null,
      permissions: permissions({
        isOwner: true,
        isOpen: false,
        isAwarded: true,
        showOrderActions: true,
      }),
      acceptedQuoteId: 'q1',
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Message',
      href: '/messages',
      hideOverviewCards: ['pricing'],
      content: {
        eyebrow: 'Your worker',
        value: 'Jordan',
        meta: '07700 900999',
      },
    })
  })

  it('asks a completed party to review before the receipt', () => {
    const model = buildTaskDetailMainCta({
      task: task({
        quotes: [
          {
            id: 'q1',
            status: 'ACCEPTED',
            worker: {
              id: 'worker-user',
              profile: { name: 'Jordan' },
              worker: { id: 'worker-profile' },
            },
          } as TaskDetailRecord['quotes'][number],
        ],
      }),
      myQuote: null,
      permissions: permissions({
        isOwner: true,
        isOpen: false,
        isClosed: false,
        taskStatus: 'AWARDED',
      }),
      acceptedQuoteId: 'q1',
      settled: { role: 'owner', agreedPrice: '£85', orderId: 'order-1' },
      copy,
    })
    expect(model).toMatchObject({
      buttonLabel: 'Review',
      intent: undefined,
      href: '/tasks/task-1/review?orderId=order-1',
      hideOverviewCards: ['pricing'],
      content: { eyebrow: 'Completed', value: 'Jordan' },
    })
  })

  it('offers the receipt after this viewer has reviewed, without waiting', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({
        isOpen: false,
        isClosed: true,
        isOrderWorker: true,
        taskStatus: 'CLOSED',
      }),
      settled: { role: 'worker', agreedPrice: '£85', orderId: 'order-1' },
      viewerHasSubmittedReview: true,
      copy,
    })
    expect(model).toMatchObject({
      buttonLabel: 'Get receipt',
      intent: 'receipt',
      href: undefined,
      hideOverviewCards: ['pricing'],
      content: { eyebrow: 'Completed', value: '£85' },
    })
  })

  it('returns null when the viewer has no primary action', () => {
    expect(
      buildTaskDetailMainCta({
        task: task(),
        myQuote: null,
        permissions: permissions({ isOpen: false }),
        copy,
      }),
    ).toBeNull()
  })
})
