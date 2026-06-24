'use client'

import {
  Link as ChakraLink,
  type LinkProps,
  type SystemStyleObject,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import * as React from 'react'

import { sdlFocusRing, sdlMotion } from '@/theme/styles'

/**
 * SDL inline Link. Renders the SDL link role (`text.link`, green-700 in light /
 * green-300 in dark) and uses Next.js client navigation for internal `href`s.
 *
 * Tones:
 * - `default` — standard inline link (`text.link`), underline on hover.
 * - `muted`   — low-emphasis link that reads as body copy (`text.default`),
 *               reveals `text.link` on hover (footer / back-nav).
 * - `emphasis` — same link colour with persistent weight cues; for affordances
 *               like "View profile" / "Manage billing".
 *
 * Accessibility: every tone keeps a visible keyboard focus ring via
 * `sdlFocusRing` (WCAG 2.2 AA), unlike the legacy ringless treatment.
 */
export type UiLinkTone = 'default' | 'muted' | 'emphasis'

export type UiLinkProps = LinkProps & {
  /** Inline link hover/focus treatment. Default `default` (footer, subtle nav). */
  tone?: UiLinkTone
}

const linkToneStyles: Record<UiLinkTone, SystemStyleObject> = {
  default: {
    color: 'text.link',
    textDecoration: 'none',
    _hover: { textDecoration: 'underline' },
  },
  muted: {
    color: 'text.default',
    textDecoration: 'none',
    _hover: { color: 'text.link', textDecoration: 'none' },
  },
  emphasis: {
    color: 'text.link',
    textDecoration: 'none',
    _hover: { color: 'text.link', textDecoration: 'underline' },
  },
}

/**
 * Chakra `Link` rendered through Next.js. Visible `:focus-visible` ring via
 * `sdlFocusRing`; transitions use `sdlMotion` (colour only).
 */
export const Link = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  function Link(
    { as, href, tone = 'default', borderRadius = 'sm', ...props },
    ref,
  ) {
    return (
      <ChakraLink
        ref={ref}
        as={NextLink}
        href={href}
        borderRadius={borderRadius}
        outline="none"
        transitionProperty="color, text-decoration-color"
        transitionDuration={sdlMotion.duration.moderate}
        transitionTimingFunction={sdlMotion.easing.standard}
        _focusVisible={sdlFocusRing}
        {...linkToneStyles[tone]}
        {...props}
      />
    )
  },
)

Link.displayName = 'Link'
