import { WEB_MQ } from '@/theme/breakpoints'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import { getTaskDetailPrimaryCta } from './getTaskDetailPrimaryCta'

/**
 * Overview (and completion) sections that declare their own flow vs mobile-pin
 * rules. Every card on task detail is listed so placement is explicit — not
 * scattered ad-hoc in JSX.
 */
export type TaskDetailSectionId =
  | 'pricing'
  | 'quoted'
  | 'details'
  | 'photos'
  | 'help'
  | 'activity'
  | 'owner'
  | 'preview'
  | 'completion'

/** Where a section renders for one viewport. */
export type TaskDetailSectionPlacement = 'flow' | 'pin' | 'hidden'

/**
 * Shared conflict group for the single mobile bottom pin. Only one section in
 * this group may pin; `stickyPriority` picks the winner (higher wins).
 */
export const TASK_DETAIL_PIN_CONFLICT_GROUP = 'mobile-bottom' as const

export type TaskDetailPinConflictGroup =
  | typeof TASK_DETAIL_PIN_CONFLICT_GROUP
  | null

/**
 * Conflict rank for the mobile bottom pin. Documented winner when several
 * cards could pin:
 *
 * 1. Owner confirm-completion chrome
 * 2. Assigned worker: owner detail + contact
 * 3. Owner (open): preview-as-visitor CTA — also wins over view-quotes (quotes stay a tab)
 * 4. Worker with a pending quote: quote sent + edit-quote CTA
 * 5. Visitor / not-yet-quoted worker: pricing + send-quote CTA
 */
export const TASK_DETAIL_STICKY_PRIORITY = {
  completion: 100,
  owner: 80,
  preview: 60,
  quoted: 50,
  pricing: 40,
  none: 0,
} as const

export type TaskDetailSectionContext = {
  hasTask: boolean
  pending: boolean
  permissions: TaskDetailPermissions
  isAuthenticated: boolean
  quoteCount: number
}

export type TaskDetailSectionRule = {
  id: TaskDetailSectionId
  /** `mobile-bottom` sections compete; `null` never pins. */
  pinConflictGroup: TaskDetailPinConflictGroup
  stickyPriority: number
  showInFlow: (ctx: TaskDetailSectionContext) => boolean
  canPinMobile: (ctx: TaskDetailSectionContext) => boolean
}

export type TaskDetailSectionResolution = {
  /** Mobile flow vs pin vs hidden, per section. */
  mobile: Record<TaskDetailSectionId, TaskDetailSectionPlacement>
  /**
   * Desktop flow vs hidden. When pricing is the rail CTA (`pinnedId`),
   * overview does not also show the full price card.
   */
  desktop: Record<TaskDetailSectionId, TaskDetailSectionPlacement>
  /** Winning mobile pin, or null when nothing pins. */
  pinnedId: TaskDetailSectionId | null
}

function quoteKind(ctx: TaskDetailSectionContext) {
  return getTaskDetailPrimaryCta({
    permissions: ctx.permissions,
    quoteCount: ctx.quoteCount,
  })
}

/**
 * Visitor / guest / signed-in non-owner who has not quoted yet (typical
 * browse). Quoted workers, assigned workers, and owners are excluded.
 */
function isQuoteVisitorPath(ctx: TaskDetailSectionContext): boolean {
  const kind = quoteKind(ctx)
  return kind === 'sendQuote' || kind === 'signInToQuote'
}

