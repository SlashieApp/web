import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import { MarketingPageHeader } from '@/app/(marketing)/components/layout/MarketingPageHeader'
import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

import type { PricingRecord } from '../helpers/getPricingForPage'
import type messages from '../i11n.json'
import { PricingPlans } from './PricingPlans'
import { PricingSection } from './ui/layout/PricingSection'
import { PricingFaq } from './ui/shared/PricingFaq'
import {
  PRICING_PLANS_HEADING_ID,
  PricingHeader,
} from './ui/shared/PricingHeader'

type PricingCopy = (typeof messages)['en']

/**
 * The pricing page inside the marketing frame (FE-471, tone train 2): a white
 * page, from `lg` a 1px rail down each side of the page column and a
 * full-width rule between the sections, which are the page header's title (the
 * h1, FE-458: it collapses into the bar as the page scrolls), the plans and
 * the questions. Everything but the footer and the view's analytics: the page
 * (`page.tsx`) adds those under it.
 *
 * The page header sits outside a `<Container>` and says its colour and column
 * (the same measure and gutters as one), so the rules can run edge to edge
 * inside it; each section brings its own `<Container>`.
 *
 * With no plans from the API (`pricing: null`) the plans section shows the
 * "Pricing isn't loading" card and the questions are left out, as before.
 */
export function PricingPageView({
  pricing,
  hasSession,
  copy,
}: {
  pricing: PricingRecord | null
  hasSession: boolean
  copy: PricingCopy
}) {
  return (
    // The page header's bar is opaque and 10 deep: the rails go over it.
    <MarketingFrame bg="bg.surface" railsZIndex={11}>
      <MarketingPageHeader
        title={copy.title}
        background="bg.surface"
        contentMaxW={PAGE_CONTAINER_MAX_W}
        contentPx={PAGE_GUTTER_X}
      >
        <SectionRule />
        <PricingSection
          data-pricing-plans-section=""
          headingId={PRICING_PLANS_HEADING_ID}
          head={<PricingHeader copy={copy.header} />}
        >
          <PricingPlans
            pricing={pricing}
            hasSession={hasSession}
            copy={{
              plans: copy.plans,
              intervals: copy.intervals,
              unavailable: copy.unavailable,
            }}
          />
        </PricingSection>
        {pricing ? (
          <>
            <SectionRule />
            <PricingFaq
              pricing={pricing}
              copy={copy.faq}
              intervals={copy.intervals}
            />
          </>
        ) : null}
      </MarketingPageHeader>
    </MarketingFrame>
  )
}
