import {
  MarketingFrame,
  SectionRule,
} from '@/app/(marketing)/components/layout/MarketingFrame'
import type { PhoneCopy } from '@/app/(marketing)/components/ui/landing/phone/phoneCopy'
import { FinalCtaBand } from '@/app/(marketing)/components/ui/landing/sections/FinalCtaBand'

import type { PricingRecord } from '../helpers/getPricingForPage'
import type messages from '../i11n.json'
import { PricingPlans } from './PricingPlans'
import { PricingCountingSection } from './ui/counting/PricingCountingSection'
import { PricingHero } from './ui/hero/PricingHero'
import { PricingFaq } from './ui/shared/PricingFaq'

type PricingCopy = (typeof messages)['en']

type CtaLink = { label: string; href: string }

/**
 * The pricing page, redesigned to match Home (FE-552), inside the marketing
 * frame (rails down the content column from `lg`, a full-width rule between
 * sections):
 *
 * 1. The hero, built like Home's: the h1 and body centred over the faint
 *    radial grey, and the two plans straight under them.
 * 2. How quotes are counted: three cells like Home's bento, each with a small
 *    live snippet (the free allowance filling up, an edit that does not count
 *    again, Slashie Unlimited with no limit).
 * 3. The questions.
 * 4. Home's closing band: Post a task and Become a worker.
 *
 * Everything but the footer and the view's analytics: the page (`page.tsx`)
 * adds those under it. With no plans from the API (`pricing: null`) the hero
 * shows the "Pricing isn't loading" card and the counting and questions are
 * left out: they need the live allowance and price.
 */
export function PricingPageView({
  pricing,
  hasSession,
  copy,
  phone,
  finalCta,
}: {
  pricing: PricingRecord | null
  hasSession: boolean
  copy: PricingCopy
  /** The landing's demo copy: the snippets quote on its tasks. */
  phone: PhoneCopy
  /** Home's closing band: its copy and its two actions (hrefs localized). */
  finalCta: {
    copy: { heading: string; body: string }
    primary: CtaLink
    secondary: CtaLink
  }
}) {
  return (
    <MarketingFrame bg="bg.surface">
      <PricingHero copy={copy.header}>
        <PricingPlans
          pricing={pricing}
          hasSession={hasSession}
          copy={{
            plans: copy.plans,
            intervals: copy.intervals,
            unavailable: copy.unavailable,
          }}
        />
      </PricingHero>
      {pricing ? (
        <>
          <SectionRule />
          <PricingCountingSection
            pricing={pricing}
            copy={copy.counting}
            phone={phone}
          />
          <SectionRule />
          <PricingFaq
            pricing={pricing}
            copy={copy.faq}
            intervals={copy.intervals}
          />
        </>
      ) : null}
      <SectionRule />
      <FinalCtaBand {...finalCta} />
    </MarketingFrame>
  )
}
