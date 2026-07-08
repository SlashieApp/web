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
import { sdlMotion } from '@/theme/styles'
import { Link, Logo } from '@ui'

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
 * - `default` — full footer: brand block + primary nav + legal row.
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

const navLinks = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Log in', href: '/login' },
  { label: 'Register', href: '/register' },
] as const

const legalLinks = [
  { label: 'Terms', href: '/terms' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Cookies', href: '/cookies' },
] as const

const linkMotion = {
  transitionProperty: 'color',
  transitionDuration: sdlMotion.duration.moderate,
  transitionTimingFunction: sdlMotion.easing.standard,
} as const

export function Footer({
  variant = 'default',
  tagline = 'Map-first local task marketplace.',
  copyright = '© Slashie 2026',
  ...boxProps
}: UiFooterProps) {
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
              <Text>{copyright}</Text>
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
              <Stack gap={2}>
                <Logo />
                <Text fontSize="sm" color="text.muted">
                  {tagline}
                </Text>
              </Stack>
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
            </HStack>
            <Stack gap={3}>
              <HStack
                justify="space-between"
                flexWrap="wrap"
                gap={4}
                fontSize="sm"
                color="text.muted"
              >
                <Text>{copyright}</Text>
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
