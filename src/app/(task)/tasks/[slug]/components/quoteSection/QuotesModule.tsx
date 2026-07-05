'use client'

import { useMemo, useState } from 'react'

import {
  Box,
  HStack,
  Heading,
  NativeSelect,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'
import { LuCheck, LuLock, LuMessagesSquare, LuX } from 'react-icons/lu'

import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { workerProfilePath } from '@/app/(worker)/workers/[slug]/helpers/workerProfileHelpers'
import { priceToPence } from '@/utils/price'
import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'
import { Button, Card, Link } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import {
  formatPoundsFromPence,
  formatQuoteRespondedAgo,
  splitQuoteMessageAvailability,
  workerQuoteAvatarLabel,
} from '../../helpers/taskDetailUtils'
import { QuoteCard, QuoteCardAvatar } from './QuoteCard'

type TaskQuote = TaskDetailRecord['quotes'][number]

/** The approved 12-state quotes-module matrix (contact sheet v2). */
export type QuotesModuleState =
  | 'C1' // customer · no quotes
  | 'C2' // customer · list + accept
  | 'C3' // customer · partial cap
  | 'C4' // customer · awarded
  | 'W1' // visitor · sign in
  | 'W2' // signed in · no worker profile
  | 'W3' // worker · empty · send
  | 'W4' // worker · competing
  | 'W5' // worker · own quote pending
  | 'W6' // worker · accepted
  | 'W7' // worker · declined
  | 'W8' // worker · task full

type QuoteSort = 'recommended' | 'price_low' | 'recent'

function sortQuotes(quotes: TaskQuote[], sort: QuoteSort): TaskQuote[] {
  const list = [...quotes]
  const created = (q: TaskQuote) => new Date(q.createdAt).getTime()
  const cmpPrice = (a: TaskQuote, b: TaskQuote) => {
    const pa = priceToPence(a.price)
    const pb = priceToPence(b.price)
    if (pa == null && pb == null) return 0
    if (pa == null) return 1
    if (pb == null) return -1
    return pa - pb
  }
  switch (sort) {
    case 'price_low':
      return list.sort(cmpPrice)
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

export function deriveQuotesModuleState(input: {
  isOwner: boolean
  isOpen: boolean
  isAuthenticated: boolean
  hasWorkerProfile: boolean
  canSubmitQuote: boolean
  quoteCount: number
  acceptedCount: number
  slotsCap: number
  myQuoteStatus: QuoteStatus | null
}): QuotesModuleState {
  const {
    isOwner,
    isOpen,
    isAuthenticated,
    hasWorkerProfile,
    canSubmitQuote,
    quoteCount,
    acceptedCount,
    slotsCap,
    myQuoteStatus,
  } = input

  if (isOwner) {
    if (acceptedCount >= slotsCap || !isOpen)
      return acceptedCount > 0 ? 'C4' : quoteCount > 0 ? 'C2' : 'C1'
    if (acceptedCount > 0) return 'C3'
    if (quoteCount > 0) return 'C2'
    return 'C1'
  }

  if (myQuoteStatus && isAcceptedQuoteStatus(myQuoteStatus)) return 'W6'
  if (myQuoteStatus === QuoteStatus.Declined) return 'W7'
  if (myQuoteStatus === QuoteStatus.Pending) return 'W5'
  if (!isAuthenticated) return 'W1'
  if (!hasWorkerProfile) return 'W2'
  if (!isOpen || acceptedCount >= slotsCap || !canSubmitQuote) return 'W8'
  if (quoteCount > 0) return 'W4'
  return 'W3'
}

const HEADER_SUBTITLES: Record<QuotesModuleState, string> = {
  C1: 'Workers can send quotes while your task is open.',
  C2: 'Workers can send quotes while your task is open.',
  C3: 'Workers can send quotes while your task is open.',
  C4: 'Workers can send quotes while your task is open.',
  W1: 'Sign in to send a quote.',
  W2: 'Become a worker to compete on this task.',
  W3: 'Be the first to quote — customers compare price and availability.',
  W4: 'See what others are bidding — then send yours.',
  W5: 'Customer is reviewing quotes.',
  W6: 'Your quote has been accepted.',
  W7: 'This quote was not selected.',
  W8: 'This task is not accepting new quotes.',
}

// ---------------------------------------------------------------- chrome

function CountPill({ label }: { label: string }) {
  return (
    <Box
      as="span"
      px={2.5}
      py={0.5}
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      fontSize="xs"
      fontWeight={700}
      whiteSpace="nowrap"
    >
      {label}
    </Box>
  )
}

/**
 * Module shell: the shared task-detail section Card (same surface, radius,
 * hairline, and heading treatment as Task details / Task owner / Photos),
 * with the count pill beside the heading and a role-specific subtitle.
 */
function ModuleShell({
  subtitle,
  pill,
  children,
  slotsStrip,
}: {
  subtitle: string
  pill?: string | null
  slotsStrip?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card
      layout="section"
      id="task-quotes"
      header={
        <Stack gap={1}>
          <HStack gap={2} align="center" flexWrap="wrap">
            <Heading
              as="h3"
              fontSize={{ base: '16px', md: '20px' }}
              fontWeight={500}
              color="text.default"
              lineHeight="short"
            >
              Quotes
            </Heading>
            {pill ? <CountPill label={pill} /> : null}
          </HStack>
          <Text fontSize="sm" color="text.muted" fontWeight={400}>
            {subtitle}
          </Text>
        </Stack>
      }
    >
      {slotsStrip}
      {children}
    </Card>
  )
}

/** C3: "2 of 3 worker slots filled" strip with progress dots. */
function SlotsStrip({ filled, cap }: { filled: number; cap: number }) {
  return (
    <HStack
      justify="space-between"
      align="center"
      px={4}
      py={2.5}
      bg="status.success.soft"
      borderRadius="lg"
    >
      <Text fontSize="sm" fontWeight={600} color="status.success.fg">
        {filled} of {cap} worker slots filled
      </Text>
      <HStack gap={1.5} aria-hidden>
        {Array.from({ length: cap }, (_, i) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-size dots
            key={i}
            boxSize="8px"
            borderRadius="full"
            bg={i < filled ? 'status.success.solid' : 'border.default'}
          />
        ))}
      </HStack>
    </HStack>
  )
}

/** Dashed empty block (C1 / W3). */
function EmptyBlock({
  title,
  caption,
}: {
  title: string
  caption: string
}) {
  return (
    <Stack
      align="center"
      gap={2}
      py={8}
      px={4}
      borderWidth="2px"
      borderStyle="dashed"
      borderColor="border.default"
      borderRadius="xl"
      textAlign="center"
    >
      <Box
        boxSize="48px"
        borderRadius="full"
        bg="status.success.soft"
        color="status.success.fg"
        display="flex"
        alignItems="center"
        justifyContent="center"
        aria-hidden
      >
        <LuMessagesSquare size={22} />
      </Box>
      <Text fontWeight={700} color="text.default">
        {title}
      </Text>
      <Text fontSize="sm" color="text.muted">
        {caption}
      </Text>
    </Stack>
  )
}

function StatusCircle({
  tone,
  children,
}: {
  tone: 'success' | 'neutral'
  children: React.ReactNode
}) {
  return (
    <Box
      boxSize="48px"
      borderRadius="full"
      bg={tone === 'success' ? 'status.success.soft' : 'bg.subtle'}
      color={tone === 'success' ? 'status.success.fg' : 'text.muted'}
      display="flex"
      alignItems="center"
      justifyContent="center"
      aria-hidden
    >
      {children}
    </Box>
  )
}

// ------------------------------------------------------------ quote cards

/** Initials from the display name (e.g. "Maria L." → "ML"); ID-based fallback. */
function workerNameInitials(name: string, workerUserId: string): string {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
  return initials || workerQuoteAvatarLabel(workerUserId)
}

function quoteCardBaseProps(quote: TaskQuote) {
  const { body, availability } = splitQuoteMessageAvailability(quote.message)
  const pence = priceToPence(quote.price)
  const name = quote.worker?.profile?.name?.trim() || 'Worker'
  return {
    name,
    avatarLabel: workerNameInitials(name, quote.workerUserId),
    avatarUrl: quote.worker?.profile?.avatarUrl,
    priceLabel: pence != null ? formatPoundsFromPence(pence) : '—',
    showPrice: pence != null,
    message: body,
    availabilityLabel: availability,
    showVerified: Boolean(quote.worker?.worker?.isVerified),
    respondedLabel: formatQuoteRespondedAgo(quote.createdAt) ?? undefined,
  }
}

/** C4 primary card / W6-adjacent: accepted worker, "Job in progress" rail. */
function AcceptedPrimaryCard({
  quote,
  taskId,
}: {
  quote: TaskQuote
  taskId: string
}) {
  const base = quoteCardBaseProps(quote)
  const workerEntityId = quote.worker?.worker?.id
  const profileHref = workerEntityId
    ? workerProfilePath(workerEntityId, taskId)
    : null

  return (
    <Stack
      gap={3}
      p={4}
      borderRadius="xl"
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderLeftWidth="4px"
      borderLeftColor="status.success.solid"
      w="full"
    >
      <HStack gap={1.5} align="center">
        <Box
          boxSize="8px"
          borderRadius="full"
          bg="status.success.solid"
          aria-hidden
        />
        <Text fontSize="sm" fontWeight={700} color="status.success.fg">
          Job in progress
        </Text>
      </HStack>
      <HStack align="flex-start" gap={3} justify="space-between">
        <HStack align="flex-start" gap={3} flex={1} minW={0}>
          <QuoteCardAvatar
            name={base.name}
            avatarLabel={base.avatarLabel}
            avatarUrl={base.avatarUrl}
            size="44px"
          />
          <Stack gap={0.5} flex={1} minW={0}>
            <Heading size="sm" lineHeight="short">
              {base.name}
            </Heading>
            <Text fontSize="sm" color="text.muted">
              ★ No reviews yet
            </Text>
          </Stack>
        </HStack>
        {base.showPrice ? (
          <Text fontWeight={700} fontSize="2xl" lineHeight="shorter">
            {base.priceLabel}
          </Text>
        ) : null}
      </HStack>
      {base.message ? (
        <Text fontSize="sm" color="text.default" lineHeight="tall">
          {base.message}
        </Text>
      ) : null}
      {base.availabilityLabel ? (
        <Box
          as="span"
          w="fit-content"
          px={2.5}
          py={1}
          borderRadius="full"
          bg="status.success.soft"
          color="status.success.fg"
          fontSize="xs"
          fontWeight={600}
        >
          {base.availabilityLabel}
        </Box>
      ) : null}
      {profileHref ? (
        <Button asChild size="sm" variant="secondary" w="full">
          <Link href={profileHref} _hover={{ textDecoration: 'none' }}>
            View profile
          </Link>
        </Button>
      ) : null}
    </Stack>
  )
}

// ------------------------------------------------------------------ module

export type QuotesModuleProps = {
  /**
   * Accepted-worker cap. The API's current model is single-worker (a task is
   * full at 1 accepted quote); pass a higher cap to exercise the C3 partial
   * state (kept generic per the approved design).
   */
  slotsCap?: number
}

/**
 * The task-detail Quotes module — one permission-gated component implementing
 * the approved 12-state redesign (C1–C4 owner, W1–W8 worker/visitor). State is
 * derived from `getTaskDetailPermissions` output + quote data; no role checks
 * scattered in JSX.
 */
export function QuotesModule({ slotsCap = 1 }: QuotesModuleProps) {
  const {
    task,
    permissions,
    isAuthenticated,
    myQuote,
    sortedQuotes,
    acceptError,
    acceptingQuoteId,
    decliningQuoteId,
    onAcceptQuote,
    onDeclineQuote,
  } = useTaskDetail()

  const [sort, setSort] = useState<QuoteSort>('recommended')
  const [showOthers, setShowOthers] = useState(false)

  const quotes = task?.quotes ?? []
  const acceptedQuotes = useMemo(
    () => quotes.filter((q) => isAcceptedQuoteStatus(q.status)),
    [quotes],
  )

  const state = deriveQuotesModuleState({
    isOwner: permissions.isOwner,
    isOpen: permissions.isOpen,
    isAuthenticated,
    hasWorkerProfile: permissions.hasWorkerProfile,
    canSubmitQuote: permissions.canSubmitQuote,
    quoteCount: quotes.length,
    acceptedCount: acceptedQuotes.length,
    slotsCap,
    myQuoteStatus: (myQuote?.status as QuoteStatus | undefined) ?? null,
  })

  const displayQuotes = useMemo(
    () => sortQuotes(sortedQuotes, sort),
    [sortedQuotes, sort],
  )

  if (!task) return null

  const quoteFlowHref = `/tasks/${task.id}/quote`
  const nextHref = encodeURIComponent(quoteFlowHref)

  const pill =
    state === 'W8'
      ? 'Full'
      : state === 'C4' || state === 'C3'
        ? `${acceptedQuotes.length} accepted`
        : quotes.length > 0 && (state === 'C2' || state === 'W4')
          ? `${quotes.length} offer${quotes.length === 1 ? '' : 's'}`
          : null

  const sendQuoteCta = (
    <Button asChild variant="primary" w="full">
      <Link href={quoteFlowHref} _hover={{ textDecoration: 'none' }}>
        Send a quote
      </Link>
    </Button>
  )

  const errorLine = acceptError ? (
    <Text color="status.danger.fg" fontSize="sm">
      {acceptError}
    </Text>
  ) : null

  const ownerSortSelect = (
    <HStack gap={2} align="center">
      <Text fontSize="sm" color="text.muted" fontWeight={500} flexShrink={0}>
        Sort:
      </Text>
      <NativeSelect.Root w="full" maxW="220px">
        <NativeSelect.Field
          bg="bg.surface"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="lg"
          fontSize="sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as QuoteSort)}
        >
          <option value="recommended">Recommended</option>
          <option value="price_low">Price low–high</option>
          <option value="recent">Newest</option>
        </NativeSelect.Field>
      </NativeSelect.Root>
    </HStack>
  )

  const ownerQuoteCard = (quote: TaskQuote) => {
    const pending = quote.status === QuoteStatus.Pending
    const accepted = isAcceptedQuoteStatus(quote.status)
    const workerEntityId = quote.worker?.worker?.id
    return (
      <QuoteCard
        key={quote.id}
        variant="card"
        {...quoteCardBaseProps(quote)}
        workerProfileHref={
          workerEntityId
            ? workerProfilePath(workerEntityId, task.id)
            : undefined
        }
        statusBadge={
          accepted
            ? 'accepted'
            : quote.status === QuoteStatus.Declined
              ? 'declined'
              : null
        }
        onAccept={
          pending && permissions.showAcceptDecline
            ? () => void onAcceptQuote(quote.id)
            : undefined
        }
        onDecline={
          pending && permissions.showAcceptDecline
            ? () => void onDeclineQuote(quote.id)
            : undefined
        }
        acceptLoading={acceptingQuoteId === quote.id}
        declineLoading={decliningQuoteId === quote.id}
      />
    )
  }

  /** Read-only competitor card — public identity only, no contact PII. */
  const competitorCard = (quote: TaskQuote) => (
    <QuoteCard key={quote.id} variant="card" {...quoteCardBaseProps(quote)} />
  )

  let body: React.ReactNode = null

  switch (state) {
    case 'C1':
      body = (
        <EmptyBlock
          title="No quotes yet"
          caption="Nearby workers usually respond within 24 hours."
        />
      )
      break

    case 'C2':
      body = (
        <>
          {errorLine}
          {ownerSortSelect}
          <Stack gap={3}>{displayQuotes.map(ownerQuoteCard)}</Stack>
        </>
      )
      break

    case 'C3':
      body = (
        <>
          {errorLine}
          <Stack gap={3}>{displayQuotes.map(ownerQuoteCard)}</Stack>
        </>
      )
      break

    case 'C4': {
      const primary = acceptedQuotes[0]
      const others = quotes.filter((q) => q.id !== primary?.id)
      body = (
        <>
          {errorLine}
          {primary ? (
            <AcceptedPrimaryCard quote={primary} taskId={task.id} />
          ) : null}
          {others.length > 0 ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                color="text.link"
                alignSelf="center"
                onClick={() => setShowOthers((v) => !v)}
              >
                {showOthers
                  ? 'Hide other quotes'
                  : `Show ${others.length} other quote${others.length === 1 ? '' : 's'}`}
              </Button>
              {showOthers ? (
                <Stack gap={3}>{others.map(ownerQuoteCard)}</Stack>
              ) : null}
            </>
          ) : null}
        </>
      )
      break
    }

    case 'W1':
      body = (
        <Stack align="center" gap={4} py={4} textAlign="center">
          <StatusCircle tone="success">
            <LuLock size={22} />
          </StatusCircle>
          <Text fontWeight={600} color="text.default" maxW="240px">
            Join as a worker to quote on tasks.
          </Text>
          <Stack gap={2} w="full">
            <Button asChild variant="primary" w="full">
              <Link
                href={`/register?next=${nextHref}`}
                _hover={{ textDecoration: 'none' }}
              >
                Get started
              </Link>
            </Button>
            <Button asChild variant="ghost" w="full">
              <Link
                href={`/login?next=${nextHref}`}
                _hover={{ textDecoration: 'none' }}
              >
                Log in
              </Link>
            </Button>
          </Stack>
        </Stack>
      )
      break

    case 'W2':
      body = (
        <Stack gap={4}>
          <Stack gap={3} aria-hidden>
            {[0, 1, 2].map((i) => (
              <HStack
                key={i}
                gap={3}
                p={4}
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="xl"
              >
                <Skeleton boxSize="40px" borderRadius="full" />
                <Stack gap={2} flex={1}>
                  <Skeleton h="12px" w="60%" borderRadius="md" />
                  <Skeleton h="10px" w="85%" borderRadius="md" />
                </Stack>
              </HStack>
            ))}
          </Stack>
          <Stack gap={1} align="center">
            <Button asChild variant="primary" w="full">
              <Link
                href={workerSetupHref(quoteFlowHref)}
                _hover={{ textDecoration: 'none' }}
              >
                Set up worker profile
              </Link>
            </Button>
            <Text fontSize="xs" color="text.muted">
              Takes ~3 minutes.
            </Text>
          </Stack>
        </Stack>
      )
      break

    case 'W3':
      body = (
        <Stack gap={4}>
          <EmptyBlock
            title="No quotes yet"
            caption="Be the first worker to make an offer on this task."
          />
          <Stack gap={2}>
            <Text fontWeight={700} color="text.default">
              Submit a quote
            </Text>
            <Text fontSize="sm" color="text.muted">
              Add your price, availability, and a message for the customer.
            </Text>
            {sendQuoteCta}
          </Stack>
        </Stack>
      )
      break

    case 'W4':
      body = (
        <Stack gap={4}>
          <Stack gap={3}>{quotes.map(competitorCard)}</Stack>
          <HStack gap={3} align="center" aria-hidden>
            <Box flex={1} h="1px" bg="border.default" />
            <Text fontSize="xs" color="text.muted" fontWeight={600}>
              Your turn
            </Text>
            <Box flex={1} h="1px" bg="border.default" />
          </HStack>
          {sendQuoteCta}
        </Stack>
      )
      break

    case 'W5': {
      const others = quotes.filter((q) => q.id !== myQuote?.id)
      body = (
        <Stack gap={4}>
          {myQuote ? (
            <Box
              borderWidth="1.5px"
              borderColor="status.success.solid"
              borderRadius="xl"
              overflow="hidden"
            >
              <QuoteCard
                variant="card"
                {...quoteCardBaseProps(myQuote)}
                statusBadge="yours"
                respondedLabel="Pending · customer reviewing"
              />
            </Box>
          ) : null}
          {others.length > 0 ? (
            <Stack gap={2}>
              <Text fontSize="sm" fontWeight={700} color="text.default">
                Other quotes
              </Text>
              <Stack gap={3}>{others.map(competitorCard)}</Stack>
            </Stack>
          ) : null}
          <Button
            asChild
            variant="ghost"
            borderWidth="1px"
            borderColor="border.default"
            w="full"
          >
            <Link href={quoteFlowHref} _hover={{ textDecoration: 'none' }}>
              Edit quote
            </Link>
          </Button>
        </Stack>
      )
      break
    }

    case 'W6': {
      const pence = myQuote ? priceToPence(myQuote.price) : null
      const posterName = task.poster?.profile?.name?.trim() || 'Customer'
      body = (
        <Stack align="center" gap={3} py={2} textAlign="center">
          <StatusCircle tone="success">
            <LuCheck size={24} strokeWidth={3} />
          </StatusCircle>
          <Stack gap={0.5}>
            <Text fontWeight={700} fontSize="lg" color="text.default">
              Quote accepted
            </Text>
            <Text fontSize="sm" color="text.muted">
              Agreed price
            </Text>
            <Text fontWeight={800} fontSize="3xl" color="text.default">
              {pence != null ? formatPoundsFromPence(pence) : '—'}
            </Text>
          </Stack>
          <HStack
            gap={3}
            p={3}
            w="full"
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="xl"
            textAlign="left"
          >
            <QuoteCardAvatar
              name={posterName}
              avatarLabel={posterName.slice(0, 2)}
              avatarUrl={task.poster?.profile?.avatarUrl}
              size="40px"
            />
            <Stack gap={0} minW={0}>
              <Text fontSize="xs" color="text.muted">
                Customer
              </Text>
              <Text fontWeight={600} truncate>
                {posterName}
              </Text>
            </Stack>
          </HStack>
          <Text fontSize="sm" color="text.muted">
            See job banner for address &amp; code.
          </Text>
          <Button asChild variant="secondary" w="full">
            <Link href="#task-order" _hover={{ textDecoration: 'none' }}>
              Open job details
            </Link>
          </Button>
        </Stack>
      )
      break
    }

    case 'W7':
      body = (
        <Stack
          align="center"
          gap={3}
          py={6}
          px={4}
          bg="bg.subtle"
          borderRadius="xl"
          textAlign="center"
        >
          <StatusCircle tone="neutral">
            <LuX size={22} />
          </StatusCircle>
          <Box
            as="span"
            px={3}
            py={0.5}
            borderRadius="full"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
            fontSize="xs"
            fontWeight={700}
            color="text.muted"
          >
            Declined
          </Box>
          <Text fontWeight={600} color="text.default" maxW="260px">
            Customer chose another worker for this task.
          </Text>
          <Text fontSize="sm" color="text.muted">
            Thanks for your offer.
          </Text>
          <Button asChild variant="secondary" w="full">
            <Link href="/tasks" _hover={{ textDecoration: 'none' }}>
              Browse other tasks
            </Link>
          </Button>
        </Stack>
      )
      break

    case 'W8':
      body = (
        <Stack align="center" gap={3} py={4} textAlign="center">
          <StatusCircle tone="success">
            <LuCheck size={24} strokeWidth={3} />
          </StatusCircle>
          <Text fontWeight={700} color="text.default">
            All worker slots filled.
          </Text>
          <Text fontSize="sm" color="text.muted" maxW="260px">
            The customer has accepted the maximum number of worker quotes.
          </Text>
          {acceptedQuotes.length > 0 ? (
            <Stack gap={2} align="center">
              <Text fontSize="xs" fontWeight={700} color="text.muted">
                Accepted workers
              </Text>
              <HStack gap={2}>
                {acceptedQuotes.map((q) => {
                  const base = quoteCardBaseProps(q)
                  return (
                    <QuoteCardAvatar
                      key={q.id}
                      name={base.name}
                      avatarLabel={base.avatarLabel}
                      avatarUrl={base.avatarUrl}
                      size="44px"
                    />
                  )
                })}
              </HStack>
            </Stack>
          ) : null}
        </Stack>
      )
      break
  }

  return (
    <ModuleShell
      subtitle={HEADER_SUBTITLES[state]}
      pill={pill}
      slotsStrip={
        state === 'C3' ? (
          <SlotsStrip filled={acceptedQuotes.length} cap={slotsCap} />
        ) : null
      }
    >
      {body}
    </ModuleShell>
  )
}
