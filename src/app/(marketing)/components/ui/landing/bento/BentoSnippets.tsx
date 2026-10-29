'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Stack,
  Text,
  VisuallyHidden,
  chakra,
} from '@chakra-ui/react'
import { type ReactNode, type RefObject, useId, useState } from 'react'
import {
  LuCalendar,
  LuCheck,
  LuChevronDown,
  LuHandCoins,
  LuMapPin,
} from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { sdlFigure, sdlFocusRing, sdlMotion } from '@/theme/styles'
import { Avatar, Card, Rating } from '@ui'

import type { PhoneCopy } from '../phone/phoneCopy'
import { useTypewriter } from '../phone/useDemoBeat'
import {
  snippetConfirm,
  snippetEnter,
  useSnippetEntrance,
} from './useSnippetEntrance'

/**
 * The three bento snippets (tone refresh, train 2, item 3): small live pieces
 * of the product on a `bg.canvas` panel, drawn from the same demo bag as the
 * phone (`landing.phone`), so they add no copy. They are lightweight replicas
 * of the product's own rows (the app's components read the API and the
 * router), in neutral tokens: green only where it does a job (the selected
 * chip, the focus ring while the title types, the accepted state).
 *
 * "Live" means each one is the real thing, not a picture, and has a little
 * life: the post form types its title and takes a choice of time, the quote
 * rows arrive and open on a click, the accepted check lands. All of it plays
 * once, after hydration, when the snippet scrolls into view; reduced motion,
 * no JS and a snippet already on screen show the finished state.
 */

const ChipLabel = chakra('label')
const QuoteToggle = chakra('button')
const Figure = chakra('figure')

/**
 * The panel every snippet sits on: `bg.canvas`, a hairline, 16px corners. It is
 * a figure (a piece of the product shown as an example), named by its cell's
 * heading, like the phone demo.
 */
function SnippetPanel({
  snippet,
  labelledBy,
  panelRef,
  children,
  ...props
}: Omit<BoxProps, 'children'> & {
  snippet: string
  /** The id of the cell's heading, which names the snippet. */
  labelledBy: string
  panelRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <Figure
      ref={panelRef}
      aria-labelledby={labelledBy}
      data-bento-snippet={snippet}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      minW={0}
      p={{ base: 4, lg: 5 }}
      bg="bg.canvas"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="xl"
      {...props}
    >
      {children}
    </Figure>
  )
}

