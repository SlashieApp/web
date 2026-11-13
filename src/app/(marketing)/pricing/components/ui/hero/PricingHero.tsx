import type { ReactNode } from 'react'

import { CentredHero } from '@/app/(marketing)/components/layout/CentredHero'

/** The hero's heading id: the page's h1, which names the plans landmark. */
export const PRICING_HERO_HEADING_ID = 'pricing-hero-heading'

/**
 * The top of the pricing page, built like Home's hero (FE-552): the shared
 * centred hero, with the plans straight under the copy. On this page the
 * plans are the answer to the headline, as the post field is on Home, so the
 * prices stay above the fold.
 */
export function PricingHero({
  copy,
  children,
}: {
  copy: { heading: string; body: string }
  /** The plan cards (or the "Pricing isn't loading" card). */
  children: ReactNode
}) {
  return (
    <CentredHero
      headingId={PRICING_HERO_HEADING_ID}
      heading={copy.heading}
      body={copy.body}
      data-pricing-hero=""
      data-pricing-plans-section=""
    >
      {children}
    </CentredHero>
  )
}
