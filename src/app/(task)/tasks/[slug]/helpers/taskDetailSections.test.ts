import { describe, expect, it } from 'vitest'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import {
  TASK_DETAIL_SECTIONS,
  TASK_DETAIL_STICKY_PRIORITY,
  type TaskDetailSectionContext,
  type TaskDetailSectionId,
  isHiddenOnMobileWhilePinned,
  resolveStickySection,
  shouldShowInFlow,
} from './taskDetailSections'

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
  overrides: Partial<TaskDetailSectionContext> = {},
): TaskDetailSectionContext {
  return {
    permissions: permissions(),
    quoteCount: 0,
    hasTask: true,
    statusReady: true,
    pending: false,
    ...overrides,
  }
}

describe('task detail section registry', () => {
  it('gives every overview section explicit show/pin conditions', () => {
    const ids = TASK_DETAIL_SECTIONS.map((section) => section.id)
    expect(ids).toEqual([
      'statusCallout',
      'pricingQuote',
      'details',
      'photos',
      'helpActions',
      'activity',
      'ownerContact',
      'ownerShare',
      'completion',
    ])
    for (const section of TASK_DETAIL_SECTIONS) {
      expect(typeof section.showInFlow).toBe('function')
      expect(typeof section.canPinMobile).toBe('function')
      expect(
        section.stickyPriority === null ||
          typeof section.stickyPriority === 'number',
      ).toBe(true)
    }
  })

  it('documents sticky conflict ranks (lower wins)', () => {
    expect(TASK_DETAIL_STICKY_PRIORITY.completion).toBe(1)
    expect(TASK_DETAIL_STICKY_PRIORITY.ownerContact).toBe(2)
    expect(TASK_DETAIL_STICKY_PRIORITY.ownerShare).toBe(3)
    expect(TASK_DETAIL_STICKY_PRIORITY.pricingQuote).toBe(4)
    expect(TASK_DETAIL_STICKY_PRIORITY.completion).toBeLessThan(
      TASK_DETAIL_STICKY_PRIORITY.ownerContact,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.ownerContact).toBeLessThan(
      TASK_DETAIL_STICKY_PRIORITY.ownerShare,
    )
    expect(TASK_DETAIL_STICKY_PRIORITY.ownerShare).toBeLessThan(
      TASK_DETAIL_STICKY_PRIORITY.pricingQuote,
    )
  })
})

