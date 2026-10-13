'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Box, Grid, Skeleton, Stack, Text, Wrap } from '@chakra-ui/react'
import { LuCreditCard } from 'react-icons/lu'
import bag from '../../i11n.json'

import { formatPrice } from '@/utils/price'
import { Badge, Button, Card, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  getTaskDetailPrimaryCta,
  taskQuoteCtaHref,
} from '../../helpers/getTaskDetailPrimaryCta'
import { quoteBudgetComparison } from '../../helpers/quoteBudgetComparison'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
} from '../../helpers/taskDetailUtils'
import { TaskDetailSplitCta } from '../ui/TaskDetailSplitCta'

function PricingQuoteCta({
  href,
  label,
}: {
  href: string
  label: string
}) {
  return (
    <Button asChild variant="primary" w="full">
      <Link href={href} _hover={{ textDecoration: 'none' }}>
        {label}
      </Link>
    </Button>
  )
}

/** One side of the budget-vs-quote comparison. */
function PriceColumn({
  label,
  value,
  detail,
  detailColor = 'text.muted',
  highlight = false,
}: {
  label: string
  value: string | undefined
  detail?: string
  detailColor?: string
  highlight?: boolean
}) {
  return (
    <Stack
      gap={1}
      minW={0}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={highlight ? 'status.success.solid' : 'border.default'}
      bg={highlight ? 'status.success.soft' : 'bg.subtle'}
    >
      <Text
        fontSize="xs"
        fontWeight={500}
        color="text.muted"
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text
        fontSize="xl"
        fontWeight={700}
        color="text.default"
        lineHeight="short"
      >
        {value ?? '—'}
      </Text>
      {detail ? (
        <Box fontSize="sm" color={detailColor} lineHeight="short">
          {detail}
        </Box>
      ) : null}
    </Stack>
  )
}

type TaskPricingCardProps = {
  compact?: boolean
  /** Web main CTA — the two-part budget + quote control, not the full card. */
  rail?: boolean
}

/** Pricing hero: posted budget, type and payment, quote count, quote CTA. */
export function TaskPricingCard({
  compact = false,
  rail = false,
}: TaskPricingCardProps) {
  const { task, seed, pending, me, permissions, myQuote } = useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending) return null

  // Non-owners always see the posted budget; a known own quote sits beside it.
  const budgetLine = task
    ? permissions.isOwner
      ? taskBudgetDisplayLine(task, 'owner', me?.id)
      : taskBudgetDisplayLine(task, 'visitor')
    : seed?.priceLabel
  const askingPrice =
    !permissions.isOwner && myQuote?.price ? formatPrice(myQuote.price) : null
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
  // Send quote, or Become a worker for guests and non-workers (FE-207).
  const quoteCta =
    task && (quoteKind === 'sendQuote' || quoteKind === 'becomeWorker')
      ? {
          href: taskQuoteCtaHref(quoteKind, task.id, permissions),
          label:
            quoteKind === 'becomeWorker' ? t.cta.becomeWorker : t.cta.sendQuote,
        }
      : undefined

  const loading = pending && !task

  if (compact || rail) {
    const meta = [budgetKind, paymentLabel].filter(Boolean).join(' · ')
    return (
      <TaskDetailSplitCta
        eyebrow={t.details.budget}
        value={
          budgetLine ??
          (loading ? (
            <Skeleton as="span" display="block" h="24px" w="64px" />
          ) : (
            '—'
          ))
        }
        meta={meta || undefined}
        fullWidth
        action={quoteCta}
      />
    )
  }

  if (askingPrice && myQuote?.price) {
    const comparison =
      task?.budget?.amount != null
        ? quoteBudgetComparison(task.budget.amount, myQuote.price.amount)
        : null
    const comparisonCopy = !comparison
      ? null
      : comparison.kind === 'match'
        ? { text: t.cta.matchesBudget, color: 'text.muted' }
        : {
            text: formatMessage(
              comparison.kind === 'under'
                ? t.cta.underBudget
                : t.cta.overBudget,
              {
                amount: formatPrice({
                  amount: comparison.difference,
                  currency: myQuote.price.currency,
                }),
              },
            ),
            color:
              comparison.kind === 'under'
                ? 'status.success.fg'
                : 'status.warning.fg',
          }

    return (
      <Card {...TASK_DETAIL_SECTION_CARD} eyebrow={t.cta.priceComparison}>
        <Grid templateColumns="repeat(2, minmax(0, 1fr))" gap={3}>
          <PriceColumn
            label={t.details.budget}
            value={budgetLine}
            detail={[budgetKind, paymentLabel].filter(Boolean).join(' · ')}
          />
          <PriceColumn
            label={t.cta.askingPrice}
            value={askingPrice}
            detail={comparisonCopy?.text}
            detailColor={comparisonCopy?.color}
            highlight
          />
        </Grid>
      </Card>
    )
  }

  const quoteCount = task?.quotes.length ?? 0
  const quoteCountLabel =
    task && permissions.isOpen && quoteCount > 0
      ? formatMessage(
          quoteCount === 1 ? t.details.quoteCountOne : t.details.quoteCountMany,
          { count: quoteCount },
        )
      : null

  // FE-258: big price, type and payment as badges, on the white card.
  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={t.details.budget}
      aria-busy={loading ? true : undefined}
    >
      {budgetLine ? (
        <Text
          fontSize={{ base: '4xl', lg: '5xl' }}
          fontWeight={800}
          lineHeight="1"
          letterSpacing="-0.02em"
          color="status.success.fg"
          fontVariantNumeric="tabular-nums"
        >
          {budgetLine}
        </Text>
      ) : loading ? (
        <Skeleton h="40px" w="42%" borderRadius="md" />
      ) : null}
      {budgetKind || paymentLabel ? (
        <Wrap gap={1.5}>
          {budgetKind ? (
            <Badge variant="brand" shape="pill">
              {budgetKind}
            </Badge>
          ) : null}
          {paymentLabel ? (
            <Badge variant="neutral" shape="pill">
              <LuCreditCard aria-hidden />
              {paymentLabel}
            </Badge>
          ) : null}
        </Wrap>
      ) : loading ? (
        <Skeleton h="22px" w="88px" borderRadius="full" />
      ) : null}
      {quoteCountLabel ? (
        <Text fontSize="sm" color="text.muted" fontWeight={500}>
          {quoteCountLabel}
        </Text>
      ) : null}
      {quoteCta ? (
        <Stack gap={2}>
          <SafetyNotice variant="inline" />
          <PricingQuoteCta href={quoteCta.href} label={quoteCta.label} />
        </Stack>
      ) : null}
    </Card>
  )
}