/** A form field's box, drawn like the product's input: 8px corners, a 1px `border.strong` hairline, white. */
function FieldBox({
  focused = false,
  children,
}: {
  focused?: boolean
  children: ReactNode
}) {
  return (
    <HStack
      data-bento-field=""
      minH="44px"
      px={3}
      py={2}
      gap={2}
      bg="bg.surface"
      color="text.default"
      borderRadius="md"
      borderWidth="1px"
      borderColor={focused ? 'border.focus' : 'border.strong'}
      textStyle="text-sm"
      transitionProperty="border-color"
      transitionDuration={sdlMotion.duration.moderate}
      css={{
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
    >
      {children}
    </HStack>
  )
}

/**
 * Post a task: the product's field rows (what, where, when, budget). The title
 * types itself, with the field in its focus colour while it does; "When" is a
 * real radio group (arrow keys move it), the chosen one in the selected-chip
 * colours.
 */
export function PostSnippet({
  phone,
  labelledBy,
}: {
  phone: PhoneCopy
  labelledBy: string
}) {
  const copy = phone.post
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  const [when, setWhen] = useState(0)
  const whenLabelId = useId()
  const groupName = useId()
  const title = useTypewriter(copy.whatValue, phase === 'playing', false)
  const typing = title.length < copy.whatValue.length
  const choices = [copy.whenValue, copy.whenOther]

  return (
    <SnippetPanel snippet="post" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={4}>
        <Stack gap={1.5} style={snippetEnter(phase, 0)}>
          <Text textStyle="label-md">{copy.whatLabel}</Text>
          <FieldBox focused={typing}>
            <Text as="span" minW={0} data-bento-title="">
              {title}
              {typing ? (
                <Box
                  as="span"
                  aria-hidden
                  display="inline-block"
                  w="2px"
                  h="1.1em"
                  ml="1px"
                  bg="text.default"
                  verticalAlign="text-bottom"
                />
              ) : null}
            </Text>
          </FieldBox>
        </Stack>

        <Stack gap={1.5} style={snippetEnter(phase, 1)}>
          <Text textStyle="label-md">{copy.whereLabel}</Text>
          <FieldBox>
            <Box as="span" display="inline-flex" color="text.muted" aria-hidden>
              <LuMapPin size={16} />
            </Box>
            <Text as="span">{copy.whereValue}</Text>
          </FieldBox>
        </Stack>

        <Stack gap={1.5} style={snippetEnter(phase, 2)}>
          <Text id={whenLabelId} textStyle="label-md">
            {copy.whenLabel}
          </Text>
          <HStack role="radiogroup" aria-labelledby={whenLabelId} gap={2}>
            {choices.map((choice, index) => (
              <ChipLabel
                key={choice}
                display="inline-flex"
                alignItems="center"
                h="36px"
                px={3.5}
                borderRadius="full"
                borderWidth="1px"
                borderColor="border.strong"
                bg="bg.surface"
                color="text.default"
                textStyle="label-md"
                cursor="pointer"
                transitionProperty="background-color, border-color, color"
                transitionDuration={sdlMotion.duration.moderate}
                css={{
                  touchAction: 'manipulation',
                  '&:not(:has(input:checked)):hover': {
                    borderColor: 'border.hover',
                  },
                  '&:has(input:checked)': {
                    bg: 'status.success.soft',
                    borderColor: 'status.success.border',
                    color: 'status.success.fg',
                  },
                  '&:has(input:focus-visible)': sdlFocusRing,
                  '@media (prefers-reduced-motion: reduce)': {
                    transition: 'none',
                  },
                }}
              >
                <VisuallyHidden asChild>
                  <input
                    type="radio"
                    name={groupName}
                    checked={when === index}
                    onChange={() => setWhen(index)}
                  />
                </VisuallyHidden>
                {choice}
              </ChipLabel>
            ))}
          </HStack>
        </Stack>

        <Stack gap={1.5} style={snippetEnter(phase, 3)}>
          <Text textStyle="label-md">{copy.budgetLabel}</Text>
          <FieldBox>
            <Text as="span" {...sdlFigure}>
              {copy.budgetValue}
            </Text>
          </FieldBox>
        </Stack>
      </Stack>
    </SnippetPanel>
  )
}

type QuoteItem = PhoneCopy['quotes']['items'][number]

/**
 * One quote as a row, like the product's: avatar, name and rating, the price
 * in ink at 600 with tabular figures, and the message under it. The name is
 * the toggle (a real button with `aria-expanded`); a stretched pseudo-element
 * makes the whole card its target without nesting blocks inside a button.
 */
function QuoteCard({
  quote,
  copy,
  open,
  onToggle,
  style,
}: {
  quote: QuoteItem
  copy: PhoneCopy['quotes']
  open: boolean
  onToggle: () => void
  style?: BoxProps['style']
}) {
  return (
    <Card
      data-bento-quote={quote.name}
      p={3}
      maxW="full"
      position="relative"
      borderColor={open ? 'border.hover' : 'border.default'}
      transitionProperty="border-color, box-shadow"
      transitionDuration={sdlMotion.duration.moderate}
      css={{
        '&:hover': { borderColor: 'border.hover' },
        '&:has(button:focus-visible)': sdlFocusRing,
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
      }}
      style={style}
    >
      <HStack gap={3} align="center">
        <Avatar name={quote.name} size="lg" />
        <Stack gap={0.5} flex={1} minW={0}>
          <QuoteToggle
            type="button"
            aria-expanded={open}
            aria-label={formatMessage(copy.expand, { name: quote.name })}
            onClick={onToggle}
            alignSelf="flex-start"
            display="inline-flex"
            alignItems="center"
            gap={1}
            p={0}
            bg="transparent"
            textAlign="start"
            cursor="pointer"
            color="text.default"
            fontSize="15px"
            lineHeight="20px"
            fontWeight={500}
            letterSpacing="-0.01em"
            outline="none"
            css={{
              touchAction: 'manipulation',
              '&::after': { content: '""', position: 'absolute', inset: 0 },
            }}
          >
            {quote.name}
            <Box
              as="span"
              aria-hidden
              display="inline-flex"
              color="text.subtle"
              transform={open ? 'rotate(180deg)' : 'none'}
              transitionProperty="transform"
              transitionDuration={sdlMotion.duration.moderate}
              transitionTimingFunction={sdlMotion.easing.standard}
              css={{
                '@media (prefers-reduced-motion: reduce)': {
                  transition: 'none',
                },
              }}
            >
              <LuChevronDown size={14} />
            </Box>
          </QuoteToggle>
          <HStack gap={1}>
            <Rating value={quote.rating} size="sm" />
            <Text textStyle="text-xs" color="text.muted">
              {formatMessage(copy.reviews, { count: quote.reviews })}
            </Text>
          </HStack>
        </Stack>
        <Text
          as="span"
          flexShrink={0}
          fontSize="18px"
          lineHeight="24px"
          color="text.default"
          {...sdlFigure}
        >
          {quote.price}
        </Text>
      </HStack>
      <Text
        mt={2.5}
        textStyle="text-sm"
        color="text.muted"
        lineClamp={open ? undefined : 1}
      >
        {quote.note}
      </Text>
      {open ? (
        <HStack
          mt={2}
          gap={1.5}
          flexWrap="wrap"
          textStyle="text-xs"
          color="text.muted"
        >
          <Text as="span">
            {formatMessage(copy.jobs, { count: quote.jobs })}
          </Text>
          <Text as="span" aria-hidden>
            ·
          </Text>
          <Text as="span">{copy.replies}</Text>
        </HStack>
      ) : null}
    </Card>
  )
}

/**
 * Compare quotes: three quote rows arrive one after another; the first is
 * open, and a click (or Enter, or Space) opens another and closes the rest.
 */
export function QuotesSnippet({
  phone,
  labelledBy,
}: {
  phone: PhoneCopy
  labelledBy: string
}) {
  const copy = phone.quotes
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <SnippetPanel snippet="quotes" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={3}>
        {copy.items.map((quote, index) => (
          <QuoteCard
            key={quote.name}
            quote={quote}
            copy={copy}
            open={openIndex === index}
            onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
            style={snippetEnter(phase, index)}
          />
        ))}
      </Stack>
    </SnippetPanel>
  )
}

/**
 * Hire and pay directly: the chosen quote with its booking, then the accepted
 * row, the one place the snippets use green as state (success: a soft tint, a
 * 1px success border and a green 400 check with an ink glyph). The check
 * scales in on the emphasis curve, the SDL's confirmation easing.
 */
export function AcceptedSnippet({
  phone,
  labelledBy,
}: {
  phone: PhoneCopy
  labelledBy: string
}) {
  const copy = phone.hire
  // The quote the customer chose is the first one, as in the phone demo.
  const quote = phone.quotes.items[0]
  const { ref, phase } = useSnippetEntrance<HTMLDivElement>()

  return (
    <SnippetPanel snippet="accepted" labelledBy={labelledBy} panelRef={ref}>
      <Stack gap={3}>
        <Card p={4} maxW="full" style={snippetEnter(phase, 0)}>
          <HStack gap={3} align="center">
            <Avatar name={quote.name} size="lg" />
            <Stack gap={0.5} flex={1} minW={0}>
              <Text
                fontSize="15px"
                lineHeight="20px"
                fontWeight={500}
                letterSpacing="-0.01em"
              >
                {quote.name}
              </Text>
              <HStack gap={1}>
                <Rating value={quote.rating} size="sm" />
                <Text textStyle="text-xs" color="text.muted">
                  {formatMessage(phone.quotes.reviews, {
                    count: quote.reviews,
                  })}
                </Text>
              </HStack>
            </Stack>
            <Text
              as="span"
              flexShrink={0}
              fontSize="18px"
              lineHeight="24px"
              color="text.default"
              {...sdlFigure}
            >
              {copy.price}
            </Text>
          </HStack>
          <Stack
            gap={2.5}
            mt={4}
            pt={4}
            borderTopWidth="1px"
            borderColor="border.default"
            textStyle="text-sm"
          >
            <HStack gap={2} align="flex-start">
              <Box
                as="span"
                display="inline-flex"
                mt="3px"
                color="text.muted"
                aria-hidden
              >
                <LuCalendar size={14} />
              </Box>
              <Text as="span" fontWeight={500}>
                {copy.when}
              </Text>
            </HStack>
            <HStack gap={2} align="flex-start" color="text.muted">
              <Box as="span" display="inline-flex" mt="3px" aria-hidden>
                <LuHandCoins size={14} />
              </Box>
              <Text as="span">{copy.note}</Text>
            </HStack>
          </Stack>
        </Card>

        <HStack
          data-bento-accepted=""
          gap={3}
          p={4}
          align="center"
          bg="status.success.soft"
          borderWidth="1px"
          borderColor="status.success.border"
          borderRadius="lg"
          style={snippetEnter(phase, 1)}
        >
          <Box
            data-bento-check=""
            aria-hidden
            boxSize="36px"
            flexShrink={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="full"
            bg="action.primary"
            color="text.onGreen"
            style={snippetConfirm(phase, 1)}
          >
            <LuCheck size={20} strokeWidth={2.5} />
          </Box>
          <Stack gap={0.5} minW={0}>
            <Text textStyle="label-md">{copy.acceptedTitle}</Text>
            <Text textStyle="text-sm" color="text.muted">
              {copy.acceptedBody}
            </Text>
          </Stack>
        </HStack>
      </Stack>
    </SnippetPanel>
  )
}
