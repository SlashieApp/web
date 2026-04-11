'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { GlassCard, Heading } from '@ui'

import { TaskQuoteCard } from './TaskQuoteCard'
import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskDetailOwnerQuotesSectionProps = {
  task: TaskDetailRecord
  sortedQuotes: TaskDetailRecord['quotes']
  lowestPricePence: number | null
  canAcceptQuotes: boolean
  acceptError: string | null
  cancelError: string | null
  acceptingQuoteId: string | null
  onAcceptQuote: (quoteId: string) => void
  formatPounds: (pricePence: number) => string
  workerAvatarLabel: (workerUserId: string) => string
}

export function TaskDetailOwnerQuotesSection({
  task,
  sortedQuotes,
  lowestPricePence,
  canAcceptQuotes,
  acceptError,
  cancelError,
  acceptingQuoteId,
  onAcceptQuote,
  formatPounds,
  workerAvatarLabel,
}: TaskDetailOwnerQuotesSectionProps) {
  const n = task.quotes.length

  return (
    <Stack gap={4} w="full" pt={{ base: 2, lg: 4 }} id="owner-quotes">
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Heading size="md">Recent quotes</Heading>
        {n > 0 ? (
          <Link
            as={NextLink}
            href="#owner-quotes-list"
            fontSize="sm"
            fontWeight={700}
            color="primary.600"
            _hover={{ color: 'primary.700' }}
          >
            View all {n} quote{n === 1 ? '' : 's'}
          </Link>
        ) : null}
      </HStack>
      {acceptError ? (
        <Text color="red.400" fontSize="sm">
          {acceptError}
        </Text>
      ) : null}
      {cancelError ? (
        <Text color="red.400" fontSize="sm">
          {cancelError}
        </Text>
      ) : null}
      {n === 0 ? (
        <GlassCard p={6} borderColor="border" boxShadow="ambient">
          <Text color="muted">
            No quotes yet. Share your task link to get quotes from
            professionals.
          </Text>
        </GlassCard>
      ) : (
        <Stack gap={4} id="owner-quotes-list">
          {sortedQuotes.map((quote) => (
            <TaskQuoteCard
              key={quote.id}
              name="Professional"
              avatarLabel={workerAvatarLabel(quote.workerUserId)}
              priceLabel={formatPounds(quote.pricePence)}
              message={quote.message}
              ownerQuoteEmphasis
              acceptPrimary={quote.pricePence === lowestPricePence}
              messageHref="/dashboard"
              isOwnQuote={false}
              onAccept={
                canAcceptQuotes ? () => void onAcceptQuote(quote.id) : undefined
              }
              acceptLoading={acceptingQuoteId === quote.id}
            />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
