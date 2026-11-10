'use client'

import { chakra } from '@chakra-ui/react'
import type { ReactNode } from 'react'

import { sdlFocusRing } from '@/theme/styles'

const Anchor = chakra('a')

type HeroHowItWorksLinkProps = {
  children: ReactNode
}

/**
 * In-page how-it-works anchor, a text action in `text.link` (green 800): at
 * rest it is plain, on hover or keyboard focus it gains the underline. Never
 * green 400, which is a fill and too light for text. Plain `<a>` (not
 * NextLink) so native smooth scroll / Lenis stay in sync. Client-only so
 * `chakra('a')` is safe.
 *
 * The line of text is 20px tall, too small to tap: the link is a 44px target
 * with 12px of padding each side, and gives the 24px back as a negative
 * margin, so it takes a 20px line's room in the hero's rhythm.
 */
export function HeroHowItWorksLink({ children }: HeroHowItWorksLinkProps) {
  return (
    <Anchor
      href="#how-it-works"
      display="inline-flex"
      alignItems="center"
      minH="44px"
      px={3}
      my="-12px"
      textStyle="text-sm"
      fontWeight={500}
      color="text.link"
      textDecoration="none"
      textUnderlineOffset="4px"
      textDecorationThickness="1px"
      borderRadius="sm"
      _hover={{ textDecoration: 'underline' }}
      _focusVisible={{
        ...sdlFocusRing,
        textDecoration: 'underline',
      }}
    >
      {children}
    </Anchor>
  )
}
