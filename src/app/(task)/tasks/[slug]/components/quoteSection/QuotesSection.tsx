'use client'

import { type ReactNode, useMemo, useState } from 'react'

import {
  Box,
  HStack,
  Heading,
  NativeSelect,
  Stack,
  Text,
} from '@chakra-ui/react'

import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { priceToPence } from '@/utils/price'
import { Badge, Button, Link } from '@ui'

import { QuoteStatus } from '@codegen/schema'

import { workerProfilePath } from '@/app/(worker)/workers/[slug]/helpers/workerProfileHelpers'
import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import {
  budgetKindLabel,
  formatPoundsFromPence,
  formatQuotePostedAgo,
  formatQuoteRespondedAgo,
  normaliseTaskStatusForBadge,
  workerQuoteAvatarLabel,
} from '../../helpers/taskDetailUtils'

import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'

import { QuoteCard } from './QuoteCard'
import { QuoteLimitPaywall } from './QuoteLimitPaywall'
import { QuoteWorkerEarnCta } from './QuoteWorkerEarnCta'

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

function offerCountLabel(count: number): string {
  return `${count} offer${count === 1 ? '' : 's'}`
}

function QuotesSectionShell({ children }: { children: ReactNode }) {
  return (
    <Box
      borderWidth="1px"
      borderColor="cardBorder"
      borderRadius="xl"
      bg="cardBg"
      p={{ base: 4, md: 5 }}
      w="full"
    >
      {children}
    </Box>
  )
}

function renderQuoteCard(
  quote: TaskQuote,
  task: TaskDetailRecord,
  options: {
    showPrice: boolean
    postedAgo?: boolean
    priceKind?: string
    showAcceptDecline?: boolean
    lowestPricePence?: number | null
    onAcceptQuote?: (id: string) => void
    onDeclineQuote?: (id: string) => void
    acceptingQuoteId?: string | null
    decliningQuoteId?: string | null
  },
) {
  const quotePence = priceToPence(quote.price)
  const workerName = quote.worker?.profile?.name?.trim() || 'Worker'
  const workerEntityId = quote.worker?.worker?.id
  const workerProfileHref = workerEntityId
    ? workerProfilePath(workerEntityId, task.id)
    : undefined
  const formatAgo = options.postedAgo
    ? formatQuotePostedAgo
    : formatQuoteRespondedAgo

  return (
    <QuoteCard
      key={quote.id}
      variant="card"
      showPrice={options.showPrice}
      name={workerName}
      avatarLabel={workerQuoteAvatarLabel(quote.workerUserId)}
      avatarUrl={quote.worker?.profile?.avatarUrl}
      priceLabel={quotePence != null ? formatPoundsFromPence(quotePence) : '—'}
      priceKindLabel={options.priceKind}
      message={quote.message}
      respondedLabel={formatAgo(quote.createdAt) ?? undefined}
      showVerified={Boolean(quote.worker?.worker?.isVerified)}
      workerProfileHref={workerProfileHref}
      acceptPrimary={
        options.lowestPricePence != null &&
        quotePence != null &&
        quotePence === options.lowestPricePence
      }
      onAccept={
        options.showAcceptDecline && quote.status === QuoteStatus.Pending
          ? () => options.onAcceptQuote?.(quote.id)
          : undefined
      }
      onDecline={
        options.showAcceptDecline && quote.status === QuoteStatus.Pending
          ? () => options.onDeclineQuote?.(quote.id)
          : undefined
      }
      acceptLoading={options.acceptingQuoteId === quote.id}
      declineLoading={options.decliningQuoteId === quote.id}
    />
  )
}

