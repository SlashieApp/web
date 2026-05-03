'use client'

import { HStack, Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { priceToPence } from '@/utils/price'
import { Card } from '@ui'

import { useTaskDetail } from '../context/TaskDetailProvider'
import { TaskQuoteCard } from './TaskQuoteCard'
import {
  formatPoundsFromPence,
  workerQuoteAvatarLabel,
} from './taskDetailUtils'

export function TaskDetailOwnerQuotesSection() {
  const {
    task,
    isOwner,
    sortedQuotes,
    lowestPricePence,
    canAcceptQuotes,
    acceptError,
    cancelError,
    acceptingQuoteId,
    onAcceptQuote,
  } = useTaskDetail()

  if (!task) return null

  const n = task.quotes.length

  return (
    <Stack gap={4} w="full" pt={{ base: 2, lg: 4 }} id="owner-quotes">
      <HStack justify="space-between" align="center" flexWrap="wrap" gap={3}>
        <Heading size="md">Quotes</Heading>
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
        <Card p={6} maxW="full" w="full">
          <Text color="formLabelMuted">
            No quotes yet. Check back for worker responses.
          </Text>
        </Card>
      ) : (
        <Stack gap={4} id="owner-quotes-list">
          {sortedQuotes.map((quote) => {
            const quotePence = priceToPence(quote.price)
            const professionalName =
              quote.professional?.profile?.name?.trim() ||
              `${quote.professional?.firstName ?? ''} ${quote.professional?.lastName ?? ''}`.trim() ||
              'Professional'
            return (
              <TaskQuoteCard
                key={quote.id}
                name={professionalName}
                avatarLabel={workerQuoteAvatarLabel(quote.workerUserId)}
                avatarUrl={quote.professional?.profile?.avatarUrl}
                priceLabel={
                  isOwner
                    ? quotePence != null
                      ? formatPoundsFromPence(quotePence)
                      : '—'
                    : 'Hidden until you own this task'
                }
                message={quote.message}
                ownerQuoteEmphasis={isOwner}
                acceptPrimary={
                  quotePence != null && quotePence === lowestPricePence
                }
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
