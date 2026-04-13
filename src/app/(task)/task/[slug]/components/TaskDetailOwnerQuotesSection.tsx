'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { priceToPence } from '@/utils/price'
import { GlassCard, Heading } from '@ui'

import { TaskQuoteCard } from './TaskQuoteCard'
import type { TaskDetailRecord } from './taskDetailUtils'

export type TaskDetailOwnerQuotesSectionProps = {
  task: TaskDetailRecord
  sortedQuotes: TaskDetailRecord['quotes']
  lowestPricePence: number | null
  isOwner: boolean
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
  isOwner,
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
        <Heading size="md">Worker quotes</Heading>
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
            No quotes yet. Check back for worker responses.
          </Text>
        </GlassCard>
      ) : (
        <Stack gap={4} id="owner-quotes-list">
          {sortedQuotes.map((quote) => {
            const quotePence = priceToPence(quote.price) ?? 0
            const professionalName =
              quote.professional?.profile?.name?.trim() ||
              `${quote.professional?.firstName ?? ''} ${quote.professional?.lastName ?? ''}`.trim() ||
              'Professional'
            return (
              <TaskQuoteCard
                key={quote.id}
                name={professionalName}
                avatarLabel={workerAvatarLabel(quote.workerUserId)}
                avatarUrl={quote.professional?.profile?.avatarUrl}
                priceLabel={
                  isOwner
                    ? formatPounds(quotePence)
                    : 'Price visible to task owner'
                }
                message={quote.message}
                ownerQuoteEmphasis={isOwner}
                acceptPrimary={quotePence === lowestPricePence}
                messageHref={isOwner ? '/dashboard/messages' : undefined}
                isOwnQuote={false}
                onAccept={
                  isOwner && canAcceptQuotes
                    ? () => void onAcceptQuote(quote.id)
                    : undefined
                }
                acceptLoading={acceptingQuoteId === quote.id}
              />
            )
          })}
        </Stack>
      )}
    </Stack>
  )
}
