import { formatPrice } from '@/utils/price'
import {
  type TaskDatetimeLike,
  formatTaskScheduleLabel,
  workerOnSitePhase,
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

/** Button-only (`preview`) or text plus button (`quoted`). */
export type TaskDetailMainCtaModel = {
  presentation: 'preview' | 'quoted'
  buttonLabel: string
  href?: string
  scrollTo?: { hash: string; scrollId: string }
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
  confirm: string
  complete: string
  customerTitle: string
  workerTitle: string
  completionCode: string
  enterCodeCta: string
  owner: string
  contactTask: string
  emailCustomer: string
  addContact: string
  ownerFallback: string
  beOnSite: string
  flexibleWhen: string
  markCompleted: string
  workerEyebrow: string
}

function quoted(
  buttonLabel: string,
  content: TaskDetailMainCtaContent,
  action: { href?: string; scrollTo?: TaskDetailMainCtaModel['scrollTo'] },
  hideOverviewCards: TaskDetailOverviewCardId[] = [],
): TaskDetailMainCtaModel {
  return {
    presentation: 'quoted',
    buttonLabel,
    href: action.href,
    scrollTo: action.scrollTo,
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
  /** Order snapshot schedule. Flexible and future times stay "be on site". */
  schedule?: TaskDatetimeLike | null
  now?: Date
}): TaskDetailMainCtaModel | null {
  const { task, myQuote, permissions, copy, schedule, now } = input
  if (!task) return null

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

  if (kind === 'confirm') {
    return quoted(
      copy.confirm,
      { eyebrow: copy.customerTitle, value: copy.completionCode },
      {
        scrollTo: { hash: 'task-order', scrollId: 'task-order' },
      },
    )
  }

  if (kind === 'complete') {
    if (workerOnSitePhase(schedule, now) === 'complete') {
      return quoted(
        copy.enterCodeCta,
        { eyebrow: copy.workerEyebrow, value: copy.markCompleted },
        {
          scrollTo: {
            hash: 'worker-job-panel',
            scrollId: 'worker-job-panel',
          },
        },
      )
    }
    const contact = ownerContact(task, copy)
    return quoted(
      contact.label,
      { eyebrow: copy.beOnSite, value: onSiteWhen(schedule, copy) },
      { href: contact.href },
    )
  }

  if (permissions.isOrderWorker && permissions.isOrderActive) {
    const contact = ownerContact(task, copy)
    const name = task.poster?.profile?.name?.trim() || copy.ownerFallback
    return quoted(
      contact.label,
      { eyebrow: copy.owner, value: name },
      { href: contact.href },
      ['owner'],
    )
  }

  return null
}