export function QuotesSection() {
  const {
    task,
    permissions,
    isAuthenticated,
    me,
    myQuote,
    sortedQuotes,
    lowestPricePence,
    acceptError,
    cancelError,
    acceptingQuoteId,
    decliningQuoteId,
    onAcceptQuote,
    onDeclineQuote,
    quoteLimitReached,
  } = useTaskDetail()

  const {
    showOwnerQuoteList,
    showAcceptDecline,
    showWorkerJobBanner,
    canSubmitQuote,
    hasWorkerProfile,
    showQuoteForm,
  } = permissions

  const [quoteSort, setQuoteSort] = useState<QuoteSort>('recommended')

  const displayQuotes = useMemo(
    () => sortOwnerQuotes(sortedQuotes, quoteSort),
    [sortedQuotes, quoteSort],
  )

  if (!task) return null

  if (showOwnerQuoteList) {
    const n = task.quotes.length
    const priceKind = budgetKindLabel(task.budget?.type) ?? 'Fixed price'
    const hasList = n > 0

    return (
      <QuotesSectionShell>
        <Stack gap={4} w="full" id="owner-quotes">
          <HStack
            justify="space-between"
            align="center"
            flexWrap="wrap"
            gap={3}
            w="full"
          >
            <HStack gap={2} align="center" flexWrap="wrap">
              <Heading size="md">Quotes</Heading>
              {hasList ? (
                <Badge
                  bg="primary.100"
                  color="primary.800"
                  borderRadius="full"
                  letterSpacing="normal"
                  fontSize="xs"
                  px={2.5}
                >
                  {offerCountLabel(n)}
                </Badge>
              ) : null}
            </HStack>
            {hasList ? (
              <HStack gap={2} align="center" flexShrink={0}>
                <Text fontSize="sm" color="formLabelMuted" fontWeight={500}>
                  Sort:
                </Text>
                <NativeSelect.Root
                  w={{ base: 'full', sm: '180px' }}
                  maxW="220px"
                >
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
            <Stack gap={3} w="full" id="owner-quotes-list">
              {displayQuotes.map((quote) =>
                renderQuoteCard(quote, task, {
                  showPrice: true,
                  priceKind,
                  showAcceptDecline,
                  lowestPricePence,
                  onAcceptQuote: (id) => void onAcceptQuote(id),
                  onDeclineQuote: (id) => void onDeclineQuote(id),
                  acceptingQuoteId,
                  decliningQuoteId,
                }),
              )}
            </Stack>
          )}
        </Stack>
      </QuotesSectionShell>
    )
  }

  const n = task.quotes.length
  const hasQuoteRows = n > 0
  const quoteFlowHref = `/tasks/${task.id}/quote`

  if (showWorkerJobBanner) {
    return (
      <QuotesSectionShell>
        <Stack gap={3} w="full">
          <Heading size="md">Your accepted quote</Heading>
          <Text fontSize="sm" color="formLabelMuted">
            You are booked on this job. Use the panel below to enter the
            customer&apos;s completion code when work is done.
          </Text>
        </Stack>
      </QuotesSectionShell>
    )
  }

  const showEarnCta = !myQuote && (!isAuthenticated || !hasWorkerProfile)

  const followUpBlock = myQuote ? (
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
      <Badge bg="neutral.100" color="cardFg" w="fit-content">
        Status: {normaliseTaskStatusForBadge(myQuote.status)}
      </Badge>
    </Stack>
  ) : showEarnCta ? (
    <QuoteWorkerEarnCta
      createProfileHref={workerSetupHref(`/tasks/${task.id}#task-quote`)}
    />
  ) : me && !isEmailVerified(me) ? (
    <Stack gap={3}>
      <Heading size="sm">Verify your email</Heading>
      <Text color="formLabelMuted">
        Verify your email before sending quotes. Check your inbox or resend from
        the banner.
      </Text>
      <Link href="/verify-email/sent" _hover={{ textDecoration: 'none' }}>
        <Button w="full">Check inbox</Button>
      </Link>
    </Stack>
  ) : quoteLimitReached ? (
    <QuoteLimitPaywall />
  ) : !canSubmitQuote ? (
    <Stack gap={3}>
      <Heading size="sm">Quoting closed</Heading>
      <Text color="formLabelMuted">
        This task is no longer accepting new quotes.
      </Text>
    </Stack>
  ) : showQuoteForm ? (
    <Stack gap={3}>
      <Heading size="sm">Submit a quote</Heading>
      <Text color="formLabelMuted">
        Add your price, availability, and a message in a few guided steps.
      </Text>
      <Link href={quoteFlowHref} _hover={{ textDecoration: 'none' }}>
        <Button w="full">Send a quote</Button>
      </Link>
    </Stack>
  ) : null

  return (
    <QuotesSectionShell>
      <Stack gap={4} w="full">
        <Stack gap={1}>
          <HStack gap={2} align="center" flexWrap="wrap">
            <Heading size="md">Quotes</Heading>
            {hasQuoteRows ? (
              <Badge
                bg="primary.100"
                color="primary.800"
                borderRadius="full"
                letterSpacing="normal"
                fontSize="xs"
                px={2.5}
              >
                {offerCountLabel(n)}
              </Badge>
            ) : null}
          </HStack>
          <Text fontSize="sm" color="formLabelMuted">
            See what others are bidding — register as a worker to compete
          </Text>
        </Stack>
        {hasQuoteRows ? (
          <Stack gap={3} w="full">
            {task.quotes.map((quote) =>
              renderQuoteCard(quote, task, {
                showPrice: true,
                postedAgo: true,
              }),
            )}
          </Stack>
        ) : (
          <Text color="formLabelMuted">No quotes yet.</Text>
        )}
        {followUpBlock}
      </Stack>
    </QuotesSectionShell>
  )
}
