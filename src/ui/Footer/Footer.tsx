'use client'

import {
  Box,
  type BoxProps,
  Container,
  Grid,
  HStack,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import { useState } from 'react'
import { LuGithub, LuGlobe, LuLinkedin } from 'react-icons/lu'

import { COMPANY_REGISTRATION_LINE } from '@/content/legal/company'
import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import { LanguageSwitcher } from '@/i18n/LanguageSwitcher'
import { useLocale } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { LOCALE_LABELS } from '@/i18n/locales'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'
import { sdlFocusRing, sdlMotion } from '@/theme/styles'
import { APP_HOME, SAFETY_HREF } from '@/utils/appRoutes'

import { FeedbackTrigger } from '../FeedbackDialog/FeedbackTrigger'
import { Link } from '../Link/Link'
import { Logo } from '../Logo/Logo'
import messages from './i11n.json'

/**
 * SDL site footer (cross-route chrome).
 *
 * - Default: tonal soft-green wash; brand column (tagline + language
 *   switch, the only language control guests have on phones) and Product /
 *   Company / Help & legal columns (two up on phones), then the company line.
 * - Minimal: compact copyright + legal row (dashboard shells).
 */
export type UiFooterVariant = 'default' | 'minimal'

export type UiFooterProps = Omit<BoxProps, 'children'> & {
  variant?: UiFooterVariant
  /** Override the tagline shown under the brand mark (default variant only). */
  tagline?: string
  /** Override the copyright/meta line. */
  copyright?: string
}

const productHrefs = {
  search: APP_HOME,
  postTask: '/tasks/create',
  becomeWorker: '/worker/setup',
  pricing: '/pricing',
} as const

const legalHrefs = {
  safety: SAFETY_HREF,
  terms: '/terms',
  privacy: '/privacy',
  cookies: '/cookies',
} as const

const linkMotion = {
  transitionProperty: 'color, background-color',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

function ColumnLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="xs"
      fontWeight={700}
      letterSpacing="0.12em"
      textTransform="uppercase"
      color="text.muted"
      mb={1}
    >
      {children}
    </Text>
  )
}

