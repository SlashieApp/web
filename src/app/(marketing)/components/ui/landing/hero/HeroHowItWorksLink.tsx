'use client'

import { chakra } from '@chakra-ui/react'
import type { ReactNode } from 'react'

const Anchor = chakra('a')

type HeroHowItWorksLinkProps = {
  children: ReactNode
}

/**
 * In-page how-it-works anchor. Plain `<a>` (not NextLink) so native smooth
 * scroll / Lenis stay in sync. Client-only so `chakra('a')` is safe.
 */
export function HeroHowItWorksLink({ children }: HeroHowItWorksLinkProps) {
  return (
    <Anchor
      href="#how-it-works"
      textDecoration="underline"
      textUnderlineOffset="3px"
      _hover={{ color: 'action.primary' }}
      _focusVisible={{
        outline: '2px solid',
        outlineColor: 'action.primary',
        outlineOffset: '3px',
        borderRadius: 'sm',
      }}
    >
      {children}
    </Anchor>
  )
}
