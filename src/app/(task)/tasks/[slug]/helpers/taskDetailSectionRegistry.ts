import type { TaskDetailPermissions } from './getTaskDetailPermissions'

/**
 * Overview cards on task detail. Each rule declares in-flow vs mobile-pin
 * eligibility; {@link resolveTaskDetailStickySection} picks at most one pin.
 */
export type TaskDetailSectionId =
  | 'statusCallout'
  | 'pricing'
  | 'details'
  | 'photos'
  | 'help'
  | 'booking'
  | 'verification'
  | 'activity'
  | 'owner'
  | 'share'
  | 'confirm'
  | 'safety'

export type TaskDetailSectionPlacement = 'flow' | 'pin' | 'hidden'

export type TaskDetailSectionContext = {
  permissions: TaskDetailPermissions
  quoteCount: number
  pending: boolean
  hasTask: boolean
}

export type TaskDetailSectionRule = {
  id: TaskDetailSectionId
  /** Render in the scroll column when this section is not the mobile pin. */
  showInFlow: (ctx: TaskDetailSectionContext) => boolean
  /** Eligible to occupy the single mobile bottom pin. */
  canPinMobile: (ctx: TaskDetailSectionContext) => boolean
  /**
   * Conflict rank for the mobile pin. Lower wins. `null` = never pins.
   * Unique among pinnable rules so ties are a test failure.
   */
  stickyPriority: number | null
  /** Other pinnable ids that must not win while this rule is eligible. */
  conflictsWith: readonly TaskDetailSectionId[]
}

/** Guest, signed-in non-owner, or worker who can still quote — not assigned. */
export function isVisitorQuotePath(p: TaskDetailPermissions): boolean {
  if (p.isOwner || p.isOrderWorker || !p.isOpen) return false
  if (p.showCompleteWithCode || p.showCustomerCompletionCode) return false
  return p.showQuoteForm || p.showGuestQuoteCta || !p.hasWorkerProfile
}

export function isOwnerSharePath(p: TaskDetailPermissions): boolean {
  return p.isOwner && p.isOpen && !p.showCustomerCompletionCode
}

export function isWorkerOwnerContactPath(p: TaskDetailPermissions): boolean {
  return (
    p.isOrderWorker &&
    (p.showWorkerJobBanner || p.showCompleteWithCode) &&
    !p.showCustomerCompletionCode
  )
}

export function isOwnerConfirmPath(p: TaskDetailPermissions): boolean {
  return p.showCustomerCompletionCode
}

export function showTaskPricingQuoteCta(
  permissions: TaskDetailPermissions,
): boolean {
  return isVisitorQuotePath(permissions)
}

export const TASK_DETAIL_SECTION_RULES: readonly TaskDetailSectionRule[] = [
  {
    id: 'statusCallout',
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'pricing',
    showInFlow: (ctx) => ctx.hasTask || ctx.pending,
    canPinMobile: (ctx) => ctx.hasTask && isVisitorQuotePath(ctx.permissions),
    stickyPriority: 40,
    conflictsWith: ['share', 'owner', 'confirm'],
  },
  {
    id: 'details',
    showInFlow: () => true,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'photos',
    showInFlow: () => true,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'help',
    showInFlow: () => true,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'booking',
    showInFlow: (ctx) =>
      ctx.permissions.isClosed ||
      ctx.permissions.showCustomerCompletionCode ||
      ctx.permissions.showWorkerJobBanner ||
      ctx.permissions.showCompleteWithCode,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'verification',
    showInFlow: (ctx) => ctx.permissions.showCompleteWithCode,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'activity',
    showInFlow: (ctx) => ctx.hasTask,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
  {
    id: 'owner',
    showInFlow: (ctx) =>
      Boolean(ctx.hasTask && !ctx.pending && !ctx.permissions.isOwner),
    canPinMobile: (ctx) =>
      ctx.hasTask && isWorkerOwnerContactPath(ctx.permissions),
    stickyPriority: 20,
    conflictsWith: ['pricing', 'share', 'confirm'],
  },
  {
    id: 'share',
    showInFlow: () => false,
    canPinMobile: (ctx) => ctx.hasTask && isOwnerSharePath(ctx.permissions),
    stickyPriority: 30,
    conflictsWith: ['pricing', 'owner', 'confirm'],
  },
  {
    id: 'confirm',
    showInFlow: () => false,
    canPinMobile: (ctx) => ctx.hasTask && isOwnerConfirmPath(ctx.permissions),
    stickyPriority: 10,
    conflictsWith: ['pricing', 'share', 'owner'],
  },
  {
    id: 'safety',
    showInFlow: (ctx) => ctx.hasTask,
    canPinMobile: () => false,
    stickyPriority: null,
    conflictsWith: [],
  },
]

export function resolveTaskDetailStickySection(
  ctx: TaskDetailSectionContext,
): TaskDetailSectionId | null {
  const eligible = TASK_DETAIL_SECTION_RULES.filter(
    (rule) => rule.canPinMobile(ctx) && rule.stickyPriority != null,
  )
  if (eligible.length === 0) return null
  const ranked = [...eligible].sort(
    (a, b) => (a.stickyPriority ?? 99) - (b.stickyPriority ?? 99),
  )
  return ranked[0]?.id ?? null
}

export function resolveTaskDetailSectionPlacement(
  id: TaskDetailSectionId,
  ctx: TaskDetailSectionContext,
  stickyId: TaskDetailSectionId | null = resolveTaskDetailStickySection(ctx),
): TaskDetailSectionPlacement {
  const rule = TASK_DETAIL_SECTION_RULES.find((item) => item.id === id)
  if (!rule) return 'hidden'
  if (stickyId === id) return 'pin'
  if (rule.showInFlow(ctx)) return 'flow'
  return 'hidden'
}

export function resolveTaskDetailSectionLayout(ctx: TaskDetailSectionContext) {
  const stickySectionId = resolveTaskDetailStickySection(ctx)
  const placement = {} as Record<
    TaskDetailSectionId,
    TaskDetailSectionPlacement
  >
  for (const rule of TASK_DETAIL_SECTION_RULES) {
    placement[rule.id] = resolveTaskDetailSectionPlacement(
      rule.id,
      ctx,
      stickySectionId,
    )
  }
  return { stickySectionId, placement }
}
