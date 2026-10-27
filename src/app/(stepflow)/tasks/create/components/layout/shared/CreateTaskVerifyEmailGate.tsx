'use client'

import { Box, Stack, Text } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { APP_HOME } from '@/utils/appRoutes'
import { Button, Card, Link, StepFlowHeader, StepFlowHeading } from '@ui'

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
 * in the flow to be stopped at Review.
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
      bg="bg.subtle"
      display="flex"
      flexDirection="column"
    >
      <StepFlowHeader
        title={t.eyebrow}
        exitHref={APP_HOME}
        closeLabel={t.closeLabel}
      />
      <Stack
        gap={6}
        flex={1}
        w="full"
        maxW="lg"
        mx="auto"
        px={PAGE_GUTTER_X}
        py={{ base: 6, md: 10 }}
      >
        <StepFlowHeading title={v.title} description={v.subtitle} />
        <Card>
          <Stack gap={3}>
            <Text fontSize="sm" color="text.muted" lineHeight="tall">
              {formatMessage(v.body, { email })}
            </Text>
            <Button asChild w="full">
              <Link href={verifyHref} _hover={{ textDecoration: 'none' }}>
                {v.cta}
              </Link>
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Box>
  )
}
