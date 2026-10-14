import { FlashKind, QuoteStatus, ThreadItemType } from '@codegen/schema'

type ItemLike = {
  type: ThreadItemType | string
  flashKind?: FlashKind | string | null
  taskId?: string | null
  orderId?: string | null
  title?: string | null
  body: string
}

/**
 * Inbox / timeline time: clock time today, "Yesterday", the weekday within
 * a week, otherwise the date.
 */
export function formatMessageTime(
  iso: string | null | undefined,
  locale: string,
  copy: { yesterday: string },
  now = new Date(),
): string {
  if (!iso) return ''
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  const day = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const days = Math.round((day(now) - day(at)) / 86_400_000)
  if (days <= 0) {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(at)
  }
  if (days === 1) return copy.yesterday
  if (days < 7) {
    return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(at)
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
  }).format(at)
}

/** One-line inbox preview: the flash title, or the message text. */
export function threadPreviewText(item: ItemLike | null | undefined): string {
  if (!item) return ''
  if (item.type === ThreadItemType.Flash && item.title?.trim()) {
    return item.title.trim()
  }
  return item.body.replace(/\s+/g, ' ').trim()
}

export type FlashAction = { kind: 'review' | 'task'; href: string }

/** Where a flash card links: the review for review prompts, else the task. */
export function flashAction(item: ItemLike): FlashAction | null {
  if (item.type !== ThreadItemType.Flash || !item.taskId) return null
  const task = encodeURIComponent(item.taskId)
  if (item.flashKind === FlashKind.ReviewPrompt) {
    const order = item.orderId
      ? `?orderId=${encodeURIComponent(item.orderId)}`
      : ''
    return { kind: 'review', href: `/tasks/${task}/review${order}` }
  }
  return { kind: 'task', href: `/tasks/${task}` }
}

/** A worker who was not picked sees the not-selected flash in the thread. */
export function wasNotSelected(items: readonly ItemLike[]): boolean {
  return items.some((item) => item.flashKind === FlashKind.QuoteNotSelected)
}

export type QuoteFlashStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'notSelected'
  | 'withdrawn'
  | 'replaced'

/** Where a flash's quote stands now (BE-81 resolves `status` live). */
export function quoteFlashStatus(status: QuoteStatus): QuoteFlashStatus {
  switch (status) {
    case QuoteStatus.Accepted:
      return 'accepted'
    case QuoteStatus.Declined:
    case QuoteStatus.Rejected:
      return 'declined'
    case QuoteStatus.NotSelected:
      return 'notSelected'
    case QuoteStatus.Withdrawn:
      return 'withdrawn'
    case QuoteStatus.Expired:
      return 'replaced'
    case QuoteStatus.Pending:
      return 'pending'
  }
}

export type ThreadMenuAction =
  | 'withdrawQuote'
  | 'cancelTask'
  | 'reschedule'
  | 'cancelBooking'

/**
 * Quote / booking actions the thread menu offers (FE-272). Worker before
 * acceptance: withdraw the quote; owner before acceptance: cancel the task.
 * Either party once booked: reschedule or cancel, when task detail allows it.
 */
export function threadMenuActions(input: {
  hasPendingQuote: boolean
  canCancelTask: boolean
  booking: { canReschedule: boolean; canCancel: boolean } | null
}): ThreadMenuAction[] {
  const actions: ThreadMenuAction[] = []
  if (input.hasPendingQuote) actions.push('withdrawQuote')
  if (input.canCancelTask) actions.push('cancelTask')
  if (input.booking?.canReschedule) actions.push('reschedule')
  if (input.booking?.canCancel) actions.push('cancelBooking')
  return actions
}
