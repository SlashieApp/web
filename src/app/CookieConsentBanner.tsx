'use client'

import { Box, Container, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import {
  type CookieConsentValue,
  getCookieConsent,
  setCookieConsent,
} from '@/utils/analytics'
import { Button, Link } from '@ui'

import bag from './i11n.json'

/**
 * PECR cookie-consent banner. Shown on first visit (no stored choice) on every
 * shell, marketing and authenticated alike. Essential cookies (auth session)
 * are unaffected; analytics (PostHog) only starts after "Accept all" — the
 * gate lives in initPostHogClient.
 *
 * Mounted after hydration via effect: the choice lives in localStorage, so
 * rendering nothing on the server (and first client paint) avoids a
 * hydration mismatch. Both choices share one button style: ICO guidance
 * wants rejecting to be as easy and prominent as accepting.
 */
export function CookieConsentBanner() {
  const t = useI11n(bag).cookieBanner
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getCookieConsent() === 'unset')
  }, [])

  if (!visible) return null

  const [policyBefore, policyAfter = ''] = t.body.split('{link}')

  const decide = (value: CookieConsentValue) => {
    setCookieConsent(value)
    setVisible(false)
  }

  return (
    <Box
      as="section"
      aria-label={t.ariaLabel}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex="banner"
      bg="bg.canvas"
      borderTopWidth="1px"
      borderColor="border.default"
      py={{ base: 4, md: 5 }}
      boxShadow="e3"
    >
      <Container>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 6 }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
        >
          <Text fontSize="sm" color="text.default" lineHeight="1.55">
            {policyBefore}
            <Link href="/cookies" fontSize="sm">
              {t.policy}
            </Link>
            {policyAfter}
          </Text>
          <HStack
            gap={3}
            flexShrink={0}
            justify={{ base: 'flex-end', md: 'initial' }}
          >
            <Button
              variant="secondary"
              size="md"
              onClick={() => decide('rejected')}
            >
              {t.essentialOnly}
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => decide('accepted')}
            >
              {t.acceptAll}
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
