import { describe, expect, it } from 'vitest'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import { resolveTaskDetailMobilePrimary } from './taskDetailMobilePrimary'

function perms(
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
    hasWorkerProfile: true,
    atCap: false,
    canSubmitQuote: false,
    showQuoteForm: false,
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

describe('resolveTaskDetailMobilePrimary', () => {
  it('sends workers who can quote to the quote flow', () => {
    expect(
      resolveTaskDetailMobilePrimary({
        permissions: perms({ showQuoteForm: true, canSubmitQuote: true }),
        isAuthenticated: true,
        quoteCount: 0,
        taskId: 'task-1',
      }),
    ).toEqual({ kind: 'sendQuote', href: '/tasks/task-1/quote' })
  })

  it('lets owners with quotes jump to the Quotes tab', () => {
    expect(
      resolveTaskDetailMobilePrimary({
        permissions: perms({ isOwner: true, isOpen: true }),
        isAuthenticated: true,
        quoteCount: 3,
        taskId: 'task-1',
      }),
    ).toEqual({ kind: 'viewQuotes', tab: 'quotes' })
  })

  it('does not use View quotes when the owner has none', () => {
    expect(
      resolveTaskDetailMobilePrimary({
        permissions: perms({ isOwner: true, isOpen: true }),
        isAuthenticated: true,
        quoteCount: 0,
        taskId: 'task-1',
      }),
    ).toEqual({ kind: 'share' })
  })

  it('maps awarded workers to complete-with-code on Details', () => {
    expect(
      resolveTaskDetailMobilePrimary({
        permissions: perms({
          showCompleteWithCode: true,
          isOrderWorker: true,
          isOrderActive: true,
          isAwarded: true,
          isOpen: false,
          taskStatus: 'AWARDED',
        }),
        isAuthenticated: true,
        quoteCount: 1,
        taskId: 'task-1',
      }),
    ).toEqual({ kind: 'completeJob', tab: 'details' })
  })

  it('sends guests to sign in', () => {
    const result = resolveTaskDetailMobilePrimary({
      permissions: perms(),
      isAuthenticated: false,
      quoteCount: 2,
      taskId: 'task-1',
    })
    expect(result.kind).toBe('signIn')
    expect(result.href).toContain('/login?next=')
  })
})
