'use client'

import {
  Box,
  type BoxProps,
  Container,
  HStack,
  Stack,
  Text,
} from '@chakra-ui/react'

import { COMPANY_REGISTRATION_LINE } from '@/content/legal/company'
import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'

import { Link } from '../Link/Link'
import { Logo } from '../Logo/Logo'
import messages from './i11n.json'

/**
 * SDL site Footer. Presentational composition built from SDL atoms (`Logo`,
 * `Link`) and semantic roles only.
 *
 * - Surface: `bg.canvas` with a `border.default` hairline top rule.
 * - Text: tagline + meta use `text.muted`; primary nav uses `text.default`.
 * - Links animate color via `sdlMotion` and inherit the `Link` atom's visible
 *   `:focus-visible` treatment.
 *
 * Variants (additive, non-breaking — `Footer` still renders with no props):
 * - `default` — full footer: brand block + primary nav + connect + legal row.
 * - `minimal` — compact single-row footer (meta + legal only).
 */
export type UiFooterVariant = 'default' | 'minimal'

export type UiFooterProps = Omit<BoxProps, 'children'> & {
  variant?: UiFooterVariant
  /** Override the tagline shown under the brand mark (default variant only). */
  tagline?: string
  /** Override the copyright/meta line. */
  copyright?: string
}

const LINKEDIN_HREF = 'https://www.linkedin.com/company/slashie-app'
const GITHUB_HREF = 'https://github.com/SlashieApp/web'

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
  transitionProperty: 'color',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

const externalLinkProps = {
  target: '_blank',
  rel: 'noopener noreferrer',
} as const

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
    { label: t.connect.linkedin, href: LINKEDIN_HREF },
    { label: t.connect.github, href: GITHUB_HREF },
  ] as const

  const legalRow = (
    <HStack gap={4}>
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
      borderTopWidth="1px"
      borderColor="border.default"
      bg="bg.canvas"
      py={variant === 'minimal' ? 6 : 10}
      {...boxProps}
    >
      <Container maxW="6xl" px={{ base: 4, md: 6 }}>
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
          <Stack gap={8}>
            <HStack
              justify="space-between"
              align="flex-start"
              flexWrap="wrap"
              gap={6}
            >
              <Stack gap={2} maxW="md">
                <Logo />
                <Text fontSize="sm" color="text.muted">
                  {resolvedTagline}
                </Text>
                <Text fontSize="xs" color="text.muted">
                  {t.openSourceNote}
                </Text>
              </Stack>
              <Stack gap={4} align={{ base: 'flex-start', md: 'flex-end' }}>
                <HStack gap={5} flexWrap="wrap">
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
                </HStack>
                <HStack gap={5} flexWrap="wrap">
                  {connectLinks.map((link) => (
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
                      {link.label}
                    </Link>
                  ))}
                </HStack>
              </Stack>
            </HStack>
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
          </Stack>
        )}
      </Container>
    </Box>
  )
}
