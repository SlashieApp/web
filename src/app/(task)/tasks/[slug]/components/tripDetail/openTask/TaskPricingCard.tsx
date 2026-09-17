'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Heading, Skeleton, Stack, Text } from '@chakra-ui/react'
import { LuCreditCard } from 'react-icons/lu'
import bag from '../../../i11n.json'

import { ViewTransition } from '@/ui/ViewTransition'
import { Badge, Card } from '@ui'

import { taskVtName } from '@/app/(task)/helpers/taskCardHandoff'
import { useTaskDetail } from '../../../context/TaskDetailProvider'
import {
  budgetKindLabel,
  formatTaskBudgetPaymentMethodLabel,
  taskBudgetDisplayLine,
} from '../../../helpers/taskDetailUtils'

/** Overview pricing card — large posted budget, payment as supporting copy. */
export function TaskPricingCard() {
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
            name={named ? taskVtName('price', taskId) : undefined}
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
      </Stack>
    </Card>
  )
}
