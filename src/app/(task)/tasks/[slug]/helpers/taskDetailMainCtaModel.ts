import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import {
  type OrderItem,
  formatOrderAgreedPrice,
  orderBookedDatetime,
} from '@/utils/orderHelpers'
import { formatPrice } from '@/utils/price'
import { repostTaskHref } from '@/utils/taskHandoff'
import { formatTaskScheduleLabel } from '@/utils/taskJobSchedule'

import type bag from '../i11n.json'
import type { TaskDetailPrimaryAction } from '../views'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  orderCounterpart,
  taskBudgetDisplayLine,
} from './taskDetailUtils'
import type { TaskDetailRecord } from './taskDetailUtils'

type TaskDetailCopy = (typeof bag)['en']

export type TaskDetailMainCtaContent = {
  eyebrow: string
  value: string
  meta?: string
}

/**
 * `button`: the action alone. `quoted`: text joined to the action. `close`:
 * slide Done plus "something went wrong".
 */
export type TaskDetailMainCtaModel = {
  action: TaskDetailPrimaryAction
  presentation: 'button' | 'quoted' | 'close'
  buttonLabel: string
  /** Where it goes. None for Reopen task, which asks first in a dialog. */
  href?: string
  /** Download the receipt in place (completed job, once reviewed). */
  receipt?: boolean
  content?: TaskDetailMainCtaContent
}

function budgetContent(
  task: TaskDetailRecord,
  copy: TaskDetailCopy,
): TaskDetailMainCtaContent {
  const payment = task.budget?.paymentMethod?.trim()
  return {
    eyebrow: copy.details.budget,
    value: taskBudgetDisplayLine(task, 'visitor'),
    meta:
      [
        budgetKindLabel(task.budget?.type),
        payment ? formatTaskBudgetPaymentMethodLabel(payment) : null,
      ]
        .filter(Boolean)
        .join(' · ') || undefined,
  }
}

/** Contact details on the booked CTA: phone and/or email. */
function contactLine(
  ...parts: (string | null | undefined)[]
): string | undefined {
  return parts.filter(Boolean).join(' · ') || undefined
}

/** The page's main button for the view's primary action. */
export function buildTaskDetailMainCta(input: {
  action: TaskDetailPrimaryAction | null
  task: TaskDetailRecord
  order: OrderItem | null
  myQuote: TaskDetailRecord['quotes'][number] | null
  isOwner: boolean
  viewerHasSubmittedReview: boolean
  /** The task's Messages thread, or the inbox when it is not known yet. */
  messageHref: string
  copy: TaskDetailCopy
}): TaskDetailMainCtaModel | null {
  const { action, task, order, myQuote, isOwner, copy } = input
  if (!action) return null
  const taskPath = `/tasks/${task.id}`
  const button = (
    buttonLabel: string,
    href: string,
  ): TaskDetailMainCtaModel => ({
    action,
    presentation: 'button',
    buttonLabel,
    href,
  })
  const quoted = (
    buttonLabel: string,
    content: TaskDetailMainCtaContent,
    href?: string,
  ): TaskDetailMainCtaModel => ({
    action,
    presentation: 'quoted',
    buttonLabel,
    content,
    href,
    receipt: href ? undefined : true,
  })
  const party = order ? orderCounterpart(task, order, isOwner, copy) : null

  switch (action) {
    case 'preview':
      return button(copy.cta.preview, `${taskPath}/preview`)
    case 'signInToQuote':
      return button(
        copy.cta.signInToQuote,
        `/login?next=${encodeURIComponent(`${taskPath}/quote`)}`,
      )
    case 'repost':
      return button(copy.actions.repostTask, repostTaskHref(task.id))
    case 'reopen':
      return { action, presentation: 'button', buttonLabel: copy.reopen.action }
    case 'browseTasks':
      return button(copy.cta.browseTasks, '/search')
    case 'sendQuote':
      return quoted(
        copy.cta.sendQuote,
        budgetContent(task, copy),
        `${taskPath}/quote`,
      )
    case 'becomeWorker': {
      const budget = budgetContent(task, copy)
      return quoted(
        copy.cta.becomeWorker,
        task.budget ? { ...budget, eyebrow: copy.cta.youCanEarn } : budget,
        workerSetupHref(taskPath),
      )
    }
    case 'editQuote':
      return quoted(
        copy.cta.editQuote,
        myQuote?.price
          ? {
              eyebrow: copy.cta.quoteSent,
              value: formatPrice(myQuote.price),
              meta: copy.cta.askingPrice,
            }
          : {
              eyebrow: copy.cta.yourQuote,
              value: copy.cta.quoteSentValue,
              meta: copy.cta.awaitingReview,
            },
        `${taskPath}/quote`,
      )
    case 'markDone': {
      const booked = order ? orderBookedDatetime(order) : null
      return {
        action,
        presentation: 'close',
        buttonLabel: copy.close.slideDone,
        content: {
          eyebrow: copy.close.eyebrowReady,
          value:
            (booked && formatTaskScheduleLabel(booked)) ||
            copy.cta.flexibleWhen,
        },
      }
    }
    // FE-271: the other party's contact details; the button opens Messages.
    case 'message':
      return quoted(
        copy.cta.message,
        {
          eyebrow: isOwner ? copy.booking.yourWorker : copy.cta.yourCustomer,
          value: party?.name ?? '',
          meta: contactLine(party?.phone, party?.email),
        },
        input.messageHref,
      )
    // Review until this viewer submits, then the receipt (it doesn't wait
    // for the other party).
    case 'review': {
      if (!order) return null
      const content = {
        eyebrow: copy.cta.completed,
        value: isOwner && party ? party.name : formatOrderAgreedPrice(order),
      }
      return input.viewerHasSubmittedReview
        ? quoted(copy.cta.getReceipt, content)
        : quoted(
            copy.cta.review,
            content,
            `${taskPath}/review?orderId=${encodeURIComponent(order.id)}`,
          )
    }
  }
}
