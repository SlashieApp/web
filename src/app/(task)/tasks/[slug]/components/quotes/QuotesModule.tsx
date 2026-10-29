'use client'

import { useId, useMemo, useState } from 'react'

import { HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { QuoteStatus } from '@codegen/schema'

import { publicProfilePath } from '@/app/helpers/publicProfilePath'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { priceToPence } from '@/utils/price'
import { isAcceptedQuoteStatus } from '@/utils/taskJobSchedule'
import { formatTimeSlotLabel, isTimeSlotPast } from '@/utils/timeSlots'
import { Badge, Card, Select } from '@ui'

import { useTaskDetail } from '../../context/TaskDetailProvider'
import { TASK_DETAIL_SECTION_CARD } from '../../helpers/taskDetailLayout'
import { taskDetailQuoteRows } from '../../helpers/taskDetailQuoteRows'
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

/**
 * The approved quotes-module matrix (contact sheet v2). W7 (declined) went
 * with the Decline action (BE-113); the other names keep their numbers.
 */
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

/** What every row shows: the price, the times, the message and when it was sent. */
function quoteRowContent(
  quote: TaskQuote,
  quotesCopy: QuotesCopy,
  locale: string,
) {
  const pence = priceToPence(quote.price)
  return {
    priceLabel: pence != null ? formatPoundsFromPence(pence) : null,
    message: quote.message?.trim() || null,
    availabilityLabel: proposedTimesLabel(quote, quotesCopy, locale),
    respondedLabel: formatRespondedAgo(quote.createdAt, quotesCopy),
  }
}

/** Who sent the quote. Only the owner's rows say. */
function quoteRowWorker(
  quote: TaskQuote,
  workerFallback: string,
  taskId: string,
) {
  const name = quote.worker?.profile?.name?.trim() || workerFallback
  const profileUserId = quote.worker?.id
  return {
    name,
    avatarLabel: workerNameInitials(name, quote.workerUserId ?? quote.id),
    avatarUrl: quote.worker?.profile?.avatarUrl,
    showVerified: Boolean(quote.worker?.worker?.isVerified),
    workerProfileHref: profileUserId
      ? publicProfilePath(profileUserId, { fromTask: taskId })
      : undefined,
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

/**
 * The badge a row wears: none while the quote is live (PENDING), "Accepted"
 * once it won, and a neutral "Closed" for any other status, so one this build
 * doesn't know yet never shows as raw text.
 */
function rowStatus(status: QuoteStatus | string): QuoteRowStatus | null {
  if (status === QuoteStatus.Pending) return null
  return isAcceptedQuoteStatus(status) ? 'accepted' : 'closed'
}

/**
 * Overview Quotes section (FE-258): every quote as a row, replacing the old
 * Quotes tab. Owners sort and accept a pending quote while the task is open;
 * once someone is booked the others stay PENDING but can't be accepted
 * (BE-113). Anyone else, guests included, sees the other live quotes
 * read-only while the task is open, never who sent them (FE-370); their own
 * quote is in the Task summary. Hidden until there is a quote to list;
 * sign-in, worker setup and Send quote stay on the main CTA.
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
    taskThreadHref,
  } = useTaskDetail()
  const { requestAccept, dialog: acceptSafetyDialog } = useAcceptQuoteSafety()
  const [sort, setSort] = useState<QuoteSort>('recommended')
  const sortId = useId()

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
  const rows = taskDetailQuoteRows(isOwner ? displayQuotes : quotes, {
    isOwner,
    isOpen: permissions.isOpen,
    myQuoteId: myQuote?.id ?? null,
  })
  if (rows.length === 0) return null

  const quoteRow = (quote: TaskQuote, index: number) => {
    const content = quoteRowContent(quote, q, intlLocale)
    const withDivider = index < rows.length - 1
    if (!isOwner) {
      // Another worker's quote: the neutral label and a placeholder avatar,
      // whatever the payload holds (FE-370).
      return (
        <QuoteRow
          key={quote.id}
          {...content}
          name={fallbackWorker}
          anonymous
          withDivider={withDivider}
        />
      )
    }
    const canAct =
      quote.status === QuoteStatus.Pending && permissions.canAcceptQuote
    // BE-108: a suspended worker's quote is frozen; it is never Best match.
    const suspended = quote.workerSuspended
    return (
      <QuoteRow
        key={quote.id}
        {...content}
        {...quoteRowWorker(quote, fallbackWorker, task.id)}
        status={rowStatus(quote.status)}
        accountSuspended={suspended}
        isBestMatch={
          canAct &&
          !suspended &&
          sort === 'recommended' &&
          index === 0 &&
          rows.length > 1
        }
        onAccept={canAct ? () => requestAccept(quote.id) : undefined}
        messageHref={canAct ? taskThreadHref : undefined}
        acceptLoading={acceptingQuoteId === quote.id}
        withDivider={withDivider}
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
          <chakra.label
            htmlFor={sortId}
            fontSize="sm"
            color="text.muted"
            fontWeight={500}
            flexShrink={0}
          >
            {q.sortLabel}
          </chakra.label>
          {/*
            The shared Select, so the sort has the same shell, chevron and
            focus ring as every other drop-down. It is a list control with its
            label beside it, not a form field: 44 tall, not 48.
          */}
          <Select
            id={sortId}
            rootProps={{ maxW: '220px' }}
            value={sort}
            onChange={(e) => setSort(e.target.value as QuoteSort)}
          >
            <option value="recommended">{q.sortRecommended}</option>
            <option value="price_low">{q.sortPriceLow}</option>
            <option value="recent">{q.sortNewest}</option>
          </Select>
        </HStack>
      ) : null}
      <Stack gap={0}>{rows.map(quoteRow)}</Stack>
      {acceptSafetyDialog}
    </Card>
  )
}
