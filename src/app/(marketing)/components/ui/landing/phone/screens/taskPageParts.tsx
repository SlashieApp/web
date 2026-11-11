'use client'

import { Box, type BoxProps, HStack, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import {
  LuArrowLeft,
  LuEllipsisVertical,
  LuMessageCircle,
} from 'react-icons/lu'

import { sdlElevation } from '@/theme/styles'

import type { PhoneCopy } from '../phoneCopy'

/**
 * The owner's task page as the app draws it, for the phone demos (Quotes and
 * Hire): the collapsed app bar, the Quotes head, a quote row, the pinned
 * action bar and the in-app notice for a new quote. Replicas in SDL tokens,
 * not the app's components (those pull in Apollo, auth and routing); the
 * labels are the task page's own strings (`phoneAppCopy.test.ts`).
 */

export type DemoQuote = PhoneCopy['quotes']['items'][number]

/** The task page's name-seeded gradient (`QuoteAvatar`): the same name wears the same colours. */
function avatarGradient(seed: string): string {
  let h = 0
  for (let i = 0; i < seed.length; i += 1)
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hue = h % 360
  return `linear-gradient(135deg, hsl(${hue} 55% 42%) 0%, hsl(${(hue + 40) % 360} 60% 36%) 100%)`
}

/** A worker with no photo: their first letter on their gradient, as the task page shows it. */
export function QuoteDisc({
  name,
  size = 40,
}: { name: string; size?: number }) {
  return (
    <Box
      w={`${size}px`}
      h={`${size}px`}
      flexShrink={0}
      borderRadius="full"
      style={{ background: avatarGradient(name) }}
      color="white"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={`${Math.max(12, Math.round(size * 0.38))}px`}
      fontWeight={500}
      aria-hidden
    >
      {name.trim().charAt(0)}
    </Box>
  )
}

/** The task page's app bar once the title has collapsed into it: back, the title, the menu. */
export function TaskAppBar({ title }: { title: string }) {
  return (
    <HStack
      h="52px"
      flexShrink={0}
      px="8px"
      gap="4px"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      <Box
        w="40px"
        h="40px"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        aria-hidden
      >
        <LuArrowLeft size={20} />
      </Box>
      <Text
        flex={1}
        minW={0}
        fontSize="16px"
        lineHeight="24px"
        fontWeight={500}
        letterSpacing="-0.01em"
        lineClamp={1}
      >
        {title}
      </Text>
      <Box
        w="40px"
        h="40px"
        display="inline-flex"
        alignItems="center"
        justifyContent="center"
        aria-hidden
      >
        <LuEllipsisVertical size={20} />
      </Box>
    </HStack>
  )
}

/** "QUOTES" and how many there are: the section's eyebrow. */
export function QuotesHead({
  label,
  count,
  compact = false,
}: {
  label: string
  count: number
  compact?: boolean
}) {
  return (
    <HStack gap="8px" data-quotes-head="">
      <Text
        fontSize={compact ? '11px' : '12px'}
        lineHeight="16px"
        fontWeight={500}
        letterSpacing="0.08em"
        textTransform="uppercase"
        color="text.subtle"
      >
        {label}
      </Text>
      <Box
        minW="20px"
        px="6px"
        borderRadius="full"
        bg="bg.subtle"
        textAlign="center"
        fontSize={compact ? '11px' : '12px'}
        lineHeight="18px"
        fontWeight={600}
        fontVariantNumeric="tabular-nums"
        data-quotes-count=""
      >
        {count}
      </Box>
    </HStack>
  )
}

/** The green Accept pill of a quote row (the Hire demo makes one its tap target). */
export function AcceptPill({
  label,
  compact = false,
}: {
  label: string
  compact?: boolean
}) {
  return (
    <Box
      h={compact ? '32px' : '40px'}
      px={compact ? '14px' : '16px'}
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      display="flex"
      alignItems="center"
      justifyContent="center"
      fontSize={compact ? '13px' : '14px'}
      fontWeight={500}
    >
      {label}
    </Box>
  )
}

/**
 * One quote, as the task page's `QuoteRow` lays it out for the owner: the
 * worker (with Best match on the best one), when they can come and how fast
 * they answered, the price, their message, then Message and Accept.
 */
export function AppQuoteRow({
  quote,
  copy,
  best = false,
  compact = false,
  divider = true,
  accept,
}: {
  quote: DemoQuote
  copy: PhoneCopy['quotes']
  best?: boolean
  compact?: boolean
  divider?: boolean
  /** The Accept control, when the screen makes it a tap target. */
  accept?: ReactNode
}) {
  return (
    <Stack
      gap={compact ? '6px' : '8px'}
      py={compact ? '10px' : '16px'}
      borderBottomWidth={divider ? '1px' : 0}
      borderColor="border.default"
      data-quote-row={quote.name}
    >
      <HStack align="flex-start" gap={compact ? '10px' : '12px'}>
        <QuoteDisc name={quote.name} size={compact ? 32 : 40} />
        <Stack gap="2px" flex={1} minW={0}>
          <HStack gap="6px" flexWrap="wrap" align="center">
            <Text
              fontSize={compact ? '13px' : '16px'}
              lineHeight={compact ? '18px' : '24px'}
              fontWeight={500}
            >
              {quote.name}
            </Text>
            {best ? (
              <Box
                px="8px"
                borderRadius="full"
                bg="status.success.soft"
                color="status.success.fg"
                fontSize={compact ? '11px' : '12px'}
                lineHeight="20px"
                fontWeight={500}
                whiteSpace="nowrap"
              >
                {copy.bestMatch}
              </Box>
            ) : null}
          </HStack>
          <Text
            fontSize={compact ? '11px' : '12px'}
            lineHeight="16px"
            color="text.muted"
            lineClamp={1}
          >
            {quote.slot} · {copy.responded}
          </Text>
        </Stack>
        <Text
          flexShrink={0}
          fontSize={compact ? '14px' : '18px'}
          lineHeight={compact ? '18px' : '24px'}
          fontWeight={600}
          fontVariantNumeric="tabular-nums"
        >
          {quote.price}
        </Text>
      </HStack>
      <Text
        fontSize={compact ? '12px' : '14px'}
        lineHeight={compact ? '17px' : '22px'}
        color="text.muted"
        lineClamp={compact ? 1 : 2}
      >
        {quote.note}
      </Text>
      <HStack gap="8px" justify="flex-end">
        <Box
          w={compact ? '32px' : '40px'}
          h={compact ? '32px' : '40px'}
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          aria-hidden
        >
          <LuMessageCircle size={18} />
        </Box>
        {accept ?? <AcceptPill label={copy.accept} compact={compact} />}
      </HStack>
    </Stack>
  )
}

/** The bar pinned at the foot of the task page: its main action, over the home indicator. */
export function PinnedBar({ children, ...props }: BoxProps) {
  return (
    <Box
      position="absolute"
      left={0}
      right={0}
      bottom={0}
      px="16px"
      pt="12px"
      pb="34px"
      bg="bg.surface"
      borderTopWidth="1px"
      borderColor="border.default"
      {...props}
    >
      {children}
    </Box>
  )
}

/** A full-width green pill: the task page's pinned main action. */
export function PinnedAction({
  icon,
  children,
}: {
  icon?: ReactNode
  children: string
}) {
  return (
    <HStack
      h="48px"
      gap="8px"
      justify="center"
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      fontSize="15px"
      fontWeight={500}
    >
      {icon}
      {children}
    </HStack>
  )
}

/**
 * The app's banner for a new quote (the push, shown in the app): the Slashie
 * mark, who sent it, then the price and their message. It drops in over the
 * top of the screen.
 */
export function QuoteNotice({
  title,
  body,
  compact = false,
}: {
  title: string
  body: string
  compact?: boolean
}) {
  return (
    <HStack
      data-quote-notice=""
      position="absolute"
      left={compact ? '6px' : '8px'}
      right={compact ? '6px' : '8px'}
      top={compact ? '4px' : '6px'}
      zIndex={3}
      gap="10px"
      px="10px"
      py={compact ? '6px' : '10px'}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius={compact ? '12px' : '16px'}
      boxShadow={sdlElevation.e3}
      css={{ animation: 'fade-rise 380ms cubic-bezier(0.2, 0, 0, 1) both' }}
    >
      <Box
        w={compact ? '24px' : '28px'}
        h={compact ? '24px' : '28px'}
        flexShrink={0}
        borderRadius="8px"
        bg="bg.surface"
        borderWidth="1px"
        borderColor="border.default"
        display="flex"
        alignItems="center"
        justifyContent="center"
        aria-hidden
      >
        <img
          src="/images/slashie-mark.svg"
          alt=""
          width={compact ? 14 : 16}
          height={compact ? 14 : 16}
        />
      </Box>
      <Box minW={0}>
        <Text
          fontSize={compact ? '12px' : '13px'}
          lineHeight={compact ? '16px' : '18px'}
          fontWeight={500}
          lineClamp={1}
        >
          {title}
        </Text>
        <Text
          fontSize={compact ? '11px' : '13px'}
          lineHeight={compact ? '14px' : '18px'}
          color="text.muted"
          lineClamp={1}
        >
          {body}
        </Text>
      </Box>
    </HStack>
  )
}
