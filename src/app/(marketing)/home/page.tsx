import { Box } from '@chakra-ui/react'

import {
  formatPricingInterval,
  pricingDisplayPrice,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import {
  formatMessage,
  loadPageI11n,
  metadataFromI11n,
} from '@/i18n/loadPageI11n'
import { withLocale } from '@/i18n/navigation'
import { Footer } from '@/ui'
import { MARKETING_HOME } from '@/utils/appRoutes'

import { LenisRoot } from '../components/ui/landing/LenisRoot'
import { HeroSection } from '../components/ui/landing/hero/HeroSection'
import { LandingBackdrop } from '../components/ui/landing/scene/LandingBackdrop'
import { FinalCtaBand } from '../components/ui/landing/sections/FinalCtaBand'
import {
  type LandingPricing,
  PricingTeaser,
} from '../components/ui/landing/sections/PricingTeaser'
import { TrustSection } from '../components/ui/landing/sections/TrustSection'
import { LandingStory } from '../components/ui/landing/story/LandingStory'
import {
  StoryStageMarker,
  StoryTracker,
} from '../components/ui/landing/story/StoryTracker'
import messages from '../i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.landing.metadata, {
    locale,
    path: MARKETING_HOME,
  })
}

/**
 * Marketing landing at `/home`: a scroll story (hero, customer act, worker
 * act, trust, pricing, close) over a fixed mint backdrop with floating 3D
 * objects, and a demo phone that follows the story. All copy is
 * server-rendered (SEO + no-JS legible); the scene, phone motion and scroll
 * tracking are client layers on top. Root `/` auth-redirects guests here
 * and signed-in users to `/search`.
 */
export default async function MarketingHomePage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)
  const { pricing } = await getPricingForPage()
  const landing = copy.landing
  const ctas = copy.common.ctas

  // Only claims backed by live pricing render: no fabricated trial or price
  // when the API reports none (or the fetch fails) — the card degrades to a
  // truthful generic line and /pricing carries the detail.
  const priceLine = pricing
    ? `${pricingDisplayPrice(pricing)}/${formatPricingInterval(pricing.priceInterval)}`
    : null
  const trialLabel = pricing?.trialLabel?.trim() || null
  const freeQuotes = pricing?.freeQuotesPerMonth ?? 3

  const landingPricing: LandingPricing = {
    productName: pricing?.productName ?? 'Slashie Unlimited',
    headline:
      trialLabel ??
      priceLine ??
      landing.pricingTeaser.unlimitedHeadlineFallback,
    subline: trialLabel
      ? priceLine
        ? formatMessage(landing.pricingTeaser.unlimitedSublineWithPrice, {
            priceLine,
          })
        : landing.pricingTeaser.unlimitedSublineFallback
      : landing.pricingTeaser.unlimitedSublineFallback,
    freeHeadline: formatMessage(landing.pricingTeaser.freeHeadline, {
      count: freeQuotes,
    }),
  }
  // Register first, then on to the page the CTA is for.
  const registerThen = (next: string) =>
    withLocale(locale, `/register?next=${encodeURIComponent(next)}`)
  const hrefs = {
    pricing: withLocale(locale, '/pricing'),
    postTask: registerThen('/tasks/create'),
    becomeWorker: registerThen('/worker/setup'),
  }

  return (
    <Box position="relative" isolation="isolate">
      <LenisRoot />
      <LandingBackdrop />
      <Box position="relative" zIndex={1}>
        <LandingStory
          hero={
            <HeroSection
              copy={landing.hero}
              ctas={{ seeHowItWorks: ctas.seeHowItWorks }}
            />
          }
          story={landing.story}
          phone={landing.phone}
        />
        <StoryStageMarker stage="trust">
          <TrustSection points={landing.trust.points} />
        </StoryStageMarker>
        <StoryStageMarker stage="pricing">
          <PricingTeaser
            copy={landing.pricingTeaser}
            pricing={landingPricing}
            ctaLabel={ctas.viewPricing}
            pricingHref={hrefs.pricing}
          />
        </StoryStageMarker>
        <StoryStageMarker stage="cta">
          <FinalCtaBand
            copy={landing.finalCta}
            primary={{ label: ctas.postTask, href: hrefs.postTask }}
            secondary={{ label: ctas.becomeWorker, href: hrefs.becomeWorker }}
          />
        </StoryStageMarker>
        <Footer />
      </Box>
      <StoryTracker />
    </Box>
  )
}
