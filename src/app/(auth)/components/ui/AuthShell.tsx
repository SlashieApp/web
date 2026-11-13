'use client'

import { Box, HStack, Stack, chakra } from '@chakra-ui/react'
import { type ReactNode, useState } from 'react'

import { LEGAL_CONTACT_EMAIL } from '@/content/legal/company'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'
import { STATUS_CARD_MAX_W } from '@/theme/pageContainer'
import { openCookieSettings } from '@/utils/analytics'
import { MARKETING_HOME } from '@/utils/appRoutes'
import { Link, Logo, PageContainer } from '@ui'

import bag from '../i11n.json'
import { AuthBackButton } from './AuthBackButton'

/**
 * Every auth page: the logo with a way back, one centred column, and the
 * links row: Language, Terms, Privacy, Cookie settings, Contact. Signed out
 * on a phone, Account goes straight to Log in (12 Oct), so this row is how a
 * guest reaches the language and the cookie choice (FE-541, Ryan 13 Nov). The column is the status card width (R6, `STATUS_CARD_MAX_W`) and the
 * page gutters sit outside it, so the auth card is the same width as every
 * other centred card.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  const t = useI11n(bag).shell
  const locale = useLocale()
  const [languageOpen, setLanguageOpen] = useState(false)

  return (
    <PageContainer display="flex" flexDirection="column" flex={1}>
      <Stack
        w="full"
        maxW={STATUS_CARD_MAX_W}
        mx="auto"
        flex={1}
        py={{ base: 8, md: 12 }}
        gap={{ base: 6, lg: 8 }}
      >
        <Box position="relative" display="flex" justifyContent="center">
          <AuthBackButton />
          <Link
            href={MARKETING_HOME}
            aria-label={t.home}
            _hover={{ opacity: 0.92 }}
          >
            <Logo h="36px" />
          </Link>
        </Box>
        <Stack as="main" flex={1} justify="center" w="full" minW={0}>
          {children}
        </Stack>
        <HStack
          as="nav"
          aria-label={t.legalAria}
          justify="center"
          flexWrap="wrap"
          columnGap={5}
          rowGap={2}
          fontSize="sm"
          data-auth-links=""
        >
          <ShellLinkButton onClick={() => setLanguageOpen(true)}>
            {formatMessage(t.language, { name: LOCALE_LABELS[locale].native })}
          </ShellLinkButton>
          <Link href="/terms" color="text.muted">
            {t.terms}
          </Link>
          <Link href="/privacy" color="text.muted">
            {t.privacy}
          </Link>
          <ShellLinkButton onClick={openCookieSettings}>
            {t.cookieSettings}
          </ShellLinkButton>
          <Link href={`mailto:${LEGAL_CONTACT_EMAIL}`} color="text.muted">
            {t.contact}
          </Link>
        </HStack>
      </Stack>
      <LanguageSwitcher open={languageOpen} onOpenChange={setLanguageOpen} />
    </PageContainer>
  )
}

/** A button in the links row, drawn like its links. */
function ShellLinkButton({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <chakra.button
      type="button"
      onClick={onClick}
      color="text.muted"
      fontSize="sm"
      cursor="pointer"
      bg="transparent"
      p={0}
      _hover={{ color: 'text.default' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'border.focus',
        outlineOffset: '2px',
        borderRadius: 'sm',
      }}
    >
      {children}
    </chakra.button>
  )
}
