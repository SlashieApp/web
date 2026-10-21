import { ThreadAttentionKind } from '@codegen/schema'

import type { TaskDetailViewName } from '@/app/(task)/tasks/[slug]/views/types'

import type { BottomPinViewInput, BottomPinViewName } from './types'

/**
 * Each ask, the task detail views that show it, and the bottom pin for it.
 * Compare quotes has none: the quote cards in the timeline handle it.
 */
const BOTTOM_PIN_BY_ASK: Record<
  Exclude<ThreadAttentionKind, ThreadAttentionKind.CompareQuotes>,
  { views: readonly TaskDetailViewName[]; pin: BottomPinViewName }
> = {
  [ThreadAttentionKind.AnswerReschedule]: {
    views: ['owner.booked.rescheduleByThem', 'worker.booked.rescheduleByThem'],
    pin: 'bottomPin.reschedule',
  },
  [ThreadAttentionKind.AnswerCancel]: {
    views: ['owner.booked.cancelByThem', 'worker.booked.cancelByThem'],
    pin: 'bottomPin.cancel',
  },
  [ThreadAttentionKind.MarkDone]: {
    views: ['owner.booked.ready', 'worker.booked.ready'],
    pin: 'bottomPin.markDone',
  },
  [ThreadAttentionKind.ConfirmDone]: {
    views: ['owner.booked.theyMarkedDone', 'worker.booked.theyMarkedDone'],
    pin: 'bottomPin.confirmDone',
  },
  [ThreadAttentionKind.AnswerFailed]: {
    views: ['owner.booked.theyMarkedFailed', 'worker.booked.theyMarkedFailed'],
    pin: 'bottomPin.answerFailed',
  },
  [ThreadAttentionKind.Conflict]: {
    views: [
      'owner.conflict.iMarkedDone',
      'owner.conflict.iMarkedFailed',
      'worker.conflict.iMarkedDone',
      'worker.conflict.iMarkedFailed',
    ],
    pin: 'bottomPin.conflict',
  },
}

/**
 * The one thing that needs the viewer now, above the composer. Shown only
 * when the API's `thread.attention` and task detail's view agree, so it hides
 * as soon as the viewer answers (task detail updates first) and never shows
 * controls task detail wouldn't.
 */
export function getBottomPinView({
  attention,
  view,
}: BottomPinViewInput): BottomPinViewName | null {
  if (!attention || attention.kind === ThreadAttentionKind.CompareQuotes) {
    return null
  }
  const ask = BOTTOM_PIN_BY_ASK[attention.kind]
  return ask.views.includes(view) ? ask.pin : null
}
