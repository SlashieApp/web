'use client'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Box, Grid, HStack, Skeleton, Stack, Text } from '@chakra-ui/react'
import { LuCreditCard, LuTag } from 'react-icons/lu'
import bag from '../../i11n.json'

import { formatOrderAgreedPrice } from '@/utils/orderHelpers'
import { formatPrice } from '@/utils/price'
import { Badge, Button, Card, DetailRow, Link, SafetyNotice } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../helpers/getTaskDetailPrimaryCta'
import { quoteBudgetComparison } from '../../helpers/quoteBudgetComparison'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
} from '../../helpers/taskDetailUtils'
import { TaskDetailSplitCta } from '../ui/TaskDetailSplitCta'
import { WorkerOrderVerificationPanel } from './WorkerOrderVerificationPanel'

function PricingQuoteCta({
  href,
  kind,
}: {
  href: string
  kind: 'sendQuote' | 'signInToQuote'
}) {
  const t = useI11n(bag)
  const label = kind === 'signInToQuote' ? t.cta.signInToQuote : t.cta.sendQuote
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

/** Overview pricing card — posted budget, optional quote / continue CTA. */
export function TaskPricingCard({
  compact = false,
  rail = false,
}: TaskPricingCardProps) {
  const { task, seed, pending, me, permissions, myQuote, myOrder } =
    useTaskDetail()
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
  const showQuoteCta =
    Boolean(task) &&
    (quoteKind === 'sendQuote' || quoteKind === 'signInToQuote')
  const quoteHref = task ? `/tasks/${task.id}/quote` : ''

  const loading = pending && !task
  const confirmedJob = Boolean(
    task && myOrder && permissions.showCompleteWithCode,
  )

  if (confirmedJob && myOrder) {
    const dealtPrice = myOrder.agreedPrice
      ? formatOrderAgreedPrice(myOrder)
      : myQuote?.price
        ? formatPrice(myQuote.price)
        : budgetLine
    return (
      <Card
        {...TASK_DETAIL_SECTION_CARD}
        id="worker-job-panel"
        scrollMarginTop="140px"
        eyebrow={t.quotes.agreedPrice}
        metric={dealtPrice}
      >
        {paymentLabel ? (
          <DetailRow
            icon={<LuCreditCard />}
            label={t.details.payment}
            withDivider={false}
          >
            {paymentLabel}
          </DetailRow>
        ) : null}
        <WorkerOrderVerificationPanel embedded />
      </Card>
    )
  }

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
        action={
          showQuoteCta &&
          (quoteKind === 'sendQuote' || quoteKind === 'signInToQuote')
            ? {
                href: quoteHref,
                label:
                  quoteKind === 'signInToQuote'
                    ? t.cta.signInToQuote
                    : t.cta.sendQuote,
              }
            : undefined
        }
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

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      eyebrow={t.details.budget}
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
