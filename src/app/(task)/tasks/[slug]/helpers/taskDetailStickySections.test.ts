import { describe, expect, it } from 'vitest'

import { WEB_MQ } from '@/theme/breakpoints'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import {
  TASK_DETAIL_DESKTOP_MQ,
  TASK_DETAIL_PIN_CONFLICT_GROUP,
  TASK_DETAIL_SECTION_RULES,
  TASK_DETAIL_STICKY_PRIORITY,
  type TaskDetailSectionContext,
  resolveTaskDetailSections,
  sectionFlowCss,
  sectionFlowDisplay,
} from './taskDetailStickySections'

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

describe('TASK_DETAIL_SECTION_RULES', () => {
  it('declares every overview section with an explicit conflict group', () => {
    const ids = TASK_DETAIL_SECTION_RULES.map((rule) => rule.id)
    expect(ids).toEqual([
      'pricing',
      'quoted',
      'details',
      'photos',
      'help',
      'activity',
      'owner',
      'preview',
      'completion',
    ])
    expect(
      TASK_DETAIL_SECTION_RULES.every(
        (rule) =>
          rule.pinConflictGroup === TASK_DETAIL_PIN_CONFLICT_GROUP ||
          rule.pinConflictGroup === null,
      ),
    ).toBe(true)
  })

  it('gives pinnable cards unique priorities so conflicts resolve to one winner', () => {
    const pinnable = TASK_DETAIL_SECTION_RULES.filter(
      (rule) => rule.pinConflictGroup === TASK_DETAIL_PIN_CONFLICT_GROUP,
    )
    const ranks = pinnable.map((rule) => rule.stickyPriority)
    expect(new Set(ranks).size).toBe(ranks.length)
    expect(TASK_DETAIL_STICKY_PRIORITY.completion).toBeGreaterThan(
      TASK_DETAIL_STICKY_PRIORITY.owner,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.owner).toBeGreaterThan(
      TASK_DETAIL_STICKY_PRIORITY.preview,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.preview).toBeGreaterThan(
      TASK_DETAIL_STICKY_PRIORITY.quoted,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.quoted).toBeGreaterThan(
      TASK_DETAIL_STICKY_PRIORITY.pricing,
    )
  })
})

