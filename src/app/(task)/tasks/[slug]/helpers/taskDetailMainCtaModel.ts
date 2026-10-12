import { publicUserPath } from '@/app/user/[id]/helpers/publicUserHelpers'
import type { OrderCloseView } from '@/utils/orderHelpers'
import { formatPrice } from '@/utils/price'
import {
  type TaskDatetimeLike,
  formatTaskScheduleLabel,
  isAcceptedQuoteStatus,
} from '@/utils/taskJobSchedule'
import { TaskDateTimeType } from '@codegen/schema'

import type { TaskDetailPermissions } from './getTaskDetailPermissions'
import { getTaskDetailPrimaryCta } from './getTaskDetailPrimaryCta'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
} from './taskDetailUtils'
import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskDetailOverviewCardId = 'pricing' | 'owner'

export type TaskDetailMainCtaContent = {
  eyebrow: string
  value: string
  meta?: string
}

/** Completed-job primary action. Review until this viewer submits, then the receipt. */
export type TaskDetailCompletedIntent = 'review' | 'receipt'

/**
 * Button-only (`preview`), text plus button (`quoted`), or the mutual-close
 * control (`close`: slide Done plus "something went wrong").
 */
export type TaskDetailMainCtaModel = {
  presentation: 'preview' | 'quoted' | 'close'
  buttonLabel: string
  href?: string
  scrollTo?: { hash: string; scrollId: string }
  /** In-place action. Takes precedence over `href`. */
  intent?: TaskDetailCompletedIntent
  content?: TaskDetailMainCtaContent
  /** Overview cards that repeat this CTA, so they stay hidden. */
  hideOverviewCards: TaskDetailOverviewCardId[]
}

export type TaskDetailMainCtaCopy = {
  preview: string
  sendQuote: string
  signInToQuote: string
  editQuote: string
  quoteSent: string
  yourQuote: string
  quoteSentValue: string
  askingPrice: string
  awaitingReview: string
  budget: string
  customerTitle: string
  workerTitle: string
  closeEyebrow: string
  slideDone: string
  owner: string
  contactTask: string
  emailCustomer: string
  addContact: string
  ownerFallback: string
  beOnSite: string
  flexibleWhen: string
  workerEyebrow: string
  contactWorker: string
  yourWorker: string
  workerFallback: string
  review: string
  getReceipt: string
  completed: string
}

export type TaskDetailSettledCta = {
  role: 'owner' | 'worker'
  agreedPrice: string
  orderId: string
}

function quoted(
  buttonLabel: string,
  content: TaskDetailMainCtaContent,
  action: {
    href?: string
    scrollTo?: TaskDetailMainCtaModel['scrollTo']
    intent?: TaskDetailMainCtaModel['intent']
  },
  hideOverviewCards: TaskDetailOverviewCardId[] = [],
): TaskDetailMainCtaModel {
  return {
    presentation: 'quoted',
    buttonLabel,
    href: action.intent ? undefined : action.href,
    scrollTo: action.scrollTo,
    intent: action.intent,
    content,
    hideOverviewCards,
  }
}

function budgetContent(
  task: TaskDetailRecord,
  copy: TaskDetailMainCtaCopy,
): TaskDetailMainCtaContent {
  const kind = budgetKindLabel(task.budget?.type)
  const payment = task.budget?.paymentMethod?.trim()
  const paymentLabel = payment
    ? formatTaskBudgetPaymentMethodLabel(payment)
    : null
  return {
    eyebrow: copy.budget,
    value: taskBudgetDisplayLine(task, 'visitor'),
    meta: [kind, paymentLabel].filter(Boolean).join(' · ') || undefined,
  }
}

function onSiteWhen(
  datetime: TaskDatetimeLike | null | undefined,
  copy: TaskDetailMainCtaCopy,
): string {
  if (!datetime || datetime.type === TaskDateTimeType.Flexible) {
    return copy.flexibleWhen
  }
  return formatTaskScheduleLabel(datetime) ?? copy.flexibleWhen
}

type WorkerProfileFields = {
  name?: string | null
  contactNumber?: string | null
}

function acceptedQuote(
  task: TaskDetailRecord,
  quoteId?: string | null,
): TaskDetailRecord['quotes'][number] | null {
  if (quoteId) {
    const match = task.quotes.find((quote) => quote.id === quoteId)
    if (match) return match
  }
  return (
    task.quotes.find((quote) => isAcceptedQuoteStatus(quote.status)) ?? null
  )
}

/** Booked worker the customer contacts, and later reviews. */
function workerParty(
  task: TaskDetailRecord,
  copy: TaskDetailMainCtaCopy,
  quoteId?: string | null,
): { name: string; contactHref: string; reviewHref: string } {
  const worker = acceptedQuote(task, quoteId)?.worker
  const profile = (worker?.profile ?? null) as WorkerProfileFields | null
  const name = profile?.name?.trim() || copy.workerFallback
  const tel = profile?.contactNumber?.trim() || ''
  const userHref = worker?.id ? publicUserPath(worker.id, task.id) : null
  const reviewHref = userHref ?? '/workers'
  const contactHref = tel ? `tel:${tel.replace(/\s/g, '')}` : reviewHref
  return { name, contactHref, reviewHref }
}

