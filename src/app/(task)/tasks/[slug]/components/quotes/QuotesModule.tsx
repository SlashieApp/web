'use client'

import { useMemo, useState } from 'react'

import { HStack, NativeSelect, Stack, Text } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'

import { workerProfilePath } from '@/app/(worker)/workers/[slug]/helpers/workerProfileHelpers'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { priceToPence } from '@/utils/price'
import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Badge, Card } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import type { TaskDetailRecord } from '../../helpers/taskDetailUtils'
import {
  formatPoundsFromPence,
  workerQuoteAvatarLabel,
} from '../../helpers/taskDetailUtils'
import bag from '../../i11n.json'
import { QuoteRow, type QuoteRowStatus } from './QuoteRow'
import { useAcceptQuoteSafety } from './useAcceptQuoteSafety'

type TaskQuote = TaskDetailRecord['quotes'][number]
type TaskDetailI11n = (typeof bag)['en']
type QuotesCopy = TaskDetailI11n['quotes']

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

function formatRespondedAgo(
  iso: string | null | undefined,
  q: QuotesCopy,
): string | null {
  if (!iso?.trim()) return null
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return null
  const diffMs = Date.now() - t
  if (diffMs < 0) return q.respondedJustNow
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return q.respondedJustNow
  if (mins < 60) return formatMessage(q.respondedMinutes, { count: mins })
  const hours = Math.floor(mins / 60)
  if (hours < 48) {
    return formatMessage(hours === 1 ? q.respondedHour : q.respondedHours, {
      count: hours,
    })
  }
  const days = Math.floor(hours / 24)
  return formatMessage(days === 1 ? q.respondedDay : q.respondedDays, {
    count: days,
  })
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

/** The quote's proposed times on one line; passed times are marked. */
function proposedTimesLabel(
  quote: TaskQuote,
  quotesCopy: QuotesCopy,
  locale: string,
): string | null {
  if (quote.proposedSlots.length === 0) return null
  return quote.proposedSlots
    .map((slot) => {
      const label = formatTimeSlotLabel(slot, locale)
      return isTimeSlotPast(slot) ? `${label} (${quotesCopy.pastSlot})` : label
    })
    .join(' · ')
}

function quoteCardBaseProps(
  quote: TaskQuote,
  workerFallback: string,
  quotesCopy: QuotesCopy,
  locale: string,
) {
  const pence = priceToPence(quote.price)
  const name = quote.worker?.profile?.name?.trim() || workerFallback
  return {
    name,
    avatarLabel: workerNameInitials(name, quote.workerUserId),
    avatarUrl: quote.worker?.profile?.avatarUrl,
    priceLabel: pence != null ? formatPoundsFromPence(pence) : '—',
    showPrice: pence != null,
    message: quote.message?.trim() || null,
    availabilityLabel: proposedTimesLabel(quote, quotesCopy, locale),
    showVerified: Boolean(quote.worker?.worker?.isVerified),
  }
}

// ------------------------------------------------------------------ module

export type QuotesModuleProps = {
  /**
   * Accepted-worker cap. The API's current model is single-worker (a task is
   * full at 1 accepted quote).
   */
  slotsCap?: number
}

function rowStatus(status: QuoteStatus | string): QuoteRowStatus | null {
  if (isAcceptedQuoteStatus(status)) return 'accepted'
  if (status === QuoteStatus.Declined) return 'declined'
  if (status === QuoteStatus.NotSelected) return 'notSelected'
  return null
}

/**
 * Overview Quotes section (FE-258): every quote as a row, replacing the old
 * Quotes tab. Owners sort and accept or decline; workers see the other
 * quotes read-only (their own is in the Task summary). Hidden until there is
 * a quote to list; sign-in, worker setup and Send quote stay on the main CTA.
 */
export function QuotesModule({ slotsCap = 1 }: QuotesModuleProps) {
  const t = useI11n(bag)
  const { quotes: q, fallbackWorker } = t
  const intlLocale = useLocale() === 'zh-hk' ? 'zh-HK' : 'en-GB'
  const {
    task,
    permissions,
    isAuthenticated,
    myQuote,
    sortedQuotes,
    acceptError,
    acceptingQuoteId,
    decliningQuoteId,
    onDeclineQuote,
    taskThreadHref,
  } = useTaskDetail()
  const { requestAccept, dialog: acceptSafetyDialog } = useAcceptQuoteSafety()
  const [sort, setSort] = useState<QuoteSort>('recommended')

  const quotes = task?.quotes ?? []
  const acceptedCount = quotes.filter((qq) =>
    isAcceptedQuoteStatus(qq.status),
  ).length
  const state = deriveQuotesModuleState({
    isOwner: permissions.isOwner,
    isOpen: permissions.isOpen,
    isAuthenticated,
    hasWorkerProfile: permissions.hasWorkerProfile,
    canSubmitQuote: permissions.canSubmitQuote,
    quoteCount: quotes.length,
    acceptedCount,
    slotsCap,
    myQuoteStatus: (myQuote?.status as QuoteStatus | undefined) ?? null,
  })
  const displayQuotes = useMemo(
    () => sortQuotes(sortedQuotes, sort),
    [sortedQuotes, sort],
  )

  // The accepted worker's agreement lives on the Booking card.
  if (!task || state === 'W6') return null

  const isOwner = permissions.isOwner
  // A worker's own quote is in the Task summary (FE-274); list the others.
  const rows = isOwner
    ? displayQuotes
    : quotes.filter((qq) => qq.id !== myQuote?.id)
  if (rows.length === 0) return null

  const quoteRow = (quote: TaskQuote, index: number) => {
    const canAct =
      isOwner &&
      quote.status === QuoteStatus.Pending &&
      permissions.showAcceptDecline
    const profileUserId = quote.worker?.id
    return (
      <QuoteRow
        key={quote.id}
        {...quoteCardBaseProps(quote, fallbackWorker, q, intlLocale)}
        respondedLabel={formatRespondedAgo(quote.createdAt, q)}
        status={rowStatus(quote.status)}
        isBestMatch={
          canAct && sort === 'recommended' && index === 0 && rows.length > 1
        }
        workerProfileHref={
          profileUserId ? workerProfilePath(profileUserId, task.id) : undefined
        }
        onAccept={canAct ? () => requestAccept(quote.id) : undefined}
        onDecline={canAct ? () => void onDeclineQuote(quote.id) : undefined}
        messageHref={canAct ? taskThreadHref : undefined}
        acceptLoading={acceptingQuoteId === quote.id}
        declineLoading={decliningQuoteId === quote.id}
        withDivider={index < rows.length - 1}
      />
    )
  }

  return (
    <Card
      {...TASK_DETAIL_SECTION_CARD}
      id="task-quotes"
      eyebrow={q.heading}
      headingAccessory={
        <Badge variant="neutral" size="sm" shape="pill">
          {rows.length}
        </Badge>
      }
    >
      {acceptError ? (
        <Text color="status.danger.fg" fontSize="sm">
          {acceptError}
        </Text>
      ) : null}
      {isOwner && rows.length > 1 ? (
        <HStack gap={2} align="center">
          <Text
            fontSize="sm"
            color="text.muted"
            fontWeight={500}
            flexShrink={0}
          >
            {q.sortLabel}
          </Text>
          <NativeSelect.Root w="full" maxW="220px" size="sm">
            <NativeSelect.Field
              bg="bg.surface"
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="lg"
              fontSize="sm"
              value={sort}
              onChange={(e) => setSort(e.target.value as QuoteSort)}
            >
              <option value="recommended">{q.sortRecommended}</option>
              <option value="price_low">{q.sortPriceLow}</option>
              <option value="recent">{q.sortNewest}</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </HStack>
      ) : null}
      <Stack gap={0}>{rows.map(quoteRow)}</Stack>
      {acceptSafetyDialog}
    </Card>
  )
}
