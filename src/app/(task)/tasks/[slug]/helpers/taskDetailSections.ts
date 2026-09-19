import type { TaskDetailPermissions } from './getTaskDetailPermissions'

/**
 * Overview section registry + mobile sticky conflict resolution (FE-168).
 *
 * Each overview card declares:
 * - `showInFlow` — render in the scrollable overview (desktop always; mobile
 *   unless this id is the sticky winner — the layout hides the duplicate).
 * - `canPinMobile` — eligible to pin at the mobile viewport bottom.
 * - `stickyPriority` — conflict rank. **Lower number wins. At most one pin.**
 *
 * Canonical priority (do not invent a second bottom sticky):
 * 1. `completion` — owner confirm-code chrome
 * 2. `ownerContact` — assigned / active-order worker: owner detail + contact
 * 3. `ownerShare` — task owner on an open task (share; hosts view-quotes too)
 * 4. `pricingQuote` — visitor / quotable non-owner: budget + quote CTA
 * 5. none
 *
 * Owner + quotes: winner is `ownerShare`, not a separate view-quotes pin.
 * The share card body includes “View quotes” when `quoteCount > 0`.
 *
 * Worker in progress vs completion: `showCompleteWithCode` is the same flag
 * as `showWorkerJobBanner` today. Pinning both would make completion always
 * hide the worker owner card. The role matrix says in-progress workers get
 * owner detail + contact, so `completion` pins only for
 * `showCustomerCompletionCode`. Worker complete-with-code stays in-flow
 * (`BookingSection` / `WorkerOrderVerificationPanel`).
 */

export type TaskDetailSectionId =
  | 'statusCallout'
  | 'pricingQuote'
  | 'details'
  | 'photos'
  | 'helpActions'
  | 'activity'
  | 'ownerContact'
  | 'ownerShare'
  | 'completion'

export type TaskDetailSectionContext = {
  permissions: TaskDetailPermissions
  quoteCount: number
  hasTask: boolean
  statusReady: boolean
  pending: boolean
}

/**
 * Conflict ranks for pin-eligible sections. Lower number wins.
 * Non-pinnable sections use `null`.
 */
export const TASK_DETAIL_STICKY_PRIORITY = {
  completion: 1,
  ownerContact: 2,
  ownerShare: 3,
  pricingQuote: 4,
} as const

export type TaskDetailSectionDef = {
  id: TaskDetailSectionId
  stickyPriority: number | null
  showInFlow: (ctx: TaskDetailSectionContext) => boolean
  canPinMobile: (ctx: TaskDetailSectionContext) => boolean
}

const hasOverviewBody = (ctx: TaskDetailSectionContext) =>
  ctx.hasTask || ctx.pending

export const TASK_DETAIL_SECTIONS: readonly TaskDetailSectionDef[] = [
  {
    id: 'statusCallout',
    stickyPriority: null,
    showInFlow: (ctx) => ctx.statusReady && ctx.hasTask,
    canPinMobile: () => false,
  },
  {
    id: 'pricingQuote',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.pricingQuote,
    showInFlow: hasOverviewBody,
    canPinMobile: (ctx) =>
      ctx.statusReady &&
      ctx.hasTask &&
      (ctx.permissions.showQuoteForm || ctx.permissions.showGuestQuoteCta) &&
      !ctx.permissions.isOwner &&
      !ctx.permissions.isOrderWorker,
  },
  {
    id: 'details',
    stickyPriority: null,
    showInFlow: hasOverviewBody,
    canPinMobile: () => false,
  },
  {
    id: 'photos',
    stickyPriority: null,
    showInFlow: hasOverviewBody,
    canPinMobile: () => false,
  },
  {
    id: 'helpActions',
    stickyPriority: null,
    showInFlow: hasOverviewBody,
    canPinMobile: () => false,
  },
  {
    id: 'activity',
    stickyPriority: null,
    showInFlow: hasOverviewBody,
    canPinMobile: () => false,
  },
  {
    id: 'ownerContact',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.ownerContact,
    showInFlow: (ctx) => hasOverviewBody(ctx) && !ctx.permissions.isOwner,
    canPinMobile: (ctx) =>
      ctx.statusReady &&
      ctx.hasTask &&
      (ctx.permissions.showWorkerJobBanner ||
        (ctx.permissions.isOrderWorker && ctx.permissions.isOrderActive)),
  },
  {
    id: 'ownerShare',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.ownerShare,
    // Share lives on the mobile pin (and desktop Help & actions). Not a
    // second in-flow share card.
    showInFlow: () => false,
    canPinMobile: (ctx) =>
      ctx.statusReady &&
      ctx.hasTask &&
      ctx.permissions.isOwner &&
      ctx.permissions.isOpen &&
      !ctx.permissions.showCustomerCompletionCode,
  },
  {
    id: 'completion',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.completion,
    showInFlow: () => false,
    canPinMobile: (ctx) =>
      ctx.statusReady &&
      ctx.hasTask &&
      ctx.permissions.showCustomerCompletionCode,
  },
]

const SECTION_BY_ID = new Map(
  TASK_DETAIL_SECTIONS.map((section) => [section.id, section]),
)

export function getTaskDetailSection(
  id: TaskDetailSectionId,
): TaskDetailSectionDef {
  const section = SECTION_BY_ID.get(id)
  if (!section) {
    throw new Error(`Unknown task-detail section: ${id}`)
  }
  return section
}

export function shouldShowInFlow(
  id: TaskDetailSectionId,
  ctx: TaskDetailSectionContext,
): boolean {
  return getTaskDetailSection(id).showInFlow(ctx)
}

/**
 * Hide the in-flow copy of the sticky winner on mobile only. Desktop keeps
 * the section in the column layout (no second sticky system).
 */
export function isHiddenOnMobileWhilePinned(
  id: TaskDetailSectionId,
  stickyId: TaskDetailSectionId | null,
): boolean {
  return stickyId === id
}

/**
 * Pick the single mobile sticky winner. Stable: lowest `stickyPriority`, then
 * `id` for determinism if two ranks ever collide.
 */
export function resolveStickySection(
  ctx: TaskDetailSectionContext,
): TaskDetailSectionId | null {
  const candidates = TASK_DETAIL_SECTIONS.filter(
    (section) => section.stickyPriority != null && section.canPinMobile(ctx),
  )
  if (candidates.length === 0) return null
  const winner = [...candidates].sort((a, b) => {
    const rank = (a.stickyPriority ?? 99) - (b.stickyPriority ?? 99)
    if (rank !== 0) return rank
    return a.id.localeCompare(b.id)
  })[0]
  return winner?.id ?? null
}
