'use client'

import {
  Link as ChakraLink,
  type LinkProps,
  type SystemStyleObject,
} from '@chakra-ui/react'
import NextLink from 'next/link'
import * as React from 'react'

import { focusRingless, focusVisibleMatchesHover } from '@/theme/system'

export type UiLinkTone = 'default' | 'muted' | 'emphasis'

export type UiLinkProps = LinkProps & {
  /** Inline link hover/focus treatment. Default `default` (footer, subtle nav). */
  tone?: UiLinkTone
}

const linkToneHover: Record<UiLinkTone, SystemStyleObject> = {
  default: {
    textDecoration: 'none',
    color: 'primary.600',
  },
  muted: {
    textDecoration: 'none',
    color: 'cardFg',
  },
  emphasis: {
    color: 'primary.700',
    textDecoration: 'none',
  },
}

function linkToneStyles(tone: UiLinkTone): SystemStyleObject {
  const hover = linkToneHover[tone]
  return {
    _hover: hover,
    ...focusVisibleMatchesHover(hover),
  }
}

/** Chakra `Link` with no focus ring; internal `href` values use Next.js client navigation. */
export const Link = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  function Link({ as, href, tone = 'default', ...props }, ref) {
    return (
      <ChakraLink
        ref={ref}
        as={NextLink}
        href={href}
        _focus={focusRingless}
        _focusVisible={focusRingless}
        {...linkToneStyles(tone)}
        {...props}
      />
    )
  },
)

Link.displayName = 'Link'
