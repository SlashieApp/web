'use client'

import type { ChangeEvent } from 'react'

import {
  Box,
  HStack,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import { priceToPence } from '@/utils/price'
import { Badge, Button, SectionCard } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import {
  formatPoundsFromPence,
  normaliseTaskStatusForBadge,
  workerQuoteAvatarLabel,
} from '../../helpers/taskDetailUtils'
import { QuoteCard } from './QuoteCard'

export function QuotesSection() {
  const {
    task,
    isOwner,
    isAuthenticated,
    myQuote,
    canAccessWorkerTools,
    quoteAmountInput,
    quoteMessageInput,
    setQuoteAmountInput,
    setQuoteMessageInput,
    onSubmitQuote,
    quoting,
    quoteError,
    quoteSuccess,
    sortedQuotes,
    lowestPricePence,
    canAcceptQuotes,
    acceptError,
    cancelError,
    acceptingQuoteId,
    onAcceptQuote,
  } = useTaskDetail()

  if (!task) return null

  if (isOwner) {
    const n = task.quotes.length

    return (
      <SectionCard
        id="owner-quotes"
        pt={{ base: 2, lg: 4 }}
        bodyGap={4}
        header={
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
          >
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
        }
      >
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
          <Text color="formLabelMuted">
            No quotes yet. Check back for worker responses.
          </Text>
        ) : (
          <Stack gap={4} id="owner-quotes-list">
            {sortedQuotes.map((quote) => {
              const quotePence = priceToPence(quote.price)
              const professionalName =
                quote.professional?.profile?.name?.trim() ||
                `${quote.professional?.firstName ?? ''} ${quote.professional?.lastName ?? ''}`.trim() ||
                'Professional'
              return (
                <QuoteCard
                  key={quote.id}
                  name={professionalName}
                  avatarLabel={workerQuoteAvatarLabel(quote.workerUserId)}
                  avatarUrl={quote.professional?.profile?.avatarUrl}
                  priceLabel={
                    quotePence != null ? formatPoundsFromPence(quotePence) : '—'
                  }
                  message={quote.message}
                  ownerQuoteEmphasis
                  acceptPrimary={
                    quotePence != null && quotePence === lowestPricePence
                  }
                  messageHref="/dashboard/messages"
                  isOwnQuote={false}
                  onAccept={
                    canAcceptQuotes
                      ? () => void onAcceptQuote(quote.id)
                      : undefined
                  }
                  acceptLoading={acceptingQuoteId === quote.id}
                />
              )
            })}
          </Stack>
        )}
      </SectionCard>
    )
  }

  const loginHref = `/login?next=${encodeURIComponent(`/task/${task.id}#task-quote`)}`

  return (
    <Box id="task-quote" scrollMarginTop="96px">
      {!isAuthenticated ? (
        <SectionCard
          eyebrow="Quotes"
          heading="Log in to make a quote"
          bodyGap={4}
        >
          <Text color="formLabelMuted">
            Sign in to send your quote and message to the task owner.
          </Text>
          <Link
            as={NextLink}
            href={loginHref}
            _hover={{ textDecoration: 'none' }}
          >
            <Button w="full">Log in</Button>
          </Link>
        </SectionCard>
      ) : myQuote ? (
        <SectionCard eyebrow="Quotes" heading="Your quote" bodyGap={3}>
          <Text color="formLabelMuted">
            You submitted{' '}
            {formatPoundsFromPence(priceToPence(myQuote.price) ?? 0)}
            {myQuote.message ? ` — “${myQuote.message}”` : '.'}
          </Text>
          <Badge bg="cardBg" color="cardFg" w="fit-content">
            Status: {normaliseTaskStatusForBadge(myQuote.status)}
          </Badge>
        </SectionCard>
      ) : !canAccessWorkerTools ? (
        <SectionCard
          eyebrow="Quotes"
          heading="Become a worker to send a quote"
          bodyGap={4}
          bg="primary.50"
          borderColor="primary.100"
        >
          <Text color="formLabelMuted">
            Create your worker profile to unlock quoting and worker tools.
          </Text>
          <Link
            as={NextLink}
            href="/dashboard/worker/register"
            _hover={{ textDecoration: 'none' }}
          >
            <Button w="full">Create worker profile</Button>
          </Link>
        </SectionCard>
      ) : (
        <SectionCard eyebrow="Quotes" heading="Submit a quote" bodyGap={4}>
          <Text color="formLabelMuted">
            Share your price and a short message for the client.
          </Text>
          <Stack gap={3}>
            <Input
              placeholder="Quote price (pence)"
              value={quoteAmountInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuoteAmountInput(e.target.value)
              }
            />
            <Input
              placeholder="Short message to the client"
              value={quoteMessageInput}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuoteMessageInput(e.target.value)
              }
            />
            <Button
              background="linkBlue.600"
              color="white"
              loading={quoting}
              onClick={() => void onSubmitQuote()}
            >
              Submit quote
            </Button>
            {quoteError ? (
              <Text color="red.400" fontSize="sm">
                {quoteError}
              </Text>
            ) : null}
            {quoteSuccess ? (
              <Text color="green.600" fontSize="sm">
                {quoteSuccess}
              </Text>
            ) : null}
          </Stack>
        </SectionCard>
      )}
    </Box>
  )
}
