'use client'

import { Box, Text } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { APP_HOME } from '@/utils/appRoutes'
import { Button, Link, StatusCard, StepFlowHeader } from '@ui'

import bag from '../../../i11n.json'

export type CreateTaskVerifyEmailGateProps = {
  /** The account's email, named in the body. */
  email: string
  /** Where Verify email goes (the sent screen, with `next` back to Post a task). */
  verifyHref: string
  /**
   * Runs once when the screen shows: re-reads the account, in case the email
   * was verified in another tab.
   */
  onShown?: () => void
}

/**
 * `create.verifyEmail` (FE-447): before the first step, an unverified email
 * gets the title, the reason and Verify email, as in the app, so nobody fills
 * in the flow to be stopped at Review. The gate is a centred status card (R6)
 * under the flow header (R2).
 */
export function CreateTaskVerifyEmailGate({
  email,
  verifyHref,
  onShown,
}: CreateTaskVerifyEmailGateProps) {
  const t = useI11n(bag)
  const v = t.verify
  const shownRef = useRef(false)
  const shown = useCallback(
    (node: HTMLElement | null) => {
      if (!node || shownRef.current) return
      shownRef.current = true
      onShown?.()
    },
    [onShown],
  )

  return (
    <Box
      as="main"
      ref={shown}
      minH="100dvh"
      bg="bg.canvas"
      display="flex"
      flexDirection="column"
    >
      <StepFlowHeader
        title={t.eyebrow}
        exitHref={APP_HOME}
        closeLabel={t.closeLabel}
      />
      {/* The centred card every gate and status page uses (R6, 448): the
          title, the subtitle and the reason, then the main button. */}
      <StatusCard
        title={v.title}
        body={v.subtitle}
        actions={
          <Button asChild w="full" size="form">
            <Link href={verifyHref} _hover={{ textDecoration: 'none' }}>
              {v.cta}
            </Link>
          </Button>
        }
      >
        <Text color="text.muted" lineHeight="tall">
          {formatMessage(v.body, { email })}
        </Text>
      </StatusCard>
    </Box>
  )
}
