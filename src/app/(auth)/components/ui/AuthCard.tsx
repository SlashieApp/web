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
  /**
   * The form, or a status page's actions. A plain container: put a
   * `FormStack` (fields, alert, main button) or `FormAlternatives` (buttons 8
   * apart) in it, which set the gaps.
   */
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
  // A header with nothing under it (verifying, confirmed) has no 24 to give.
  const hasBody = Boolean(notice) || Boolean(children)

  return (
    <Stack gap={6} w="full">
      <Card framed={{ base: false, lg: true }} p={8} w="full">
        {/*
          Form spacing (FE-481): the card is a plain column, not a gapped stack.
          The status icon sits 24 above the title, the header owns its 24 below
          it, a notice has 20 to what follows, and the page's own body
          (FormStack, FormAlternatives) sets the gaps inside it.
        */}
        <Stack
          gap={0}
          align={centred ? 'center' : 'stretch'}
          textAlign={centred ? 'center' : 'start'}
        >
          {Icon ? (
            <Box
              boxSize={12}
              mb="form.headerToBody"
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
          <FormHeader
            title={title}
            description={description}
            align={centred ? 'center' : 'start'}
            {...(hasBody ? {} : { mb: 0 })}
          />
          {notice ? (
            <Box w="full" textAlign="start" mb={children ? 'form.fieldGap' : 0}>
              {notice}
            </Box>
          ) : null}
          {children ? (
            <Box w="full" textAlign="start">
              {children}
            </Box>
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
