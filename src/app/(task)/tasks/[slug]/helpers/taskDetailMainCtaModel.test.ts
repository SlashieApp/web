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
  signInToQuote: 'Sign in to quote',
  editQuote: 'Edit quote',
  quoteSent: 'Quote sent',
  yourQuote: 'Your quote',
  quoteSentValue: 'Sent',
  askingPrice: 'Your asking price',
  awaitingReview: 'Waiting for the owner to review',
  budget: 'Budget',
  confirm: 'Confirm completion',
  complete: 'Complete / confirm',
  customerTitle: 'Job in progress',
  workerTitle: 'You are booked for this job',
  completionCode: 'Completion code',
  enterCodeCta: 'Complete job & confirm payment',
  owner: 'Owner',
  contactTask: 'Contact customer',
  emailCustomer: 'Email customer',
  addContact: 'Add contact in Account',
  ownerFallback: 'Task owner',
  beOnSite: 'Be on site',
  flexibleWhen: 'Flexible',
  markCompleted: 'Mark as completed',
  workerEyebrow: 'Your job',
  contactWorker: 'Contact worker',
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
    hasWorkerProfile: true,
    atCap: false,
    canSubmitQuote: false,
    hasPendingQuote: false,
    showQuoteForm: false,
    showGuestQuoteCta: false,
    showQuoteUnavailableNotice: false,
    showOwnerQuoteList: false,
    showAcceptDecline: false,
    showWorkerJobBanner: false,
    showCompleteWithCode: false,
    showCustomerCompletionCode: false,
    showFullAddress: false,
    canCancelTask: false,
    canEditTask: false,
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

  it('hides the owner card for the assigned worker contact action', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({
        isOpen: false,
        isOrderWorker: true,
        isOrderActive: true,
      }),
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Contact customer',
      href: 'tel:07700900123',
      hideOverviewCards: ['owner'],
      content: { eyebrow: 'Owner', value: 'Ava' },
    })
  })

  it('keeps contact as the booked worker primary and hides price and owner cards', () => {
    const model = buildTaskDetailMainCta({
      task: task(),
      myQuote: null,
      permissions: permissions({
        isOpen: false,
        showCompleteWithCode: true,
      }),
      schedule: {
        type: TaskDateTimeType.Exact,
        date: '2020-01-01',
        time: '09:00',
      },
      now: new Date('2026-01-01T12:00:00'),
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Contact customer',
      href: 'tel:07700900123',
      hideOverviewCards: ['pricing', 'owner'],
      content: { eyebrow: 'Be on site' },
    })
    expect(model?.content?.value).toEqual(expect.any(String))
    expect(model?.scrollTo).toBeUndefined()
  })

  it('makes contact the booked customer primary and hides the price card', () => {
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
        showCustomerCompletionCode: true,
      }),
      acceptedQuoteId: 'q1',
      copy,
    })
    expect(model).toMatchObject({
      presentation: 'quoted',
      buttonLabel: 'Contact worker',
      href: 'tel:07700900999',
      hideOverviewCards: ['pricing'],
      content: { eyebrow: 'Your worker', value: 'Jordan' },
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
        isClosed: true,
        taskStatus: 'CLOSED',
      }),
      acceptedQuoteId: 'q1',
      settled: { role: 'owner', agreedPrice: '£85' },
      copy,
    })
    expect(model).toMatchObject({
      buttonLabel: 'Review',
      intent: 'review',
      href: undefined,
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
      settled: { role: 'worker', agreedPrice: '£85' },
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
