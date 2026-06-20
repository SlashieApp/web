'use client'

import { Link as ChakraLink, type LinkProps } from '@chakra-ui/react'
import NextLink from 'next/link'
import * as React from 'react'

const focusRingless = {
  outline: 'none',
  boxShadow: 'none',
} as const

export type UiLinkProps = LinkProps

/** Chakra `Link` with no focus ring; internal `href` values use Next.js client navigation. */
export const Link = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  function Link({ as, href, ...props }, ref) {
    return (
      <ChakraLink
        ref={ref}
        as={NextLink}
        href={href}
        _focus={focusRingless}
        _focusVisible={focusRingless}
        {...props}
      />
    )
  },
)

Link.displayName = 'Link'
