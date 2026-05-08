'use client'

import { Box, Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { useMemo } from 'react'

import { Badge, SectionCard } from '@ui'

import {
  formatDate,
  formatPounds,
  isQuoteAwarded,
  isTaskCompleted,
  quotePricePence,
  taskBudgetPence,
} from '@/utils/dashboardHelpers'

import { useAccountTasks } from '../helpers/useAccountTasks'

/**
 * Reference-only earnings log. Slashie does not handle payouts; this page only
 * tallies historical task activity for your records.
 */
export default function EarningsPage() {
  const { loading, errorMessage, sentQuotes, completedPostedTasks } =
    useAccountTasks()

  const completedAsWorker = useMemo(
    () =>
      sentQuotes.filter(
        ({ task, quote }) =>
          isTaskCompleted(task.status) && isQuoteAwarded(quote.status),
      ),
    [sentQuotes],
  )

  const totalAwardedPence = useMemo(
    () =>
      completedAsWorker.reduce(
        (sum, { quote }) => sum + quotePricePence(quote),
        0,
      ),
    [completedAsWorker],
  )

  const totalSpendPence = useMemo(
    () => completedPostedTasks.reduce((sum, t) => sum + taskBudgetPence(t), 0),
    [completedPostedTasks],
  )

  return (
    <Stack gap={6}>
      <Stack gap={2}>
        <Heading size="xl">Earnings</Heading>
        <Text color="formLabelMuted">
          Historical completed work, summarised. Reference only — Slashie does
          not handle payments between customers and workers.
        </Text>
      </Stack>

      {errorMessage ? (
        <Text color="red.500" fontSize="sm">
          {errorMessage}
        </Text>
      ) : null}

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2,1fr)' }} gap={4}>
        <SectionCard p={5}>
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="formLabelMuted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              Completed as worker
            </Text>
            <Heading size="lg">
              {loading ? '…' : formatPounds(totalAwardedPence)}
            </Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Sum of awarded quote values on tasks marked completed.
            </Text>
          </Stack>
        </SectionCard>
        <SectionCard p={5}>
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="formLabelMuted"
              letterSpacing="0.06em"
              textTransform="uppercase"
            >
              Spent as customer
            </Text>
            <Heading size="lg">
              {loading ? '…' : formatPounds(totalSpendPence)}
            </Heading>
            <Text fontSize="sm" color="formLabelMuted">
              Sum of budgets on tasks you posted that have been completed.
            </Text>
          </Stack>
        </SectionCard>
      </Grid>

      <Stack gap={3}>
        <Heading size="md">Worker history</Heading>
        {completedAsWorker.length === 0 ? (
          <SectionCard p={6}>
            <Text color="formLabelMuted" fontSize="sm">
              No completed worker engagements yet. Awarded quotes that finish on
              tasks you took on will appear here.
            </Text>
          </SectionCard>
        ) : (
          <Stack gap={3}>
            {completedAsWorker.map(({ task, quote }) => (
              <SectionCard key={quote.id} p={5}>
                <HStack
                  justify="space-between"
                  align="flex-start"
                  flexWrap="wrap"
                  gap={4}
                >
                  <Stack gap={1} maxW="3xl">
                    <Heading size="sm">{task.title}</Heading>
                    <Text fontSize="sm" color="formLabelMuted">
                      Completed {formatDate(task.completedAt ?? task.createdAt)}
                    </Text>
                  </Stack>
                  <HStack gap={3}>
                    <Badge bg="primary.100" color="primary.800">
                      Worker
                    </Badge>
                    <Text fontWeight={800}>
                      {formatPounds(quotePricePence(quote))}
                    </Text>
                  </HStack>
                </HStack>
              </SectionCard>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>
  )
}
