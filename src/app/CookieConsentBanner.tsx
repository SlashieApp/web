'use client'

import { Box, Container, HStack, Stack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

import {
  type CookieConsentValue,
  getCookieConsent,
  setCookieConsent,
} from '@/utils/analytics'
import { Button, Link } from '@ui'

/**
 * PECR cookie-consent banner. Shown on first visit (no stored choice) on every
 * shell, marketing and authenticated alike. Essential cookies (auth session)
 * are unaffected; analytics (PostHog) only starts after "Accept all" — the
 * gate lives in initPostHogClient.
 *
 * Mounted after hydration via effect: the choice lives in localStorage, so
 * rendering nothing on the server (and first client paint) avoids a
 * hydration mismatch.
 */
export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(getCookieConsent() === 'unset')
  }, [])

  if (!visible) return null

  const decide = (value: CookieConsentValue) => {
    setCookieConsent(value)
    setVisible(false)
  }

  return (
    <Box
      as="section"
      aria-label="Cookie consent"
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex="banner"
      bg="bg.canvas"
      borderTopWidth="1px"
      borderColor="border.default"
      py={{ base: 4, md: 5 }}
      boxShadow="0 -4px 24px rgba(10, 21, 18, 0.08)"
    >
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
        <Stack
          direction={{ base: 'column', md: 'row' }}
          gap={{ base: 4, md: 6 }}
          align={{ base: 'stretch', md: 'center' }}
          justify="space-between"
        >
          <Text fontSize="sm" color="text.default" lineHeight="1.55">
            We use essential cookies to keep you signed in, and optional
            analytics cookies to understand how Slashie is used. See our{' '}
            <Link href="/cookies" fontSize="sm">
              Cookie Policy
            </Link>
            .
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
              Essential only
            </Button>
            <Button size="md" onClick={() => decide('accepted')}>
              Accept all
            </Button>
          </HStack>
        </Stack>
      </Container>
    </Box>
  )
}
