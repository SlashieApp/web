import { describe, expect, it } from 'vitest'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import {
  TASK_DETAIL_OVERVIEW_SECTIONS,
  TASK_DETAIL_STICKY_PRIORITY,
  listTaskDetailFlowSections,
  resolveTaskDetailOverviewPlacement,
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
    statusReady: true,
    pending: false,
    hasTask: true,
    ...overrides,
  }
}

describe('task detail section registry', () => {
  it('gives every overview section a unique id', () => {
    const ids = TASK_DETAIL_OVERVIEW_SECTIONS.map((section) => section.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('documents a strict stickyPriority order for pinnable cards', () => {
    expect(TASK_DETAIL_STICKY_PRIORITY.completion).toBeLessThan(
      TASK_DETAIL_STICKY_PRIORITY.owner,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.owner).toBeLessThan(
      TASK_DETAIL_STICKY_PRIORITY.share,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.share).toBeLessThan(
      TASK_DETAIL_STICKY_PRIORITY.pricingQuote,
    )
  })

  it('pins pricing+quote for a guest on an open task', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
          permissions: permissions({ showGuestQuoteCta: true }),
          quoteCount: 2,
        }),
      ),
    ).toBe('pricingQuote')
  })

  it('pins pricing+quote for a signed-in worker who can quote', () => {
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
    ).toBe('pricingQuote')
  })

  it('pins the share card for an owner with no quotes', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
          permissions: permissions({
            isOwner: true,
            showOwnerQuoteList: true,
            canEditTask: true,
            canCancelTask: true,
          }),
          quoteCount: 0,
        }),
      ),
    ).toBe('share')
  })

  it('keeps one owner sticky when quotes exist (share wins, not pricing)', () => {
    const sticky = resolveTaskDetailStickySection(
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
    expect(sticky).toBe('share')
    expect(sticky).not.toBe('pricingQuote')
  })

  it('pins owner detail + contact for an accepted active worker', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
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
      ),
    ).toBe('owner')
  })

  it('lets owner confirm-code chrome beat share and pricing', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
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
          quoteCount: 1,
        }),
      ),
    ).toBe('completion')
  })

  it('picks exactly one winner when every pinnable card is eligible', () => {
    const sticky = resolveTaskDetailStickySection(
      ctx({
        permissions: permissions({
          isOwner: true,
          isOpen: true,
          isOrderWorker: true,
          isOrderActive: true,
          showGuestQuoteCta: true,
          showQuoteForm: true,
          showCustomerCompletionCode: true,
          showCompleteWithCode: true,
        }),
        quoteCount: 4,
      }),
    )
    expect(sticky).toBe('completion')
    expect(['completion', 'owner', 'share', 'pricingQuote']).toContain(sticky)
  })

  it('returns no sticky before status is ready', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
          statusReady: false,
          permissions: permissions({ showGuestQuoteCta: true }),
        }),
      ),
    ).toBeNull()
  })

  it('returns no sticky on a closed task with no role pin', () => {
    expect(
      resolveTaskDetailStickySection(
        ctx({
          permissions: permissions({
            isOpen: false,
            isClosed: true,
            taskStatus: 'CLOSED',
          }),
        }),
      ),
    ).toBeNull()
  })

  it('keeps pricing in the scroll flow for owners (must not also pin)', () => {
    const placement = resolveTaskDetailOverviewPlacement(
      ctx({
        permissions: permissions({
          isOwner: true,
          showOwnerQuoteList: true,
          canEditTask: true,
        }),
      }),
    )
    expect(placement.stickyId).toBe('share')
    expect(placement.flowIds).toContain('pricingQuote')
    expect(placement.flowIds).not.toContain('share')
  })

  it('keeps pricing in flow for visitors so desktop can still show the card', () => {
    const flow = listTaskDetailFlowSections(
      ctx({
        permissions: permissions({ showGuestQuoteCta: true }),
      }),
    )
    expect(flow).toContain('pricingQuote')
  })

  it('hides the owner card from flow for the task owner', () => {
    const flow = listTaskDetailFlowSections(
      ctx({
        permissions: permissions({ isOwner: true }),
      }),
    )
    expect(flow).not.toContain('owner')
  })
})
