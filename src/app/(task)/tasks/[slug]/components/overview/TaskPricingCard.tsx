'use client'

import { useI11n } from '@/i18n/useI11n'
import { Skeleton, Stack } from '@chakra-ui/react'
import { LuCreditCard, LuTag } from 'react-icons/lu'
import bag from '../../i11n.json'

import { Badge, Button, Card, DetailRow, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
} from '../../helpers/taskDetailUtils'
import { TaskDetailPinCard } from '../ui/TaskDetailPinCard'

function PricingQuoteCta({
  href,
  kind,
  compact,
}: {
  href: string
  kind: 'sendQuote' | 'signInToQuote'
  compact?: boolean
}) {
  const t = useI11n(bag)
  const label = kind === 'signInToQuote' ? t.cta.signInToQuote : t.cta.sendQuote
  return (
    <Button
      asChild
      variant="primary"
      size={compact ? 'sm' : undefined}
      w={compact ? undefined : 'full'}
    >
      <Link href={href} _hover={{ textDecoration: 'none' }}>
        {label}
      </Link>
    </Button>
  )
}

type TaskPricingCardProps = {
  compact?: boolean
}

/** Overview pricing card — posted budget, optional quote / continue CTA. */
export function TaskPricingCard({ compact = false }: TaskPricingCardProps) {
  const { task, seed, pending, me, permissions } = useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending) return null

  const budgetLine = task
    ? taskBudgetDisplayLine(
        task,
        permissions.isOwner ? 'owner' : 'visitor',
        me?.id,
      )
    : seed?.priceLabel
  const budgetKind = task ? budgetKindLabel(task.budget?.type) : null
  const paymentMethod = task?.budget?.paymentMethod?.trim()
  const paymentLabel = paymentMethod
    ? formatTaskBudgetPaymentMethodLabel(paymentMethod)
    : null
  const quoteKind = task
    ? getTaskDetailPrimaryCta({
        permissions,
        quoteCount: task.quotes.length,
      })
    : 'none'
  const showQuoteCta =
    Boolean(task) &&
    (quoteKind === 'sendQuote' || quoteKind === 'signInToQuote')
  const quoteHref = task ? `/tasks/${task.id}/quote` : ''

  if (compact) {
    const subtitle = [budgetKind, paymentLabel].filter(Boolean).join(' · ')
    return (
      <TaskDetailPinCard
        title={budgetLine ?? t.details.budget}
        subtitle={subtitle || t.details.budget}
        action={
          showQuoteCta &&
          (quoteKind === 'sendQuote' || quoteKind === 'signInToQuote') ? (
            <PricingQuoteCta href={quoteHref} kind={quoteKind} compact />
          ) : undefined
        }
      />
    )
  }

  const loading = pending && !task

  return (
    <Card
      layout="section"
      heading={t.details.budget}
      metric={budgetLine}
      aria-busy={loading ? true : undefined}
    >
      {loading && !budgetLine ? (
        <Skeleton h="28px" w="42%" borderRadius="md" />
      ) : null}
      {budgetKind ? (
        <DetailRow
          icon={<LuTag />}
          label={t.details.pricing}
          withDivider={Boolean(paymentLabel)}
        >
          <Badge variant="success">{budgetKind}</Badge>
        </DetailRow>
      ) : loading ? (
        <Skeleton h="22px" w="88px" borderRadius="full" />
      ) : null}
      {paymentLabel ? (
        <DetailRow
          icon={<LuCreditCard />}
          label={t.details.payment}
          withDivider={false}
        >
          {paymentLabel}
        </DetailRow>
      ) : null}
      {showQuoteCta &&
      (quoteKind === 'sendQuote' || quoteKind === 'signInToQuote') ? (
        <Stack gap={2}>
          <SafetyNotice variant="inline" />
          <PricingQuoteCta href={quoteHref} kind={quoteKind} />
        </Stack>
      ) : null}
    </Card>
  )
}
