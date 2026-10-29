import { SectionHead } from '@/app/(marketing)/components/layout/MarketingFrame'

/** The plans section's heading id, which names the landmark. */
export const PRICING_PLANS_HEADING_ID = 'pricing-plans-heading'

/**
 * The plans section's head under the large "Membership" title, which is the
 * page's h1 (FE-449): an h2, left-aligned like every section head of the
 * frame (FE-471), 34/41 at 500 on a phone and 44/48 from `lg`, with the
 * body in `text-lg` muted. It has no eyebrow: an eyebrow needs a string of its
 * own, and this page adds none.
 */
export function PricingHeader({
  copy,
}: {
  copy: { heading: string; body: string }
}) {
  return (
    <SectionHead
      heading={copy.heading}
      headingId={PRICING_PLANS_HEADING_ID}
      body={copy.body}
    />
  )
}
