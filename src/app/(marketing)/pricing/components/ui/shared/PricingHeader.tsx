import { LuTag } from 'react-icons/lu'

import { SectionHead } from '@/app/(marketing)/components/layout/MarketingFrame'

/** The plans section's heading id, which names the landmark. */
export const PRICING_PLANS_HEADING_ID = 'pricing-plans-heading'

/**
 * The plans section's head under the large "Membership" title, which is the
 * page's h1 (FE-449): an h2, left-aligned like every section head of the
 * frame (FE-471), with the same eyebrow as the landing's pricing teaser (the
 * nav's "Pricing", today's string, with a small green 600 tag icon), 34/41 at
 * 500 like the page title (`size="title"`: a section head under a 34/41 title
 * must not out-size it, as the 44/48 display head did), and the body in
 * `text-lg` muted.
 */
export function PricingHeader({
  copy,
  eyebrow,
}: {
  copy: { heading: string; body: string }
  /** The nav's "Pricing" (`i11n.chrome.json`), the same word as the teaser's eyebrow. */
  eyebrow: string
}) {
  return (
    <SectionHead
      eyebrow={eyebrow}
      icon={LuTag}
      size="title"
      heading={copy.heading}
      headingId={PRICING_PLANS_HEADING_ID}
      body={copy.body}
    />
  )
}