describe('resolveStickySection', () => {
  it('pins pricing + quote for a guest on an open task', () => {
    expect(
      resolveStickySection(
        ctx({
          permissions: permissions({ showGuestQuoteCta: true }),
          quoteCount: 2,
        }),
      ),
    ).toBe('pricingQuote')
  })

  it('pins pricing + quote for a signed-in worker who can quote', () => {
    expect(
      resolveStickySection(
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

  it('pins the share card for the owner of an open task (no quotes)', () => {
    expect(
      resolveStickySection(
        ctx({
          permissions: permissions({
            isOwner: true,
            showOwnerQuoteList: true,
            canEditTask: true,
            canCancelTask: true,
          }),
        }),
      ),
    ).toBe('ownerShare')
  })

  it('keeps owner + quotes on the share card (not a second view-quotes pin)', () => {
    expect(
      resolveStickySection(
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
      ),
    ).toBe('ownerShare')
  })

  it('pins owner detail + contact for an assigned worker in progress', () => {
    expect(
      resolveStickySection(
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
    ).toBe('ownerContact')
  })

  it('lets owner confirm-code chrome beat share and pricing', () => {
    expect(
      resolveStickySection(
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

  it('lets completion beat worker owner-contact when both flags fire', () => {
    expect(
      resolveStickySection(
        ctx({
          permissions: permissions({
            isOwner: true,
            isOrderWorker: true,
            isOrderActive: true,
            showWorkerJobBanner: true,
            showCompleteWithCode: true,
            showCustomerCompletionCode: true,
            showGuestQuoteCta: true,
            isOpen: true,
          }),
        }),
      ),
    ).toBe('completion')
  })

  it('lets worker owner-contact beat visitor pricing when both could pin', () => {
    expect(
      resolveStickySection(
        ctx({
          permissions: permissions({
            isOrderWorker: true,
            isOrderActive: true,
            showWorkerJobBanner: true,
            showCompleteWithCode: true,
            showQuoteForm: true,
            showGuestQuoteCta: true,
          }),
        }),
      ),
    ).toBe('ownerContact')
  })

  it('returns none when the task is not ready or has no pin-eligible role', () => {
    expect(resolveStickySection(ctx({ statusReady: false }))).toBeNull()
    expect(resolveStickySection(ctx({ hasTask: false }))).toBeNull()
    expect(
      resolveStickySection(
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

  it('never returns more than one winner across role combinations', () => {
    const cases: TaskDetailSectionContext[] = [
      ctx({ permissions: permissions({ showGuestQuoteCta: true }) }),
      ctx({
        permissions: permissions({
          showQuoteForm: true,
          canSubmitQuote: true,
        }),
      }),
      ctx({
        permissions: permissions({ isOwner: true }),
        quoteCount: 0,
      }),
      ctx({
        permissions: permissions({ isOwner: true, showOwnerQuoteList: true }),
        quoteCount: 4,
      }),
      ctx({
        permissions: permissions({
          isOwner: true,
          showCustomerCompletionCode: true,
        }),
      }),
      ctx({
        permissions: permissions({
          isOrderWorker: true,
          isOrderActive: true,
          showWorkerJobBanner: true,
          showCompleteWithCode: true,
          showQuoteForm: true,
        }),
      }),
    ]

    for (const input of cases) {
      const winner = resolveStickySection(input)
      const pins = TASK_DETAIL_SECTIONS.filter((section) =>
        section.canPinMobile(input),
      ).map((section) => section.id)
      if (winner) {
        expect(pins).toContain(winner)
      }
      expect(winner === null || pins.includes(winner)).toBe(true)
      expect([null, ...pins.filter((id) => id === winner)]).toHaveLength(
        winner ? 2 : 1,
      )
    }
  })
})

describe('shouldShowInFlow / mobile pin hide', () => {
  it('keeps pricing in the desktop scroll and hides the mobile duplicate when pinned', () => {
    const visitor = ctx({
      permissions: permissions({ showGuestQuoteCta: true }),
    })
    expect(shouldShowInFlow('pricingQuote', visitor)).toBe(true)
    expect(
      isHiddenOnMobileWhilePinned(
        'pricingQuote',
        resolveStickySection(visitor),
      ),
    ).toBe(true)
    expect(isHiddenOnMobileWhilePinned('details', 'pricingQuote')).toBe(false)
  })

  it('keeps owner pricing in-flow and does not pin it', () => {
    const owner = ctx({ permissions: permissions({ isOwner: true }) })
    expect(shouldShowInFlow('pricingQuote', owner)).toBe(true)
    expect(resolveStickySection(owner)).toBe('ownerShare')
    expect(isHiddenOnMobileWhilePinned('pricingQuote', 'ownerShare')).toBe(
      false,
    )
  })

  it('hides owner detail from the owner in-flow', () => {
    expect(
      shouldShowInFlow(
        'ownerContact',
        ctx({ permissions: permissions({ isOwner: true }) }),
      ),
    ).toBe(false)
  })

  it('does not put share or completion in the scroll stack', () => {
    const ready = ctx()
    expect(shouldShowInFlow('ownerShare', ready)).toBe(false)
    expect(shouldShowInFlow('completion', ready)).toBe(false)
  })
})

describe('sticky priority uniqueness', () => {
  it('assigns a unique rank to every pin-eligible section', () => {
    const ranks = TASK_DETAIL_SECTIONS.filter(
      (section) => section.stickyPriority != null,
    ).map((section) => section.stickyPriority)
    expect(new Set(ranks).size).toBe(ranks.length)
    const ids = new Set<TaskDetailSectionId>()
    for (const section of TASK_DETAIL_SECTIONS) {
      expect(ids.has(section.id)).toBe(false)
      ids.add(section.id)
    }
  })
})
