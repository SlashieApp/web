import type { TaskDetailPermissions } from './getTaskDetailPermissions'

/**
 * Overview cards on `/tasks/[slug]`. Each id is unique — one card, one
 * placement decision (in-flow vs mobile sticky).
 *
 * Conflict order (`stickyPriority`, lower wins) — FE-168:
 *  1. `completion` (10) — owner confirm-code chrome. Beats marketing stickies.
 *     Worker complete-with-code is not a separate sticky; it lives on `owner`
 *     so the worker role card still pins (owner detail + contact).
 *  2. `owner` (20) — accepted / active worker: owner detail + contact CTA
 *  3. `share` (30) — owner on an open task. View-quotes is a button on this
 *     card when that is the primary owner action — one sticky body, not two.
 *  4. `pricingQuote` (40) — guest / visitor / signed-in non-owner quote path
 *  5. none
 */
export type TaskDetailSectionId =
  | 'statusCallout'
  | 'pricingQuote'
  | 'details'
  | 'photos'
  | 'helpActions'
  | 'activity'
  | 'owner'
  | 'share'
  | 'completion'
  | 'safetyNotice'

export type TaskDetailSectionColumn = 'full' | 'main' | 'aside' | 'sticky'

export type TaskDetailSectionContext = {
  permissions: TaskDetailPermissions
  quoteCount: number
  statusReady: boolean
  pending: boolean
  hasTask: boolean
}

export type TaskDetailSectionDef = {
  id: TaskDetailSectionId
  column: TaskDetailSectionColumn
  /** Lower number wins when more than one section `canPinMobile`. */
  stickyPriority: number | null
  showInFlow: (ctx: TaskDetailSectionContext) => boolean
  canPinMobile: (ctx: TaskDetailSectionContext) => boolean
}

function isQuotePath(ctx: TaskDetailSectionContext): boolean {
  return ctx.permissions.showQuoteForm || ctx.permissions.showGuestQuoteCta
}

function isAcceptedWorker(ctx: TaskDetailSectionContext): boolean {
  return ctx.permissions.isOrderWorker && ctx.permissions.isOrderActive
}

/**
 * Exported ranks so tests and call sites document the same order.
 * Only pinnable sections have a finite rank.
 */
export const TASK_DETAIL_STICKY_PRIORITY = {
  completion: 10,
  owner: 20,
  share: 30,
  pricingQuote: 40,
} as const

export const TASK_DETAIL_OVERVIEW_SECTIONS: readonly TaskDetailSectionDef[] = [
  {
    id: 'statusCallout',
    column: 'full',
    stickyPriority: null,
    showInFlow: (ctx) => ctx.statusReady && ctx.hasTask,
    canPinMobile: () => false,
  },
  {
    id: 'pricingQuote',
    column: 'main',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.pricingQuote,
    // Owners keep pricing in scroll; visitors pin it (hidden from mobile flow).
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: (ctx) => ctx.statusReady && ctx.hasTask && isQuotePath(ctx),
  },
  {
    id: 'details',
    column: 'main',
    stickyPriority: null,
    showInFlow: () => true,
    canPinMobile: () => false,
  },
  {
    id: 'photos',
    column: 'main',
    stickyPriority: null,
    showInFlow: () => true,
    canPinMobile: () => false,
  },
  {
    id: 'helpActions',
    column: 'aside',
    stickyPriority: null,
    // Desktop Help & actions card; mobile uses the overflow trigger.
    showInFlow: () => true,
    canPinMobile: () => false,
  },
  {
    id: 'activity',
    column: 'aside',
    stickyPriority: null,
    showInFlow: () => true,
    canPinMobile: () => false,
  },
  {
    id: 'owner',
    column: 'aside',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.owner,
    showInFlow: (ctx) =>
      !ctx.permissions.isOwner && (ctx.hasTask || ctx.pending),
    canPinMobile: (ctx) =>
      ctx.statusReady && ctx.hasTask && isAcceptedWorker(ctx),
  },
  {
    id: 'share',
    column: 'sticky',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.share,
    showInFlow: () => false,
    canPinMobile: (ctx) =>
      ctx.statusReady &&
      ctx.hasTask &&
      ctx.permissions.isOwner &&
      ctx.permissions.isOpen,
  },
  {
    id: 'completion',
    column: 'sticky',
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.completion,
    showInFlow: () => false,
    canPinMobile: (ctx) =>
      ctx.statusReady &&
      ctx.hasTask &&
      ctx.permissions.showCustomerCompletionCode,
  },
  {
    id: 'safetyNotice',
    column: 'full',
    stickyPriority: null,
    // Quote-path C2C copy lives on the pricing card; everyone else keeps
    // the desktop inline notice.
    showInFlow: (ctx) => ctx.hasTask && !isQuotePath(ctx),
    canPinMobile: () => false,
  },
]

export function getTaskDetailSection(
  id: TaskDetailSectionId,
): TaskDetailSectionDef {
  const section = TASK_DETAIL_OVERVIEW_SECTIONS.find((item) => item.id === id)
  if (!section) {
    throw new Error(`Unknown task-detail section: ${id}`)
  }
  return section
}

/**
 * Single mobile sticky winner. Never returns two ids.
 * Tie-break: lower `stickyPriority`, then registry order.
 */
export function resolveTaskDetailStickySection(
  ctx: TaskDetailSectionContext,
): TaskDetailSectionId | null {
  if (!ctx.statusReady || !ctx.hasTask) return null

  let winner: TaskDetailSectionDef | null = null
  for (const section of TASK_DETAIL_OVERVIEW_SECTIONS) {
    if (section.stickyPriority == null) continue
    if (!section.canPinMobile(ctx)) continue
    if (
      !winner ||
      (winner.stickyPriority ?? Number.POSITIVE_INFINITY) >
        section.stickyPriority
    ) {
      winner = section
    }
  }
  return winner?.id ?? null
}

export function listTaskDetailFlowSections(
  ctx: TaskDetailSectionContext,
): TaskDetailSectionId[] {
  return TASK_DETAIL_OVERVIEW_SECTIONS.filter((section) =>
    section.showInFlow(ctx),
  ).map((section) => section.id)
}

export type TaskDetailOverviewPlacement = {
  flowIds: TaskDetailSectionId[]
  /** Mobile only. Desktop ignores this and never mounts a second sticky. */
  stickyId: TaskDetailSectionId | null
}

export function resolveTaskDetailOverviewPlacement(
  ctx: TaskDetailSectionContext,
): TaskDetailOverviewPlacement {
  const stickyId = resolveTaskDetailStickySection(ctx)
  return {
    flowIds: listTaskDetailFlowSections(ctx),
    stickyId,
  }
}

export function isTaskDetailSectionInFlow(
  id: TaskDetailSectionId,
  placement: TaskDetailOverviewPlacement,
): boolean {
  return placement.flowIds.includes(id)
}
