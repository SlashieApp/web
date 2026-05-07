'use client'

import { useMemo, useState } from 'react'

import {
  HStack,
  Heading,
  Link,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import { priceToPence } from '@/utils/price'
import { Badge, Button } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import {
  budgetKindLabel,
  formatPoundsFromPence,
  formatQuoteRespondedAgo,
  normaliseTaskStatusForBadge,
  workerQuoteAvatarLabel,
} from '../../helpers/taskDetailUtils'
import { MetaListRow } from '../metaSection/MetaListRow'
import { QuoteCard } from './QuoteCard'

type QuoteSort = 'recommended' | 'price_low' | 'price_high' | 'recent'

type TaskQuote = TaskDetailRecord['quotes'][number]

function sortOwnerQuotes(quotes: TaskQuote[], sort: QuoteSort): TaskQuote[] {
  const list = [...quotes]
  const created = (q: TaskQuote) => new Date(q.createdAt).getTime()
  const cmpPrice = (a: TaskQuote, b: TaskQuote) => {
    const pa = priceToPence(a.price)
    const pb = priceToPence(b.price)
    const na = pa == null
    const nb = pb == null
    if (na && nb) return 0
    if (na) return 1
    if (nb) return -1
    return pa - pb
  }
  switch (sort) {
    case 'price_low':
      return list.sort(cmpPrice)
    case 'price_high':
      return list.sort((a, b) => -cmpPrice(a, b))
    case 'recent':
      return list.sort((a, b) => created(b) - created(a))
    default:
      return list.sort((a, b) => {
        const p = cmpPrice(a, b)
        if (p !== 0) return p
        return created(b) - created(a)
      })
  }
}

function quoteDividerAfterList(
  listLength: number,
  hasTrailingBlock: boolean,
  index: number,
): boolean {
  if (listLength === 0) return false
  const isLastRow = index === listLength - 1
  if (!isLastRow) return true
  return hasTrailingBlock
}

export function QuotesSection() {
  const {
    task,
    isOwner,
    isAuthenticated,
    myQuote,
    canAccessWorkerTools,
    sortedQuotes,
    lowestPricePence,
    canAcceptQuotes,
    acceptError,
    cancelError,
    acceptingQuoteId,
    onAcceptQuote,
  } = useTaskDetail()

  const [quoteSort, setQuoteSort] = useState<QuoteSort>('recommended')

  const displayQuotes = useMemo(
    () => sortOwnerQuotes(sortedQuotes, quoteSort),
    [sortedQuotes, quoteSort],
  )

  if (!task) return null

  if (isOwner) {
    const n = task.quotes.length
    const priceKind = budgetKindLabel(task.budget?.type) ?? 'Fixed price'
    const hasList = n > 0

    return (
      <Stack gap={4} w="full" id="owner-quotes">
        <HStack
          justify="space-between"
          align="center"
          flexWrap="wrap"
          gap={3}
          w="full"
        >
          <Heading size="md">Quotes{hasList ? ` (${n})` : ''}</Heading>
          {hasList ? (
            <HStack gap={2} align="center" flexShrink={0}>
              <Text fontSize="sm" color="formLabelMuted" fontWeight={500}>
                Sort:
              </Text>
              <NativeSelect.Root w={{ base: 'full', sm: '180px' }} maxW="220px">
                <NativeSelect.Field
                  bg="cardBg"
                  borderWidth="1px"
                  borderColor="cardBorder"
                  borderRadius="lg"
                  fontSize="sm"
                  value={quoteSort}
                  onChange={(e) => setQuoteSort(e.target.value as QuoteSort)}
                >
                  <option value="recommended">Recommended</option>
                  <option value="price_low">Price (lowest)</option>
                  <option value="price_high">Price (highest)</option>
                  <option value="recent">Most recent</option>
                </NativeSelect.Field>
              </NativeSelect.Root>
            </HStack>
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
        {!hasList ? (
          <Text color="formLabelMuted">
            No quotes yet. Check back for worker responses.
          </Text>
        ) : (
          <Stack gap={0} w="full" id="owner-quotes-list">
            {displayQuotes.map((quote, i) => {
              const quotePence = priceToPence(quote.price)
              const workerName =
                quote.worker?.profile?.name?.trim() ||
                `${quote.worker?.firstName ?? ''} ${quote.worker?.lastName ?? ''}`.trim() ||
                'Worker'
              return (
                <MetaListRow
                  key={quote.id}
                  withDivider={quoteDividerAfterList(
                    displayQuotes.length,
                    false,
                    i,
                  )}
                >
                  <QuoteCard
                    variant="list"
                    showPrice
                    name={workerName}
                    avatarLabel={workerQuoteAvatarLabel(quote.workerUserId)}
                    avatarUrl={quote.worker?.profile?.avatarUrl}
                    priceLabel={
                      quotePence != null
                        ? formatPoundsFromPence(quotePence)
                        : '—'
                    }
                    priceKindLabel={priceKind}
                    message={quote.message}
                    respondedLabel={
                      formatQuoteRespondedAgo(quote.createdAt) ?? undefined
                    }
                    showVerified={Boolean(quote.worker?.id)}
                    acceptPrimary={
                      quotePence != null && quotePence === lowestPricePence
                    }
                    isOwnQuote={false}
                    onAccept={
                      canAcceptQuotes
                        ? () => void onAcceptQuote(quote.id)
                        : undefined
                    }
                    acceptLoading={acceptingQuoteId === quote.id}
                  />
                </MetaListRow>
              )
            })}
          </Stack>
        )}
      </Stack>
    )
  }

  const n = task.quotes.length
  const hasQuoteRows = n > 0
  const quoteFlowHref = `/task/${task.id}/quote`
  const loginHref = `/login?next=${encodeURIComponent(quoteFlowHref)}`

  const followUpBlock = !isAuthenticated ? (
    <Stack gap={3}>
      <Heading size="sm">Log in to make a quote</Heading>
      <Text color="formLabelMuted">
        Sign in to send your quote and message to the task owner.
      </Text>
      <Link as={NextLink} href={loginHref} _hover={{ textDecoration: 'none' }}>
        <Button w="full">Log in</Button>
      </Link>
    </Stack>
  ) : myQuote ? (
    <Stack gap={3}>
      <Heading size="sm">Your quote</Heading>
      <Text color="formLabelMuted">
        {(() => {
          const submittedPence = priceToPence(myQuote.price)
          if (submittedPence == null) {
            return (
              <>
                The poster can see your amount; it is not shown on the public
                task page.
                {myQuote.message ? ` “${myQuote.message}”` : null}
              </>
            )
          }
          return (
            <>
              You submitted {formatPoundsFromPence(submittedPence)}.
              {myQuote.message ? ` “${myQuote.message}”` : null}
            </>
          )
        })()}
      </Text>
      <Badge bg="cardBg" color="cardFg" w="fit-content">
        Status: {normaliseTaskStatusForBadge(myQuote.status)}
      </Badge>
    </Stack>
  ) : !canAccessWorkerTools ? (
    <Stack gap={3}>
      <Heading size="sm">Become a worker to send a quote</Heading>
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
    </Stack>
  ) : (
    <Stack gap={3}>
      <Heading size="sm">Submit a quote</Heading>
      <Text color="formLabelMuted">
        Add your price, availability, and a message in a few guided steps.
      </Text>
      <Link
        as={NextLink}
        href={quoteFlowHref}
        _hover={{ textDecoration: 'none' }}
      >
        <Button w="full">Send a quote</Button>
      </Link>
    </Stack>
  )

  return (
    <Stack gap={4} w="full">
      <HStack
        justify="space-between"
        align="center"
        flexWrap="wrap"
        gap={3}
        w="full"
      >
        <Heading size="md">Quotes{hasQuoteRows ? ` (${n})` : ''}</Heading>
      </HStack>
      {hasQuoteRows ? (
        <Stack gap={0} w="full">
          {task.quotes.map((quote, i) => {
            const workerName =
              quote.worker?.profile?.name?.trim() ||
              `${quote.worker?.firstName ?? ''} ${quote.worker?.lastName ?? ''}`.trim() ||
              'Worker'
            return (
              <MetaListRow
                key={quote.id}
                withDivider={quoteDividerAfterList(n, true, i)}
              >
                <QuoteCard
                  variant="list"
                  showPrice={false}
                  name={workerName}
                  avatarLabel={workerQuoteAvatarLabel(quote.workerUserId)}
                  avatarUrl={quote.worker?.profile?.avatarUrl}
                  priceLabel=""
                  message={quote.message}
                  respondedLabel={
                    formatQuoteRespondedAgo(quote.createdAt) ?? undefined
                  }
                  showVerified={Boolean(quote.worker?.id)}
                />
              </MetaListRow>
            )
          })}
          <MetaListRow withDivider={false}>{followUpBlock}</MetaListRow>
        </Stack>
      ) : (
        followUpBlock
      )}
    </Stack>
  )
}
