'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  type CookieConsentValue,
  getCookieConsent,
  onCookieSettingsOpen,
  setCookieConsent,
} from '@/utils/analytics'
import { Button, Link, PageBleed } from '@ui'

import {
  COOKIE_BANNER_HEIGHT_VAR,
  COOKIE_BANNER_OPEN_ATTR,
} from './cookieBannerLayout'
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
 * `<html>`, and marks `<html>` with `data-cookie-banner-open` (see
 * `cookieBannerLayout`): the page keeps focus and scrolled-to cards above it
 * (`scroll-padding-bottom`), and the landing's floating "Post a task" pill
 * waits until the banner is answered.
 *
 * Reopened from Cookie settings, it takes focus and the region is described
 * by the current-choice line, so a screen reader says the stored choice; the
 * matching button is `aria-pressed` too. Both buttons look the same either
 * way, so neither choice is pushed harder (ICO).
 */
export function CookieConsentBanner() {
  const t = useI11n(bag).cookieBanner
  const [visible, setVisible] = useState(false)
  // Reopened from Cookie settings: the choice stored now, shown as one line
  // (FE-565). Null on the first visit, when nothing is stored yet.
  const [current, setCurrent] = useState<CookieConsentValue | null>(null)
  // Bumped by each Cookie settings click: the banner then takes focus, so a
  // keyboard or screen-reader user lands in it rather than back at the link.
  const [settingsOpens, setSettingsOpens] = useState(0)
  const sectionRef = useRef<HTMLElement | null>(null)
  const currentChoiceId = useId()

  // The banner mounts only while it is open, so the ref callback's setup is
  // "open" and its cleanup is "closed".
  const publishHeight = useCallback((node: HTMLElement | null) => {
    if (!node) return
    sectionRef.current = node
    const root = document.documentElement
    const publish = () =>
      root.style.setProperty(COOKIE_BANNER_HEIGHT_VAR, `${node.offsetHeight}px`)
    publish()
    root.setAttribute(COOKIE_BANNER_OPEN_ATTR, '')
    const observer = new ResizeObserver(publish)
    observer.observe(node)
    return () => {
      sectionRef.current = null
      observer.disconnect()
      root.style.removeProperty(COOKIE_BANNER_HEIGHT_VAR)
      root.removeAttribute(COOKIE_BANNER_OPEN_ATTR)
    }
  }, [])

  useEffect(() => {
    setVisible(getCookieConsent() === 'unset')
    // "Cookie settings" (footer, account menu, auth pages) reopens the banner
    // to change the choice, and says which choice is stored now.
    return onCookieSettingsOpen(() => {
      const stored = getCookieConsent()
      setCurrent(stored === 'unset' ? null : stored)
      setVisible(true)
      setSettingsOpens((n) => n + 1)
    })
  }, [])

  // Runs after the reopened banner has mounted (or straight away when it was
  // already open). Never on the first visit: that banner must not steal focus.
  useEffect(() => {
    if (settingsOpens > 0) sectionRef.current?.focus()
  }, [settingsOpens])

  if (!visible) return null

  const [policyBefore, policyAfter = ''] = t.body.split('{link}')

  const decide = (value: CookieConsentValue) => {
    setCookieConsent(value)
    setVisible(false)
  }

  return (
    <PageBleed
      ref={publishHeight}
      as="section"
      aria-label={t.ariaLabel}
      aria-describedby={current ? currentChoiceId : undefined}
      tabIndex={-1}
      _focus={{ outline: 'none' }}
      position="fixed"
      insetX={0}
      bottom={0}
      zIndex="banner"
      bg="bg.canvas"
      py={{ base: 3, md: 5 }}
      boxShadow="e3"
    >
      <Stack
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 3, md: 6 }}
        align={{ base: 'stretch', md: 'center' }}
        justify="space-between"
      >
        <Text fontSize="sm" color="text.default" lineHeight="1.55">
          {policyBefore}
          <Link href="/cookies" fontSize="sm">
            {t.policy}
          </Link>
          {policyAfter}
          {current ? (
            <Text
              as="span"
              display="block"
              mt={1}
              color="text.muted"
              id={currentChoiceId}
              data-current-choice=""
            >
              {formatMessage(t.currentChoice, {
                choice: current === 'accepted' ? t.acceptAll : t.essentialOnly,
              })}
            </Text>
          ) : null}
        </Text>
        {/* One row of equal halves on a phone (FE-541), the same style:
            rejecting is as easy as accepting. */}
        <HStack gap={3} flexShrink={0} w={{ base: 'full', md: 'auto' }}>
          <Button
            variant="secondary"
            size="md"
            flex={{ base: 1, md: 'initial' }}
            aria-pressed={current ? current === 'rejected' : undefined}
            onClick={() => decide('rejected')}
          >
            {t.essentialOnly}
          </Button>
          <Button
            variant="secondary"
            size="md"
            flex={{ base: 1, md: 'initial' }}
            aria-pressed={current ? current === 'accepted' : undefined}
            onClick={() => decide('accepted')}
          >
            {t.acceptAll}
          </Button>
        </HStack>
      </Stack>
    </PageBleed>
  )
}
