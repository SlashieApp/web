import { gql } from '@apollo/client'

import type { Price } from '@codegen/schema'

import { apolloClient } from '@/utils/apolloClient'

const QUOTE_PRICE_FRAGMENT = gql`
  fragment QuotePriceFields on Quote {
    price {
      amount
      currency
    }
  }
`

/** Reads a quote price retained in Apollo cache (e.g. after `addQuote`). */
export function quotePriceFromCache(quoteId: string): Price | null | undefined {
  const cacheId = apolloClient.cache.identify({
    __typename: 'Quote',
    id: quoteId,
  })
  if (!cacheId) return undefined

  const cached = apolloClient.cache.readFragment<{ price?: Price | null }>({
    id: cacheId,
    fragment: QUOTE_PRICE_FRAGMENT,
  })

  return cached?.price
}
