'use client'

import { Box, Stack } from '@chakra-ui/react'
import { type ReactNode, useEffect, useState } from 'react'
import { LuEye } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'

import { phoneCropFade } from '../PhoneFrame'
import type { PhoneCopy } from '../phoneCopy'
import { CompactBar } from '../phoneParts'
import { enterStyle, useDemoBeat } from '../useDemoBeat'
import {
  AppQuoteRow,
  PinnedAction,
  PinnedBar,
  QuoteNotice,
  QuotesHead,
  TaskAppBar,
} from './taskPageParts'

/** How long the new quote's banner stays before it leaves. */
const NOTICE_MS = 2600

/**
 * A row that is not in the list yet: it opens (its height and its opacity) as
 * the quote arrives, so the rows below move down with it.
 */
function Arriving({
  open,
  children,
}: {
  open: boolean
  children: ReactNode
}) {
  return (
    <Box
      display="grid"
      gridTemplateRows={open ? '1fr' : '0fr'}
      opacity={open ? 1 : 0}
      aria-hidden={!open}
      transition="grid-template-rows 360ms cubic-bezier(0.2, 0, 0, 1), opacity 360ms cubic-bezier(0.2, 0, 0, 1)"
    >
      <Box overflow="hidden" minH={0}>
        {children}
      </Box>
    </Box>
  )
}

/**
 * The customer's task page on its quotes, as the app draws it: the collapsed
 * app bar, "Quotes" with its count, each quote as the task page's row (the
 * worker, Best match on the best one, when they can come, the price, their
 * message, Message and Accept) and Preview pinned at the foot. Two quotes are
 * in; the beat brings a third, with the app's banner for it, and the count
 * goes up. `compact` is the cropped phone's layout: the task in the bar and
 * the rows, which fade out toward the crop.
 */
export function QuotesScreen({
  copy,
  active,
  intro,
  compact = false,
}: {
  copy: PhoneCopy
  active: boolean
  intro?: boolean
  compact?: boolean
}) {
  const { entered, done, reduced } = useDemoBeat(active, intro)
  const task = copy.tasks.hedge
  const t = copy.quotes
  // Cheapest first, as the page lists them: the middle one is the arrival.
  const [best, arriving, last] = t.items
  const count = done ? t.items.length : t.items.length - 1

  // The banner shows the new quote, then leaves (never under reduced motion,
  // which rests on the three quotes).
  const [notice, setNotice] = useState(false)
  useEffect(() => {
    if (!done || reduced) {
      setNotice(false)
      return
    }
    setNotice(true)
    const hide = window.setTimeout(() => setNotice(false), NOTICE_MS)
    return () => window.clearTimeout(hide)
  }, [done, reduced])

  const banner = notice ? (
    <QuoteNotice
      title={formatMessage(t.sentQuote, { name: arriving.name })}
      body={`${arriving.price} · ${arriving.note}`}
      compact={compact}
    />
  ) : null

  const rows = (
    <>
      <Box style={enterStyle(entered, 0)}>
        <AppQuoteRow quote={best} copy={t} best compact={compact} />
      </Box>
      <Arriving open={done}>
        <AppQuoteRow quote={arriving} copy={t} compact={compact} />
      </Arriving>
      <Box style={enterStyle(entered, 1)}>
        <AppQuoteRow quote={last} copy={t} compact={compact} divider={false} />
      </Box>
    </>
  )

  if (compact) {
    return (
      <Box position="absolute" inset={0} bg="bg.surface">
        <CompactBar
          icon="back"
          title={task.title}
          sub={`${task.area} · ${formatMessage(copy.search.quotes, { count })}`}
        />
        {/* The list starts under the 44px bar and fades out toward the crop. */}
        <Stack gap={0} px="12px" pt="10px" css={phoneCropFade(44)}>
          <QuotesHead label={t.heading} count={count} compact />
          {rows}
        </Stack>
        {banner}
      </Box>
    )
  }

  return (
    <Box position="absolute" inset={0} bg="bg.surface">
      <TaskAppBar title={task.title} />
      <Stack gap={0} px="16px" pt="16px">
        <QuotesHead label={t.heading} count={count} />
        {rows}
      </Stack>
      <PinnedBar>
        <PinnedAction icon={<LuEye size={16} aria-hidden />}>
          {t.preview}
        </PinnedAction>
      </PinnedBar>
      {banner}
    </Box>
  )
}