export function Footer({
  variant = 'default',
  tagline,
  copyright,
  ...boxProps
}: UiFooterProps) {
  const t = useI11n(messages)
  const resolvedTagline = tagline ?? t.tagline
  const resolvedCopyright = copyright ?? t.copyright

  const locale = useLocale()
  const [languageOpen, setLanguageOpen] = useState(false)

  const productLinks = [
    { label: t.product.search, href: productHrefs.search },
    { label: t.product.postTask, href: productHrefs.postTask },
    { label: t.product.becomeWorker, href: productHrefs.becomeWorker },
    { label: t.product.pricing, href: productHrefs.pricing },
  ] as const

  const legalLinks = [
    { label: t.legal.safety, href: legalHrefs.safety },
    { label: t.legal.terms, href: legalHrefs.terms },
    { label: t.legal.privacy, href: legalHrefs.privacy },
    { label: t.legal.cookies, href: legalHrefs.cookies },
  ] as const

  const connectLinks = [
    {
      label: t.connect.linkedin,
      href: SLASHIE_LINKEDIN_URL,
      icon: LuLinkedin,
    },
    {
      label: t.connect.github,
      href: SLASHIE_GITHUB_URL,
      icon: LuGithub,
    },
  ] as const

  const legalRow = (
    <HStack gap={4} flexWrap="wrap">
      <FeedbackTrigger variant="footerMeta" />
      {legalLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          tone="muted"
          fontSize="sm"
          color="text.muted"
          {...linkMotion}
        >
          {link.label}
        </Link>
      ))}
    </HStack>
  )

  return (
    <Box
      as="footer"
      position="relative"
      overflow="hidden"
      bg={variant === 'minimal' ? 'bg.canvas' : 'status.success.soft'}
      borderTopWidth="1px"
      borderColor="border.default"
      py={variant === 'minimal' ? 6 : { base: 10, md: 12 }}
      {...boxProps}
    >
      {variant === 'default' ? (
        <Box
          position="absolute"
          inset={0}
          aria-hidden
          bgImage="radial-gradient(36rem 18rem at 8% 0%, rgba(0, 220, 130, 0.12) 0%, transparent 70%)"
        />
      ) : null}
      <Container
        maxW={PAGE_CONTAINER_MAX_W}
        px={PAGE_GUTTER_X}
        position="relative"
        zIndex={1}
      >
        {variant === 'minimal' ? (
          <Stack gap={3}>
            <HStack
              justify="space-between"
              flexWrap="wrap"
              gap={4}
              fontSize="sm"
              color="text.muted"
            >
              <Text>{resolvedCopyright}</Text>
              {legalRow}
            </HStack>
            <Text fontSize="xs" color="text.muted">
              {COMPANY_REGISTRATION_LINE}
            </Text>
          </Stack>
        ) : (
          <Stack gap={{ base: 10, md: 12 }}>
            <Grid
              templateColumns={{
                base: 'repeat(2, minmax(0, 1fr))',
                md: 'minmax(0, 1.4fr) repeat(3, minmax(0, 0.7fr))',
              }}
              gap={{ base: 8, md: 10 }}
              alignItems="flex-start"
            >
              <Stack
                gap={3}
                maxW="md"
                gridColumn={{ base: '1 / -1', md: 'auto' }}
              >
                <Logo />
                <Text fontSize="sm" color="text.muted" lineHeight="tall">
                  {resolvedTagline}
                </Text>
                <Text fontSize="xs" color="text.muted" lineHeight="tall">
                  {t.openSourceNote}
                </Text>
                <chakra.button
                  type="button"
                  onClick={() => setLanguageOpen(true)}
                  display="inline-flex"
                  alignItems="center"
                  gap={2}
                  alignSelf="flex-start"
                  minH="44px"
                  px={3}
                  borderRadius="md"
                  borderWidth="1px"
                  borderColor="border.default"
                  bg="bg.surface"
                  fontSize="sm"
                  fontWeight={600}
                  color="text.default"
                  cursor="pointer"
                  _hover={{ bg: 'bg.subtle' }}
                  _focusVisible={sdlFocusRing}
                  {...linkMotion}
                >
                  <LuGlobe size={16} aria-hidden />
                  {formatMessage(t.language, {
                    name: LOCALE_LABELS[locale].native,
                  })}
                </chakra.button>
              </Stack>

              <FooterColumn label={t.columns.product}>
                {productLinks.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </FooterColumn>

              <FooterColumn label={t.columns.company}>
                <FooterLink href="/about">{t.company.about}</FooterLink>
                <FeedbackTrigger variant="footer" />
                {connectLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <FooterLink key={link.href} href={link.href} external>
                      <HStack gap={2} as="span">
                        <Icon size={15} aria-hidden />
                        <span>{link.label}</span>
                      </HStack>
                    </FooterLink>
                  )
                })}
              </FooterColumn>

              <FooterColumn label={t.columns.help}>
                {legalLinks.map((link) => (
                  <FooterLink key={link.href} href={link.href}>
                    {link.label}
                  </FooterLink>
                ))}
              </FooterColumn>
            </Grid>

            <Stack
              gap={2}
              pt={{ base: 2, md: 1 }}
              borderTopWidth="1px"
              borderColor="border.default"
            >
              <HStack
                justify="space-between"
                flexWrap="wrap"
                gap={3}
                fontSize="sm"
                color="text.muted"
                pt={5}
              >
                <Text>{resolvedCopyright}</Text>
                <Text fontSize="xs" color="text.muted">
                  {COMPANY_REGISTRATION_LINE}
                </Text>
              </HStack>
            </Stack>
          </Stack>
        )}
      </Container>
      {variant === 'default' ? (
        <LanguageSwitcher open={languageOpen} onOpenChange={setLanguageOpen} />
      ) : null}
    </Box>
  )
}

function FooterColumn({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Stack gap={3} as="nav" aria-label={label}>
      <ColumnLabel>{label}</ColumnLabel>
      <Stack gap={2.5}>{children}</Stack>
    </Stack>
  )
}

function FooterLink({
  href,
  external = false,
  children,
}: {
  href: string
  external?: boolean
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      tone="muted"
      fontWeight={600}
      fontSize="sm"
      color="text.default"
      {...(external ? externalLinkProps : null)}
      {...linkMotion}
    >
      {children}
    </Link>
  )
}
