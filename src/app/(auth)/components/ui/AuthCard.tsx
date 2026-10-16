'use client'

import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

import { Card } from '@ui'

export type AuthCardTone = 'brand' | 'warning' | 'danger'

const TONE = {
  brand: { bg: 'status.success.soft', color: 'status.success.fg' },
  warning: { bg: 'status.warning.soft', color: 'status.warning.fg' },
  danger: { bg: 'status.danger.soft', color: 'status.danger.fg' },
} as const

export type AuthCardProps = {
  title: string
  description?: ReactNode
  /** Status pages (sent, expired, done): an icon above, everything centred. */
  icon?: IconType
  tone?: AuthCardTone
  /** Account notice above the form (deletion scheduled, restore). */
  notice?: ReactNode
  /** The form, or a status page's actions. */
  children?: ReactNode
  /** The one link row under the card. */
  footer?: ReactNode
}

/**
 * The auth page body: a card on desktop, flush on phones and tablets. Forms
 * read left to right; status pages (with `icon`) centre.
 */
export function AuthCard({
  title,
  description,
  icon: Icon,
  tone = 'brand',
  notice,
  children,
  footer,
}: AuthCardProps) {
  const centred = Icon != null

  return (
    <Stack gap={6} w="full">
      <Card framed={{ base: false, lg: true }} p={8} w="full">
        <Stack
          gap={6}
          align={centred ? 'center' : 'stretch'}
          textAlign={centred ? 'center' : 'start'}
        >
          {Icon ? (
            <Box
              boxSize={12}
              borderRadius="full"
              bg={TONE[tone].bg}
              color={TONE[tone].color}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon size={22} aria-hidden />
            </Box>
          ) : null}
          <Stack gap={2}>
            <Heading
              as="h1"
              fontFamily="heading"
              fontSize={{ base: '2xl', lg: '3xl' }}
              fontWeight={700}
              lineHeight="1.2"
              letterSpacing="-0.01em"
              color="text.default"
            >
              {title}
            </Heading>
            {description ? (
              <Text color="text.muted" fontSize="md" lineHeight="1.55">
                {description}
              </Text>
            ) : null}
          </Stack>
          {notice}
          {children ? (
            <Stack gap={4} w="full" textAlign="start">
              {children}
            </Stack>
          ) : null}
        </Stack>
      </Card>
      {footer ? (
        <Text fontSize="sm" color="text.muted" textAlign="center">
          {footer}
        </Text>
      ) : null}
    </Stack>
  )
}