export const TASK_DETAIL_SECTION_RULES: readonly TaskDetailSectionRule[] = [
  {
    id: 'pricing',
    pinConflictGroup: TASK_DETAIL_PIN_CONFLICT_GROUP,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.pricing,
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: (ctx) => isQuoteVisitorPath(ctx),
  },
  {
    id: 'quoted',
    pinConflictGroup: TASK_DETAIL_PIN_CONFLICT_GROUP,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.quoted,
    // Main CTA only; the full pricing card stays in the scroll body.
    showInFlow: () => false,
    canPinMobile: (ctx) => quoteKind(ctx) === 'editQuote',
  },
  {
    id: 'details',
    pinConflictGroup: null,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.none,
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: () => false,
  },
  {
    id: 'photos',
    pinConflictGroup: null,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.none,
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: () => false,
  },
  {
    id: 'help',
    pinConflictGroup: null,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.none,
    // Desktop Help & actions live on the task-detail rail; compact uses overflow.
    showInFlow: (ctx) => ctx.hasTask,
    canPinMobile: () => false,
  },
  {
    id: 'activity',
    pinConflictGroup: null,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.none,
    // Desktop Activity lives on the task-detail rail; compact uses the header icon.
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: () => false,
  },
  {
    id: 'owner',
    pinConflictGroup: TASK_DETAIL_PIN_CONFLICT_GROUP,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.owner,
    showInFlow: (ctx) =>
      !ctx.permissions.isOwner && (ctx.hasTask || ctx.pending),
    // Assigned worker on an active job — owner identity + contact.
    canPinMobile: (ctx) =>
      ctx.permissions.isOrderWorker && ctx.permissions.isOrderActive,
  },
  {
    id: 'preview',
    pinConflictGroup: TASK_DETAIL_PIN_CONFLICT_GROUP,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.preview,
    // Main CTA only; not a scroll-body card.
    showInFlow: () => false,
    // Owner open task — preview wins over view-quotes (quotes stay a tab).
    canPinMobile: (ctx) =>
      ctx.permissions.isOwner &&
      ctx.permissions.isOpen &&
      !ctx.permissions.showCustomerCompletionCode,
  },
  {
    id: 'completion',
    pinConflictGroup: TASK_DETAIL_PIN_CONFLICT_GROUP,
    stickyPriority: TASK_DETAIL_STICKY_PRIORITY.completion,
    showInFlow: () => false,
    // Owner confirm-code chrome. Assigned workers keep complete-with-code
    // in the scroll body so the owner+contact card can pin.
    canPinMobile: (ctx) => ctx.permissions.showCustomerCompletionCode,
  },
]

function emptyPlacements(
  value: TaskDetailSectionPlacement,
): Record<TaskDetailSectionId, TaskDetailSectionPlacement> {
  return {
    pricing: value,
    quoted: value,
    details: value,
    photos: value,
    help: value,
    activity: value,
    owner: value,
    preview: value,
    completion: value,
  }
}

/**
 * Resolve flow vs pin for every section. At most one `mobile-bottom` section
 * pins; losers that still `showInFlow` stay in the scroll body.
 */
export function resolveTaskDetailSections(
  ctx: TaskDetailSectionContext,
): TaskDetailSectionResolution {
  const pinCandidates = TASK_DETAIL_SECTION_RULES.filter(
    (rule) =>
      rule.pinConflictGroup === TASK_DETAIL_PIN_CONFLICT_GROUP &&
      rule.canPinMobile(ctx),
  )
  const winner = pinCandidates.reduce<TaskDetailSectionRule | null>(
    (best, rule) => {
      if (!best || rule.stickyPriority > best.stickyPriority) return rule
      return best
    },
    null,
  )
  const pinnedId = winner?.id ?? null

  const mobile = emptyPlacements('hidden')
  const desktop = emptyPlacements('hidden')

  for (const rule of TASK_DETAIL_SECTION_RULES) {
    const inFlow = rule.showInFlow(ctx)
    const hideDesktopTwin = pinnedId === 'pricing' && rule.id === 'pricing'
    desktop[rule.id] = inFlow && !hideDesktopTwin ? 'flow' : 'hidden'
    if (rule.id === pinnedId) mobile[rule.id] = 'pin'
    else mobile[rule.id] = inFlow ? 'flow' : 'hidden'
  }

  return { mobile, desktop, pinnedId }
}

/** Shared web split (`lg` / 1024px). Prefer `WEB_MQ` from `@/theme/breakpoints`. */
export const TASK_DETAIL_DESKTOP_MQ = WEB_MQ

export function sectionFlowDisplay(
  id: TaskDetailSectionId,
  resolved: TaskDetailSectionResolution,
): { base: 'block' | 'none'; lg: 'block' | 'none' } {
  return {
    base: resolved.mobile[id] === 'flow' ? 'block' : 'none',
    lg: resolved.desktop[id] === 'flow' ? 'block' : 'none',
  }
}

/**
 * Viewport-accurate hide/show that does not depend on Chakra's `display`
 * token map. Used so a pinned mobile card is truly removed from the
 * scroll body below `lg`.
 */
export function sectionFlowCss(
  id: TaskDetailSectionId,
  resolved: TaskDetailSectionResolution,
) {
  const mobile = resolved.mobile[id] === 'flow' ? 'block' : 'none'
  const desktop = resolved.desktop[id] === 'flow' ? 'block' : 'none'
  return {
    display: mobile,
    [`@media screen and ${TASK_DETAIL_DESKTOP_MQ}`]: {
      display: desktop,
    },
  } as const
}
