'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { LuCreditCard } from 'react-icons/lu'
import bag from '../../../i11n.json'

import { ViewTransition } from '@/ui/ViewTransition'
import { Badge, Button, Card, Link, SafetyNotice } from '@ui'

import { taskVtName } from '@/app/(task)/helpers/taskCardHandoff'
import { useTaskDetail } from '../../../context/TaskDetailProvider'
import { getTaskDetailPrimaryCta } from '../../../helpers/getTaskDetailPrimaryCta'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
} from '../../../helpers/taskDetailUtils'

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
    <Stack gap={2}>
      <SafetyNotice variant="inline" />
      <Button asChild variant="primary" w="full">
        <Link href={href} _hover={{ textDecoration: 'none' }}>
          {label}
        </Link>
      </Button>
    </Stack>
  )
}

type TaskPricingCardProps = {
  /**
   * Pin copy must not share the search→detail price transition name —
   * the in-flow card already owns it.
   */
  sharePriceTransition?: boolean
}

/** Overview pricing card — posted budget, optional quote / continue CTA. */
export function TaskPricingCard({
  sharePriceTransition = true,
}: TaskPricingCardProps = {}) {
  const { task, seed, pending, taskId, me, permissions } = useTaskDetail()
  const t = useI11n(bag)

  if (!task && !pending) return null

  const named = Boolean(task || seed)
  const budgetLine = task
    ? taskBudgetDisplayLine(
        task,
        permissions.isOwner ? 'owner' : 'visitor',
        me?.id,
      )
    : seed?.priceLabel
  const budgetKind = task ? budgetKindLabel(task.budget?.type) : null
  const paymentMethod = task?.budget?.paymentMethod?.trim()
  const quoteKind = task
    ? getTaskDetailPrimaryCta({
        permissions,
        quoteCount: task.quotes.length,
      })
    : 'none'
  return (
    <Card layout="section" aria-busy={pending && !task ? true : undefined}>
      <Stack gap={4}>
        <Text
          fontSize="xs"
          fontWeight={600}
          color="text.muted"
          letterSpacing="0.06em"
          textTransform="uppercase"
        >
          {t.details.budget}
        </Text>
        <HStack align="baseline" gap={3} flexWrap="wrap">
          <ViewTransition
            name={
              sharePriceTransition && named
                ? taskVtName('price', taskId)
                : undefined
            }
            share="vt-text"
            default="none"
          >
            {budgetLine ? (
              <Heading
                as="p"
                textStyle="display-xl"
                fontFamily="heading"
                color="text.default"
                m={0}
              >
                {budgetLine}
              </Heading>
            ) : (
              <Skeleton h="48px" w="42%" borderRadius="md" />
            )}
          </ViewTransition>
          {budgetKind ? (
            <Badge variant="success">{budgetKind}</Badge>
          ) : pending && !task ? (
            <Skeleton h="22px" w="88px" borderRadius="full" />
          ) : null}
        </HStack>
        {paymentMethod ? (
          <HStack gap={2} align="center" color="text.muted">
            <Box as="span" fontSize="lg" lineHeight="1" flexShrink={0}>
              <LuCreditCard />
            </Box>
            <Text fontSize="sm" lineHeight="short">
              <Box as="span" fontWeight={600} color="text.default">
                {t.details.payment}
              </Box>
              {` · ${formatTaskBudgetPaymentMethodLabel(paymentMethod)}`}
            </Text>
          </HStack>
        ) : null}
        {task &&
        (quoteKind === 'sendQuote' || quoteKind === 'signInToQuote') ? (
          <PricingQuoteCta href={`/tasks/${task.id}/quote`} kind={quoteKind} />
        ) : null}
      </Stack>
    </Card>
  )
}
