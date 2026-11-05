'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import { type ReactNode, useId } from 'react'
import type { IconType } from 'react-icons'

import { STATUS_CARD_MAX_W } from '@/theme/pageContainer'
import { sdlFigure } from '@/theme/styles'

import { FormAlternatives } from '../FormAlternatives'
import { Logo } from '../Logo'
import { PageContainer } from '../PageContainer'

export type StatusCardTone = 'neutral' | 'success' | 'warning' | 'danger'

/** Neutral is the default: a status icon is not a mint wash. Green is for success. */
const TONE = {
  neutral: { bg: 'bg.subtle', color: 'text.muted' },
  success: { bg: 'status.success.soft', color: 'status.success.fg' },
  warning: { bg: 'status.warning.soft', color: 'status.warning.fg' },
  danger: { bg: 'status.danger.soft', color: 'status.danger.fg' },
} as const

export type StatusCardProps = {
  title: string
  /** The message under the title. */
  body?: ReactNode
  /** More under the body, in the same text block (a small note). */
  children?: ReactNode
  /** A status icon in a round tile above the title. */
  icon?: IconType
  tone?: StatusCardTone
  /** A large figure above the title, for an error code such as 404 (decorative). */
  code?: string
  /** The Slashie logo at the top of the card (a page of its own, with no site header). */
  logo?: boolean
  /** Buttons under the message, stacked, 8 apart. Give each `size="form"`. */
  actions?: ReactNode
  /** One muted line under the card. */
  footer?: ReactNode
  /**
   * The card is the whole page (the root 404 and error screens, a gate in
   * front of the app): a `main` that fills the viewport, centred. Otherwise
   * it sits in the page it is shown in, centred in the container.
   */
  fullPage?: boolean
  /** Heading level of the title; `h1` unless the page has its own. */
  headingAs?: 'h1' | 'h2'
}

/**
 * The centred card for status, gate and error screens (R6): not found, an
 * error, a gate (verify your email), an unavailable page, a status page of the
 * auth flow (sent, expired, done). It is always centred in the page
 * container and always `STATUS_CARD_MAX_W` wide (28rem, 448px), the same as
 * the auth card: one width for every centred card, at every viewport.
 *
 * Slots, top to bottom: `logo`, `icon` or `code`, `title`, `body` and
 * `children`, then `actions`; `footer` sits under the card. Spacing follows
 * the form spacing table (wiki Foundations-Form-Spacing): the header block's
 * parts are 20 apart, title and text 8, then 24 to the actions, which are 8
 * apart.
 */
export function StatusCard({
  title,
  body,
  children,
  icon: Icon,
  tone = 'neutral',
  code,
  logo = false,
  actions,
  footer,
  fullPage = false,
  headingAs = 'h1',
}: StatusCardProps) {
  const titleId = useId()

  const card = (
    <Stack
      as="section"
      aria-labelledby={titleId}
      w="full"
      maxW={STATUS_CARD_MAX_W}
      align="center"
      textAlign="center"
      gap="form.headerToBody"
      p={{ base: 6, md: 8 }}
      bg="bg.surface"
      borderRadius="xl"
      boxShadow="e3"
    >
      <Stack align="center" gap={5} w="full">
        {logo ? <Logo /> : null}
        {Icon ? (
          <Box
            boxSize="48px"
            borderRadius="full"
            bg={TONE[tone].bg}
            color={TONE[tone].color}
            display="flex"
            alignItems="center"
            justifyContent="center"
            aria-hidden
          >
            <Icon size={24} />
          </Box>
        ) : null}
        {code ? (
          <Text
            fontFamily="display"
            fontSize="5xl"
            {...sdlFigure}
            letterSpacing="-0.035em"
            lineHeight={1}
            color="text.muted"
            aria-hidden
          >
            {code}
          </Text>
        ) : null}
        <Stack gap="form.titleToSubtitle">
          <Heading as={headingAs} id={titleId} fontSize="xl">
            {title}
          </Heading>
          {body ? (
            <Text color="text.muted" lineHeight="tall">
              {body}
            </Text>
          ) : null}
          {children}
        </Stack>
      </Stack>
      {actions ? <FormAlternatives>{actions}</FormAlternatives> : null}
    </Stack>
  )

  const withFooter = footer ? (
    <Stack gap={6} w="full" align="center">
      {card}
      <Text fontSize="sm" color="text.muted" textAlign="center">
        {footer}
      </Text>
    </Stack>
  ) : (
    card
  )

  if (fullPage) {
    return (
      <Box
        as="main"
        minH="100dvh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={12}
        bg="bg.canvas"
      >
        <PageContainer display="flex" justifyContent="center">
          {withFooter}
        </PageContainer>
      </Box>
    )
  }

  return (
    <PageContainer
      flex="1"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={{ base: 8, md: 12 }}
    >
      {withFooter}
    </PageContainer>
  )
}
