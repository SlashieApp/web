import { describe, expect, it } from 'vitest'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import {
  TASK_DETAIL_SECTION_RULES,
  resolveTaskDetailSectionLayout,
  resolveTaskDetailStickySection,
} from './taskDetailSectionRegistry'

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

function ctx(
  overrides: Partial<Parameters<typeof resolveTaskDetailStickySection>[0]> = {},
) {
  return {
    permissions: permissions(),
    quoteCount: 0,
    pending: false,
    hasTask: true,
    ...overrides,
  }
}

describe('task detail section registry', () => {
  it('gives every overview section a unique id and unique pin priority', () => {
    const ids = TASK_DETAIL_SECTION_RULES.map((rule) => rule.id)
    expect(new Set(ids).size).toBe(ids.length)

    const pinRanks = TASK_DETAIL_SECTION_RULES.filter(
      (rule) => rule.stickyPriority != null,
    ).map((rule) => rule.stickyPriority)
    expect(pinRanks.length).toBeGreaterThan(0)
    expect(new Set(pinRanks).size).toBe(pinRanks.length)
  })

  it('pins pricing + quote for guests and signed-in non-workers', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
          permissions: permissions({ showGuestQuoteCta: true }),
          quoteCount: 2,
        }),
      ),
    ).toBe('pricing')

    expect(
      resolveTaskDetailStickySection(
        ctx({
          permissions: permissions({
            hasWorkerProfile: true,
            canSubmitQuote: true,
            showQuoteForm: true,
          }),
        }),
      ),
    ).toBe('pricing')

    const loggedInVisitor = resolveTaskDetailSectionLayout(
      ctx({
        permissions: permissions({ showGuestQuoteCta: false }),
      }),
    )
    expect(loggedInVisitor.stickySectionId).toBe('pricing')
    expect(loggedInVisitor.placement.pricing).toBe('pin')
    expect(loggedInVisitor.placement.share).toBe('hidden')
    expect(loggedInVisitor.placement.owner).toBe('flow')
  })

  it('pins share for the task owner on an open task, even with quotes', () => {
    const openOwner = resolveTaskDetailSectionLayout(
      ctx({
        permissions: permissions({
          isOwner: true,
          showOwnerQuoteList: true,
          showAcceptDecline: true,
          canEditTask: true,
          canCancelTask: true,
        }),
        quoteCount: 3,
      }),
    )
    expect(openOwner.stickySectionId).toBe('share')
    expect(openOwner.placement.share).toBe('pin')
    expect(openOwner.placement.pricing).toBe('flow')
    expect(openOwner.placement.owner).toBe('hidden')
  })

  it('pins owner detail + contact for the assigned worker', () => {
    const worker = resolveTaskDetailSectionLayout(
      ctx({
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
        quoteCount: 1,
      }),
    )
    expect(worker.stickySectionId).toBe('owner')
    expect(worker.placement.owner).toBe('pin')
    expect(worker.placement.pricing).toBe('flow')
    expect(worker.placement.share).toBe('hidden')
    expect(worker.placement.confirm).toBe('hidden')
  })

  it('lets owner completion confirm beat share when an order is active', () => {
    const awardedOwner = resolveTaskDetailSectionLayout(
      ctx({
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
    )
    expect(awardedOwner.stickySectionId).toBe('confirm')
    expect(awardedOwner.placement.confirm).toBe('pin')
    expect(awardedOwner.placement.share).toBe('hidden')
    expect(awardedOwner.placement.pricing).toBe('flow')
  })

  it('never returns two pin winners and documents conflicts', () => {
    const pinnable = TASK_DETAIL_SECTION_RULES.filter(
      (rule) => rule.stickyPriority != null,
    )
    for (const rule of pinnable) {
      expect(rule.conflictsWith.length).toBeGreaterThan(0)
      for (const other of pinnable) {
        if (other.id === rule.id) continue
        expect(rule.conflictsWith).toContain(other.id)
      }
    }

    const mixed = resolveTaskDetailStickySection(
      ctx({
        permissions: permissions({
          isOwner: true,
          showGuestQuoteCta: true,
          showQuoteForm: true,
          showWorkerJobBanner: true,
          showCompleteWithCode: true,
          showCustomerCompletionCode: true,
        }),
      }),
    )
    expect(mixed).toBe('confirm')
  })

  it('pins nothing when the viewer has no matching role action', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
          permissions: permissions({
            hasWorkerProfile: true,
            canSubmitQuote: true,
            isOpen: true,
          }),
        }),
      ),
    ).toBeNull()
  })
})
