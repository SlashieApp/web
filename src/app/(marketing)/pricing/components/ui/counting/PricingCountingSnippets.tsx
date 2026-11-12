'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { CSSProperties } from 'react'
import { LuCheck, LuPencil, LuSparkles } from 'react-icons/lu'

import { SnippetPanel } from '@/app/(marketing)/components/ui/landing/bento/BentoSnippets'
import {
  type SnippetPhase,
  snippetConfirm,
  snippetEnter,
  useSnippetEntrance,
} from '@/app/(marketing)/components/ui/landing/bento/useSnippetEntrance'
import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlFigure, sdlMotion } from '@/theme/styles'
import { Card } from '@ui'

import type messages from '../../../i11n.json'

export type CountingCopy = (typeof messages)['en']['counting']
import type { DemoTask } from './countingDemoTasks'

/** At most this many segments on the meter; a bigger allowance shows as a plain count. */
const METER_MAX_SEGMENTS = 10

/** Stable keys for the meter's segments (each is the nth quote of the month). */
const SEGMENT_IDS = Array.from(
  { length: METER_MAX_SEGMENTS },
  (_, i) => `quote-${i + 1}`,
)

/** One quoted task: its title, the quote's price and that the quote was sent. */
function QuoteRow({
  task,
  price,
  status,
  style,
}: {
  task: string
  price: string
  status: string
  style?: CSSProperties
}) {
  return (
    <Card p={3} maxW="full" style={style} data-pricing-quote-row="">
      <HStack gap={3} align="center">
        <Stack gap={0.5} flex={1} minW={0}>
          <Text textStyle="text-sm" fontWeight={500} lineClamp={1}>
            {task}
          </Text>
          <HStack gap={1.5} color="text.muted">
            <Box as="span" display="inline-flex" aria-hidden>
              <LuCheck size={12} strokeWidth={2.5} />
            </Box>
            <Text as="span" textStyle="text-xs">
              {status}
            </Text>
          </HStack>
        </Stack>
        <Text
          as="span"
          flexShrink={0}
          fontSize="15px"
          lineHeight="20px"
          {...sdlFigure}
        >
          {price}
        </Text>
      </HStack>
    </Card>
  )
}

/**
 * The plan's quote meter, as a worker sees it: the plan's name, how much of
 * the month's allowance is used, and a bar of one segment per free quote.
 * The segments fill one by one once the snippet plays.
 */
function QuotaMeter({
  copy,
  used,
  count,
  phase,
  index,
}: {
  copy: CountingCopy['snippet']
  used: number
  count: number
  phase: SnippetPhase
  index: number
}) {
  const segments = Math.min(count, METER_MAX_SEGMENTS)
  return (
    <Box
      data-pricing-meter=""
      p={4}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      style={snippetEnter(phase, index)}
    >
      <HStack justify="space-between" gap={3} mb={3}>
        <Text textStyle="label-md">{copy.freePlan}</Text>
        <Text textStyle="text-xs" color="text.muted" {...sdlFigure}>
          {formatMessage(copy.used, { used, count })}
        </Text>
      </HStack>
      {count <= METER_MAX_SEGMENTS ? (
        <HStack gap={1.5} aria-hidden>
          {SEGMENT_IDS.slice(0, segments).map((id, i) => {
            const filled = i < used
            return (
              <Box
                key={id}
                flex={1}
                h="6px"
                borderRadius="full"
                bg="bg.subtle"
                overflow="hidden"
              >
                <Box
                  h="full"
                  // Ink, not green: green is kept for the page's actions.
                  bg="text.default"
                  borderRadius="full"
                  transformOrigin="left"
                  style={segmentFill(phase, filled, index + 1 + i)}
                />
              </Box>
            )
          })}
        </HStack>
      ) : null}
      <Text textStyle="text-xs" color="text.muted" mt={3}>
        {copy.resets}
      </Text>
    </Box>
  )
}

/** A meter segment: filled ones grow in from the left, one after another. */
function segmentFill(
  phase: SnippetPhase,
  filled: boolean,
  index: number,
): CSSProperties {
  if (!filled) return { transform: 'scaleX(0)' }
  if (phase === 'static') return { transform: 'none' }
  if (phase === 'waiting') return { transform: 'scaleX(0)' }
  return {
    transform: 'none',
    transition: `transform ${sdlMotion.duration.slow} ${sdlMotion.easing.decelerate} ${index * 120}ms`,
  }
}

/**
 * Free quotes: three tasks quoted this month, then the meter full. The count
 * is the live allowance from the API (`freeQuotesPerMonth`); the rows are the
 * landing's demo tasks, so the snippet adds no copy of its own but the labels.
 */
