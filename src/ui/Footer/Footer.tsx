'use client'

import {
  Box,
  type BoxProps,
  Container,
  Grid,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'
import { LuGithub, LuLinkedin } from 'react-icons/lu'

import { COMPANY_REGISTRATION_LINE } from '@/content/legal/company'
import { SLASHIE_GITHUB_URL, SLASHIE_LINKEDIN_URL } from '@/content/social'
import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'

import { Link } from '../Link/Link'
import { Logo } from '../Logo/Logo'
import messages from './i11n.json'

/**
 * SDL site Footer. Presentational composition built from SDL atoms (`Logo`,
 * `Link`) and semantic roles only.
 *
 * - Default: tonal soft-green wash, brand column + labeled Explore / Legal /
 *   Connect columns, meta row underneath.
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

const navHrefs = {
  pricing: '/pricing',
  about: '/about',
  login: '/login',
  register: '/register',
} as const

const legalHrefs = {
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

  const navLinks = [
    { label: t.nav.pricing, href: navHrefs.pricing },
    { label: t.nav.about, href: navHrefs.about },
    { label: t.nav.login, href: navHrefs.login },
    { label: t.nav.register, href: navHrefs.register },
  ] as const

  const legalLinks = [
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
        maxW="6xl"
        px={{ base: 4, md: 6 }}
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
                base: '1fr',
                md: 'minmax(0, 1.4fr) repeat(3, minmax(0, 0.7fr))',
              }}
              gap={{ base: 8, md: 10 }}
              alignItems="flex-start"
            >
              <Stack gap={3} maxW="md">
                <Logo />
                <Text fontSize="sm" color="text.muted" lineHeight="tall">
                  {resolvedTagline}
                </Text>
                <Text fontSize="xs" color="text.muted" lineHeight="tall">
                  {t.openSourceNote}
                </Text>
              </Stack>

              <Stack gap={3}>
                <ColumnLabel>{t.columns.explore}</ColumnLabel>
                <Stack gap={2.5}>
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      tone="muted"
                      fontWeight={600}
                      fontSize="sm"
                      color="text.default"
                      {...linkMotion}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Stack>

              <Stack gap={3}>
                <ColumnLabel>{t.columns.legal}</ColumnLabel>
                <Stack gap={2.5}>
                  {legalLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      tone="muted"
                      fontWeight={600}
                      fontSize="sm"
                      color="text.default"
                      {...linkMotion}
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Stack>

              <Stack gap={3}>
                <ColumnLabel>{t.columns.connect}</ColumnLabel>
                <Stack gap={2.5}>
                  {connectLinks.map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        tone="muted"
                        fontWeight={600}
                        fontSize="sm"
                        color="text.default"
                        {...externalLinkProps}
                        {...linkMotion}
                      >
                        <HStack gap={2}>
                          <Icon size={15} aria-hidden />
                          <span>{link.label}</span>
                        </HStack>
                      </Link>
                    )
                  })}
                </Stack>
              </Stack>
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
    </Box>
  )
}