function ownerContact(
  task: TaskDetailRecord,
  copy: TaskDetailMainCtaCopy,
): { href: string; label: string } {
  const tel = task.poster?.profile?.contactNumber?.trim()
  const email = task.poster?.email?.trim()
  if (tel) {
    return { href: `tel:${tel.replace(/\s/g, '')}`, label: copy.contactTask }
  }
  if (email) return { href: `mailto:${email}`, label: copy.emailCustomer }
  return { href: '/account', label: copy.addContact }
}

/**
 * What the main CTA shows. Button-only uses the preview layout. Text plus a
 * button uses the quoted layout. Overview cards that repeat it are listed
 * so the page can hide them.
 */
export function buildTaskDetailMainCta(input: {
  task: TaskDetailRecord | null
  myQuote: TaskDetailRecord['quotes'][number] | null
  permissions: TaskDetailPermissions
  copy: TaskDetailMainCtaCopy
  /** Booked start as an exact schedule (see `orderBookedDatetime`). */
  schedule?: TaskDatetimeLike | null
  /** Done/Failed state; the close control shows once the viewer can act. */
  close?: OrderCloseView | null
  now?: Date
  /** Accepted quote behind the live or closed order. */
  acceptedQuoteId?: string | null
  /**
   * Party on a COMPLETED order. Drives Review, then Get receipt.
   * The receipt does not wait for the other party.
   */
  settled?: TaskDetailSettledCta | null
  viewerHasSubmittedReview?: boolean
}): TaskDetailMainCtaModel | null {
  const {
    task,
    myQuote,
    permissions,
    copy,
    schedule,
    close,
    acceptedQuoteId,
    settled,
  } = input
  const viewerHasSubmittedReview = input.viewerHasSubmittedReview === true
  if (!task) return null

  if (settled && !permissions.isCancelled) {
    const party = workerParty(task, copy, acceptedQuoteId)
    const value = settled.role === 'owner' ? party.name : settled.agreedPrice
    const reviewHref = `/tasks/${task.id}/review?orderId=${encodeURIComponent(settled.orderId)}`
    if (viewerHasSubmittedReview) {
      return quoted(
        copy.getReceipt,
        { eyebrow: copy.completed, value },
        { intent: 'receipt' },
        ['pricing'],
      )
    }
    return quoted(
      copy.review,
      { eyebrow: copy.completed, value },
      { href: reviewHref },
      ['pricing'],
    )
  }

  const kind = getTaskDetailPrimaryCta({
    permissions,
    quoteCount: task.quotes.length,
  })

  if (kind === 'preview' || kind === 'viewQuotes') {
    return {
      presentation: 'preview',
      buttonLabel: copy.preview,
      href: `/tasks/${task.id}/preview`,
      hideOverviewCards: [],
    }
  }

  if (kind === 'editQuote') {
    const price = myQuote?.price
    return quoted(
      copy.editQuote,
      price
        ? {
            eyebrow: copy.quoteSent,
            value: formatPrice(price),
            meta: copy.askingPrice,
          }
        : {
            eyebrow: copy.yourQuote,
            value: copy.quoteSentValue,
            meta: copy.awaitingReview,
          },
      { href: `/tasks/${task.id}/quote` },
    )
  }

  if (kind === 'sendQuote' || kind === 'signInToQuote') {
    return quoted(
      kind === 'signInToQuote' ? copy.signInToQuote : copy.sendQuote,
      budgetContent(task, copy),
      { href: `/tasks/${task.id}/quote` },
      ['pricing'],
    )
  }

  const booked = kind === 'workerBooked' || kind === 'ownerBooked'
  if (booked && close?.canClose && !close.mine) {
    return {
      presentation: 'close',
      buttonLabel: copy.slideDone,
      content: {
        eyebrow: copy.closeEyebrow,
        value: onSiteWhen(schedule, copy),
      },
      hideOverviewCards:
        kind === 'workerBooked' ? ['pricing', 'owner'] : ['pricing'],
    }
  }

  if (kind === 'ownerBooked') {
    const party = workerParty(task, copy, acceptedQuoteId)
    return quoted(
      copy.contactWorker,
      { eyebrow: copy.yourWorker, value: party.name },
      { href: party.contactHref },
      ['pricing'],
    )
  }

  if (kind === 'workerBooked') {
    const contact = ownerContact(task, copy)
    return quoted(
      contact.label,
      { eyebrow: copy.beOnSite, value: onSiteWhen(schedule, copy) },
      { href: contact.href },
      ['pricing', 'owner'],
    )
  }

  return null
}