describe('resolveTaskDetailSections', () => {
  it('uses the shared web media query for desktop flow CSS', () => {
    expect(TASK_DETAIL_DESKTOP_MQ).toBe(WEB_MQ)
  })

  it('pins pricing + quote for a guest visitor and keeps pricing out of the mobile body', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: false,
      quoteCount: 1,
      permissions: permissions({ showGuestQuoteCta: true }),
    })
    expect(resolved.pinnedId).toBe('pricing')
    expect(resolved.mobile.pricing).toBe('pin')
    expect(resolved.desktop.pricing).toBe('hidden')
    expect(sectionFlowDisplay('pricing', resolved)).toEqual({
      base: 'none',
      lg: 'none',
    })
    expect(sectionFlowCss('pricing', resolved)).toEqual({
      display: 'none',
      [`@media screen and ${TASK_DETAIL_DESKTOP_MQ}`]: { display: 'none' },
    })
    expect(resolved.mobile.owner).toBe('flow')
    expect(resolved.mobile.preview).toBe('hidden')
    expect(resolved.mobile.completion).toBe('hidden')
  })

  it('pins pricing for a signed-in non-owner non-worker', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 0,
      permissions: permissions(),
    })
    expect(resolved.pinnedId).toBe('pricing')
    expect(resolved.mobile.pricing).toBe('pin')
    expect(resolved.desktop.pricing).toBe('hidden')
  })

  it('pins pricing for an eligible quoting worker', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 0,
      permissions: permissions({
        hasWorkerProfile: true,
        canSubmitQuote: true,
        showQuoteForm: true,
      }),
    })
    expect(resolved.pinnedId).toBe('pricing')
    expect(resolved.desktop.pricing).toBe('hidden')
  })

  it('pins the quoted CTA (not pricing) for a worker whose quote awaits review', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 1,
      permissions: permissions({
        hasWorkerProfile: true,
        canSubmitQuote: true,
        showQuoteForm: true,
        hasPendingQuote: true,
      }),
    })
    expect(resolved.pinnedId).toBe('quoted')
    expect(resolved.mobile.quoted).toBe('pin')
    expect(resolved.mobile.pricing).toBe('flow')
    expect(resolved.desktop.pricing).toBe('flow')
  })

  it('pins nothing once the worker quote is declined, rejected, or withdrawn', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 1,
      permissions: permissions({ hasWorkerProfile: true }),
    })
    expect(resolved.pinnedId).toBeNull()
  })

  it('pins the preview CTA for the task owner (including when quotes exist)', () => {
    const noQuotes = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 0,
      permissions: permissions({
        isOwner: true,
        showOwnerQuoteList: true,
        canEditTask: true,
        canCancelTask: true,
      }),
    })
    expect(noQuotes.pinnedId).toBe('preview')
    expect(noQuotes.mobile.preview).toBe('pin')
    expect(noQuotes.desktop.preview).toBe('hidden')
    expect(noQuotes.mobile.pricing).toBe('flow')
    expect(noQuotes.desktop.pricing).toBe('flow')

    const withQuotes = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 3,
      permissions: permissions({
        isOwner: true,
        showOwnerQuoteList: true,
        showAcceptDecline: true,
        canEditTask: true,
        canCancelTask: true,
      }),
    })
    expect(withQuotes.pinnedId).toBe('preview')
    expect(withQuotes.mobile.pricing).toBe('flow')
  })

  it('pins owner + contact for an assigned worker and leaves completion in the body', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 1,
      permissions: permissions({
        isOpen: false,
        isAwarded: true,
        taskStatus: 'AWARDED',
        isOrderWorker: true,
        isOrderActive: true,
        hasWorkerProfile: true,
        showWorkerJobBanner: true,
        showCompleteWithCode: true,
        showFullAddress: true,
      }),
    })
    expect(resolved.pinnedId).toBe('owner')
    expect(resolved.mobile.owner).toBe('pin')
    expect(resolved.desktop.owner).toBe('flow')
    expect(resolved.mobile.completion).toBe('hidden')
    expect(resolved.mobile.pricing).toBe('flow')
    expect(sectionFlowDisplay('owner', resolved)).toEqual({
      base: 'none',
      lg: 'block',
    })
  })

  it('lets owner confirm-completion beat preview when the order is active', () => {
    const resolved = resolveTaskDetailSections({
      hasTask: true,
      pending: false,
      isAuthenticated: true,
      quoteCount: 1,
      permissions: permissions({
        isOwner: true,
        isOpen: false,
        isAwarded: true,
        taskStatus: 'AWARDED',
        isOrderActive: true,
        showCustomerCompletionCode: true,
        showFullAddress: true,
        showOwnerQuoteList: true,
      }),
    })
    expect(resolved.pinnedId).toBe('completion')
    expect(resolved.mobile.completion).toBe('pin')
    expect(resolved.mobile.preview).toBe('hidden')
    expect(resolved.mobile.owner).toBe('hidden')
  })

  it('never pins two mobile-bottom cards at once', () => {
    const contexts: TaskDetailSectionContext[] = [
      {
        hasTask: true,
        pending: false,
        isAuthenticated: false,
        quoteCount: 0,
        permissions: permissions({ showGuestQuoteCta: true }),
      },
      {
        hasTask: true,
        pending: false,
        isAuthenticated: true,
        quoteCount: 2,
        permissions: permissions({
          isOwner: true,
          showOwnerQuoteList: true,
          canEditTask: true,
        }),
      },
      {
        hasTask: true,
        pending: false,
        isAuthenticated: true,
        quoteCount: 1,
        permissions: permissions({
          isOrderWorker: true,
          isOrderActive: true,
          showCompleteWithCode: true,
          showWorkerJobBanner: true,
        }),
      },
    ]
    for (const ctx of contexts) {
      const { mobile } = resolveTaskDetailSections(ctx)
      const pinned = TASK_DETAIL_SECTION_RULES.filter(
        (rule) => mobile[rule.id] === 'pin',
      )
      expect(pinned.length).toBeLessThanOrEqual(1)
    }
  })
})
