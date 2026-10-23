import { FlashKind, QuoteStatus, ThreadItemType } from '@codegen/schema'

type ItemLike = {
  type: ThreadItemType | string
  flashKind?: FlashKind | string | null
  taskId?: string | null
  orderId?: string | null
  title?: string | null
  body: string
}

/** Clock time, e.g. 09:42 (the timeline's day dividers carry the date). */
export function clockTime(iso: string, locale: string): string {
  const at = new Date(iso)
  if (Number.isNaN(at.getTime())) return ''
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(at)
}

/**
 * Inbox time: clock time today, "Yesterday", the weekday within
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
  if (days <= 0) return clockTime(iso, locale)
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

type SlotLike = { id: string; start: string; end?: string | null }

/**
 * The booked slot on a "Quote accepted" line, when the flash's own quote
 * says it: its only proposed time, or else the proposed time the viewer's
 * booking (`order`) still starts at. Null when it can't tell (the booking is
 * for another quote, or moved since), so the line never shows a wrong time.
 */
export function flashSlot<Slot extends SlotLike>(
  item: {
    flashKind?: FlashKind | string | null
    quote?: { id: string; proposedSlots: readonly Slot[] } | null
  },
  order: { quoteId: string; bookedStart: string } | null | undefined,
): Slot | null {
  const quote = item.quote
  if (item.flashKind !== FlashKind.QuoteAccepted || !quote) return null
  const slots = quote.proposedSlots
  if (slots.length === 1) return slots[0] ?? null
  if (order?.quoteId !== quote.id) return null
  const booked = Date.parse(order.bookedStart)
  return slots.find((slot) => Date.parse(slot.start) === booked) ?? null
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
 * None while the task or booking is frozen by a suspension: the API refuses
 * them all (BE-108). Report and Block stay.
 */
export function threadMenuActions(input: {
  hasPendingQuote: boolean
  canCancelTask: boolean
  booking: { canReschedule: boolean; canCancel: boolean } | null
  frozen?: boolean
}): ThreadMenuAction[] {
  const actions: ThreadMenuAction[] = []
  if (input.frozen) return actions
  if (input.hasPendingQuote) actions.push('withdrawQuote')
  if (input.canCancelTask) actions.push('cancelTask')
  if (input.booking?.canReschedule) actions.push('reschedule')
  if (input.booking?.canCancel) actions.push('cancelBooking')
  return actions
}
