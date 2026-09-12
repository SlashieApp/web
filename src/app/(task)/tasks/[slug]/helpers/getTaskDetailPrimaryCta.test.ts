import { describe, expect, it } from 'vitest'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import { getTaskDetailPrimaryCta } from './getTaskDetailPrimaryCta'

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
    isOrderWorker: false,
    isOrderActive: false,
    hasWorkerProfile: false,
    atCap: false,
    canSubmitQuote: false,
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

describe('getTaskDetailPrimaryCta', () => {
  it('visitor on an open task gets sign-in-to-quote', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({ showGuestQuoteCta: true }),
        quoteCount: 2,
      }),
    ).toBe('signInToQuote')
  })

  it('eligible worker on an open task gets send-quote', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({
          hasWorkerProfile: true,
          canSubmitQuote: true,
          showQuoteForm: true,
        }),
        quoteCount: 0,
      }),
    ).toBe('sendQuote')
  })

  it('owner with quotes gets view-quotes', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({
          isOwner: true,
          showOwnerQuoteList: true,
          showAcceptDecline: true,
          canEditTask: true,
          canCancelTask: true,
        }),
        quoteCount: 2,
      }),
    ).toBe('viewQuotes')
  })

  it('owner with no quotes gets share', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({
          isOwner: true,
          showOwnerQuoteList: true,
          canEditTask: true,
          canCancelTask: true,
        }),
        quoteCount: 0,
      }),
    ).toBe('share')
  })

  it('assigned worker on an active order gets complete', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({
          isOpen: false,
          isAwarded: true,
          taskStatus: 'AWARDED',
          isOrderWorker: true,
          isOrderActive: true,
          showWorkerJobBanner: true,
          showCompleteWithCode: true,
          showFullAddress: true,
        }),
        quoteCount: 1,
      }),
    ).toBe('complete')
  })

  it('customer owner on an active order gets confirm', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({
          isOwner: true,
          isOpen: false,
          isAwarded: true,
          taskStatus: 'AWARDED',
          isOrderActive: true,
          showCustomerCompletionCode: true,
          showFullAddress: true,
        }),
        quoteCount: 1,
      }),
    ).toBe('confirm')
  })

  it('quoting worker with a pending quote has no primary CTA', () => {
    expect(
      getTaskDetailPrimaryCta({
        permissions: permissions({
          hasWorkerProfile: true,
          canSubmitQuote: true,
        }),
        quoteCount: 1,
      }),
    ).toBe('none')
  })
})