export function FreeQuotesSnippet({
  copy,
  tasks,
  count,
  labelledBy,
}: {
  copy: CountingCopy['snippet']
  tasks: readonly DemoTask[]
  count: number
  labelledBy: string
}) {
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  const shown = tasks.slice(0, Math.min(count, 3))
  return (
    <SnippetPanel snippet="free-quotes" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={2.5}>
        {shown.map((task, i) => (
          <QuoteRow
            key={task.title}
            task={task.title}
            price={task.price}
            status={copy.sent}
            style={snippetEnter(phase, i)}
          />
        ))}
        <QuotaMeter
          copy={copy}
          used={shown.length}
          count={count}
          phase={phase}
          index={shown.length}
        />
      </Stack>
    </SnippetPanel>
  )
}

/** One step in a quote's history: what happened and the price it left. */
function HistoryLine({
  status,
  price,
  edited = false,
  past = false,
}: {
  status: string
  price: string
  edited?: boolean
  /** An earlier step: muted, its price struck. */
  past?: boolean
}) {
  return (
    <HStack
      as="li"
      gap={2}
      justify="space-between"
      color={past ? 'text.muted' : 'text.default'}
    >
      <HStack gap={1.5} minW={0}>
        <Box as="span" display="inline-flex" aria-hidden>
          {edited ? (
            <LuPencil size={12} />
          ) : (
            <LuCheck size={12} strokeWidth={2.5} />
          )}
        </Box>
        <Text as="span" textStyle="text-xs">
          {status}
        </Text>
      </HStack>
      <Text
        as={past ? 's' : 'span'}
        textStyle="text-sm"
        {...sdlFigure}
        fontWeight={past ? 400 : 600}
        color={past ? 'text.subtle' : undefined}
      >
        {price}
      </Text>
    </HStack>
  )
}

/**
 * Edits count once: one quote, sent and then updated with a new price, in one
 * card (one quote), and the meter at one.
 */
export function EditedQuoteSnippet({
  copy,
  task,
  wasPrice,
  count,
  labelledBy,
}: {
  copy: CountingCopy['snippet']
  task: DemoTask
  /** The price before the edit. */
  wasPrice: string
  count: number
  labelledBy: string
}) {
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  return (
    <SnippetPanel snippet="edited-quote" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={2.5}>
        <Card
          p={3}
          maxW="full"
          data-pricing-quote-row=""
          style={snippetEnter(phase, 0)}
        >
          <Text textStyle="text-sm" fontWeight={500} lineClamp={1} mb={2.5}>
            {task.title}
          </Text>
          <Stack
            as="ul"
            listStyleType="none"
            gap={2}
            pt={2.5}
            borderTopWidth="1px"
            borderColor="border.default"
          >
            <HistoryLine status={copy.sent} price={wasPrice} past />
            <Box style={snippetEnter(phase, 1)}>
              <HistoryLine status={copy.updated} price={task.price} edited />
            </Box>
          </Stack>
        </Card>
        <QuotaMeter
          copy={copy}
          used={1}
          count={count}
          phase={phase}
          index={2}
        />
      </Stack>
    </SnippetPanel>
  )
}

/**
 * Slashie Unlimited: the plan's card in its plum, "Unlimited quotes", and
 * more quotes sent past the free allowance, with no meter.
 */
export function UnlimitedSnippet({
  copy,
  productName,
  tasks,
  labelledBy,
}: {
  copy: CountingCopy['snippet']
  productName: string
  tasks: readonly DemoTask[]
  labelledBy: string
}) {
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  return (
    <SnippetPanel snippet="unlimited" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={2.5}>
        <HStack
          data-pricing-unlimited=""
          gap={3}
          p={4}
          align="center"
          bg="bg.surface"
          borderWidth="1px"
          borderColor="accent.premium"
          borderRadius="lg"
          style={snippetEnter(phase, 0)}
        >
          <Box
            aria-hidden
            boxSize="36px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg="accent.premium"
            color="white"
            style={snippetConfirm(phase, 0)}
          >
            <LuSparkles size={18} />
          </Box>
          <Stack gap={0.5} minW={0}>
            <Text textStyle="label-md" color="accent.premium">
              {productName}
            </Text>
            <Text textStyle="text-sm" color="text.muted">
              {copy.unlimited}
            </Text>
          </Stack>
        </HStack>
        {tasks.map((task, i) => (
          <QuoteRow
            key={task.title}
            task={task.title}
            price={task.price}
            status={copy.sent}
            style={snippetEnter(phase, i + 1)}
          />
        ))}
      </Stack>
    </SnippetPanel>
  )
}
