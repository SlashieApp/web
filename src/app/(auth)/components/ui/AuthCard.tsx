'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import type { ReactNode } from 'react'
import type { IconType } from 'react-icons'

import { Card, FormHeader } from '@ui'

export type AuthCardTone = 'neutral' | 'success' | 'warning' | 'danger'

/** Neutral is the default: a status page's icon is not a mint wash. Green is for success. */
const TONE = {
  neutral: { bg: 'bg.subtle', color: 'text.muted' },
  success: { bg: 'status.success.soft', color: 'status.success.fg' },
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
  tone = 'neutral',
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
          {/* The card's gap spaces the header from what follows, so it owns no 24 of its own. */}
          <FormHeader
            title={title}
            description={description}
            align={centred ? 'center' : 'start'}
            mb={0}
          />
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
