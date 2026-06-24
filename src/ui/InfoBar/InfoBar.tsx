'use client'

import {
  Box,
  type BoxProps,
  HStack,
  Heading,
  Stack,
  type SystemStyleObject,
  Text,
} from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlMotion } from '@/theme/styles'
import { Badge } from '../Badge/Badge'
import { Card } from '../Card/Card'
import { Link } from '../Link/Link'

/**
 * SDL Foundations organism: InfoBar — a trust / advisory panel.
 *
 * The canonical use is the payment-trust notice: an info-toned bar explaining
 * "You pay the worker directly — Slashie never handles job payment." It composes
 * existing @ui atoms only (Card surface, Badge for the dot + label, Link for the
 * optional CTA) and references SDL semantic roles exclusively.
 *
 * Tones map 1:1 to the SDL status families (info | success | warning | danger).
 * Status is never signalled by colour alone: a leading icon pod plus the Badge
 * (`dot` + label) carry the meaning. Solid status fills (success/danger dots,
 * pods) keep their `status.<family>.solid` swatch; ink text on a green pod uses
 * `text.onGreen` per the GREEN-INK rule, never white.
 */
export type UiInfoBarTone = 'info' | 'success' | 'warning' | 'danger'

type SdlTone = 'info' | 'success' | 'warning' | 'danger'

const toneAlias: Record<UiInfoBarTone, SdlTone> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
}

/** Default short label rendered inside the status Badge per tone. */
const toneBadgeLabel: Record<SdlTone, string> = {
  info: 'Good to know',
  success: 'All clear',
  warning: 'Heads up',
  danger: 'Action needed',
}

/** Surface tint + accent border for each tone. */
function toneSurface(tone: SdlTone): SystemStyleObject {
  return {
    bg: `status.${tone}.soft`,
    borderColor: `status.${tone}.soft`,
  }
}

/**
 * Icon pod styling. Solid pods carry the tone's `solid` swatch; the green
 * (success) pod pairs with `text.onGreen` ink — never white — and danger does
 * the same. Info/warning pods use the tone foreground on the soft tint.
 */
function iconPodStyles(tone: SdlTone): SystemStyleObject {
  if (tone === 'success' || tone === 'danger') {
    return { bg: `status.${tone}.solid`, color: 'text.onGreen' }
  }
  return { bg: 'bg.surface', color: `status.${tone}.fg` }
}

export type UiInfoBarProps = Omit<BoxProps, 'title'> & {
  /** SDL status family for the panel. Default `info`. */
  tone?: UiInfoBarTone
  /** Leading glyph (emoji or icon node) shown in the icon pod. */
  icon?: ReactNode
  /** Short status label rendered in the Badge (dot + label). */
  badgeLabel?: string
  /** Panel heading. */
  heading: string
  /** Supporting body copy. */
  children?: ReactNode
  /** Optional inline call-to-action link. */
  linkLabel?: string
  /** Destination for the optional link. */
  linkHref?: string
  /** Hide the status Badge (icon pod still carries the tone). */
  hideBadge?: boolean
}

/**
 * Default info icon — a lowercase "i" glyph. Consumers can override via `icon`.
 */
const defaultToneIcon: Record<SdlTone, string> = {
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '!',
}

export function InfoBar({
  tone = 'info',
  icon,
  badgeLabel,
  heading,
  children,
  linkLabel,
  linkHref,
  hideBadge = false,
  ...rest
}: UiInfoBarProps) {
  const family = toneAlias[tone]
  const podStyles = iconPodStyles(family)

  return (
    <Card
      layout="default"
      maxW="full"
      p={{ base: 4, md: 5 }}
      borderColor="transparent"
      transitionProperty="background-color, border-color, box-shadow"
      transitionDuration={sdlMotion.duration.base}
      transitionTimingFunction={sdlMotion.easing.standard}
      {...toneSurface(family)}
      {...rest}
    >
      <HStack gap={{ base: 3, md: 4 }} alignItems="flex-start">
        <Box
          aria-hidden
          display="inline-flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          boxSize="40px"
          borderRadius="lg"
          fontWeight={700}
          fontSize="lg"
          lineHeight="1"
          {...podStyles}
        >
          {icon ?? defaultToneIcon[family]}
        </Box>

        <Stack gap={2} flex="1" minW={0}>
          <HStack gap={3} flexWrap="wrap" alignItems="center">
            <Heading
              as="h3"
              fontSize={{ base: '16px', md: '18px' }}
              fontWeight={600}
              color="text.default"
              lineHeight="short"
            >
              {heading}
            </Heading>
            {hideBadge ? null : (
              <Badge variant={family} dot shape="pill" size="sm">
                {badgeLabel ?? toneBadgeLabel[family]}
              </Badge>
            )}
          </HStack>

          {children ? (
            <Text fontSize={{ base: 'sm', md: 'md' }} color="text.muted">
              {children}
            </Text>
          ) : null}

          {linkLabel && linkHref ? (
            <Box>
              <Link
                href={linkHref}
                tone="emphasis"
                fontSize="sm"
                fontWeight={600}
              >
                {linkLabel}
              </Link>
            </Box>
          ) : null}
        </Stack>
      </HStack>
    </Card>
  )
}
