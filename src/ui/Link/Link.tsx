'use client'

import { Link as ChakraLink, type LinkProps } from '@chakra-ui/react'
import NextLink from 'next/link'
import * as React from 'react'

const focusRingless = {
  outline: 'none',
  boxShadow: 'none',
} as const

function isInternalHref(href: LinkProps['href']): boolean {
  if (href == null) return false
  if (typeof href === 'object') {
    const path = href.pathname ?? ''
    return typeof path === 'string' && path.startsWith('/')
  }
  const path = String(href)
  if (!path || path.startsWith('#')) return false
  if (/^(mailto:|tel:|http:|https:)/i.test(path)) return false
  return path.startsWith('/')
}

export type UiLinkProps = LinkProps

/** Chakra `Link` with no focus ring; internal `href` values use Next.js client navigation. */
export const Link = React.forwardRef<HTMLAnchorElement, UiLinkProps>(
  function Link({ as, href, ...props }, ref) {
    const useNextLink = as == null && isInternalHref(href)

    return (
      <ChakraLink
        ref={ref}
        as={as ?? (useNextLink ? NextLink : undefined)}
        href={href}
        _focus={focusRingless}
        _focusVisible={focusRingless}
        {...props}
      />
    )
  },
)

Link.displayName = 'Link'
