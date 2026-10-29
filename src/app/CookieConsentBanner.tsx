'use client'

import { Box, Container, HStack, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'

import { useI11n } from '@/i18n/useI11n'
import {
  type CookieConsentValue,
  getCookieConsent,
  onCookieSettingsOpen,
  setCookieConsent,
} from '@/utils/analytics'
import { Button, Link } from '@ui'

import { COOKIE_BANNER_HEIGHT_VAR } from './cookieBannerLayout'
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
 *
 * While it is open it publishes its height as `--cookie-banner-height` on
 * `<html>` (see `cookieBannerLayout`), so fixed controls at the bottom of the
 * screen, such as the landing's floating "Post a task" pill, sit above it.
 */
export function CookieConsentBanner() {
  const t = useI11n(bag).cookieBanner
  const [visible, setVisible] = useState(false)

  // The banner mounts only while it is open, so the ref callback's setup is
  // "open" and its cleanup is "closed".
  const publishHeight = useCallback((node: HTMLElement | null) => {
    if (!node) return
    const root = document.documentElement
    const publish = () =>
      root.style.setProperty(COOKIE_BANNER_HEIGHT_VAR, `${node.offsetHeight}px`)
    publish()
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    return () => {
      observer.disconnect()
      root.style.removeProperty(COOKIE_BANNER_HEIGHT_VAR)
    }
  }, [])

  useEffect(() => {
    setVisible(getCookieConsent() === 'unset')
    // Footer "Cookie settings" reopens the banner to change the choice.
    return onCookieSettingsOpen(() => setVisible(true))
  }, [])

  if (!visible) return null

  const [policyBefore, policyAfter = ''] = t.body.split('{link}')

  const decide = (value: CookieConsentValue) => {
    setCookieConsent(value)
    setVisible(false)
  }

  return (
    <Box
      ref={publishHeight}
      as="section"
      aria-label={t.ariaLabel}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex="banner"
      bg="bg.canvas"
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
