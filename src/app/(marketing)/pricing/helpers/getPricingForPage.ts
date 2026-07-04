import { cache } from 'react'

import type { PricingQuery } from '@codegen/schema'

import { fetch } from '@/utils/api'
import Pricing from '../graphql/Pricing.gql'

export type PricingRecord = PricingQuery['pricing']

export type PricingPageData = {
  pricing: PricingRecord | null
  failed: boolean
}

export const getPricingForPage = cache(async (): Promise<PricingPageData> => {
  const json = await fetch<PricingQuery>({
    query: Pricing,
    // Public, slow-changing data: 5-minute ISR instead of the helper's
    // `revalidate: 0` default, so the marketing landing + /pricing are not
    // dynamically rendered (TTFB blocked on GraphQL) for every visitor.
    next: { revalidate: 300 },
  })

  if (!json?.data?.pricing) {
    return { pricing: null, failed: true }
  }

  return { pricing: json.data.pricing, failed: false }
})
