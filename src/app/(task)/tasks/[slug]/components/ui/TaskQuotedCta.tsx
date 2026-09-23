'use client'

import { useI11n } from '@/i18n/useI11n'
import { formatPrice } from '@/utils/price'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import bag from '../../i11n.json'
import { TaskDetailSplitCta } from './TaskDetailSplitCta'

/**
 * Quoted-worker main CTA: their pending asking price + Edit quote. Without a
 * known price it reads "Your quote · Sent" instead of a placeholder amount.
 */
export function TaskQuotedCta() {
  const { task, myQuote } = useTaskDetail()
  const t = useI11n(bag)

  if (!task || !myQuote) return null

  const action = { href: `/tasks/${task.id}/quote`, label: t.cta.editQuote }

  if (!myQuote.price) {
    return (
      <TaskDetailSplitCta
        eyebrow={t.cta.yourQuote}
        value={t.cta.quoteSentValue}
        meta={t.cta.awaitingReview}
        fullWidth
        action={action}
      />
    )
  }

  return (
    <TaskDetailSplitCta
      eyebrow={t.cta.quoteSent}
      value={formatPrice(myQuote.price)}
      meta={t.cta.askingPrice}
      fullWidth
      action={action}
    />
  )
}
