import { Box } from '@chakra-ui/react'

import { pricingPriceLine } from '@/app/(marketing)/pricing/helpers/formatPricing'
import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import pricingBag from '@/app/(marketing)/pricing/i11n.json'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import {
  formatMessage,
  loadPageI11n,
  metadataFromI11n,
} from '@/i18n/loadPageI11n'
import { withLocale } from '@/i18n/navigation'
import { Footer } from '@/ui'
import { MARKETING_HOME } from '@/utils/appRoutes'

import {
  MarketingFrame,
  SectionRule,
} from '../components/layout/MarketingFrame'
import { LenisRoot } from '../components/ui/landing/LenisRoot'
import { BentoSection } from '../components/ui/landing/bento/BentoSection'
import { HeroSection } from '../components/ui/landing/hero/HeroSection'
import { LandingBackdrop } from '../components/ui/landing/scene/LandingBackdrop'
import { FinalCtaBand } from '../components/ui/landing/sections/FinalCtaBand'
import { FloatingPostPill } from '../components/ui/landing/sections/FloatingPostPill'
import {
  type LandingPricing,
  PricingTeaser,
} from '../components/ui/landing/sections/PricingTeaser'
import { TrustSection } from '../components/ui/landing/sections/TrustSection'
import { MapShowcase } from '../components/ui/landing/showcase/MapShowcase'
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
 * Marketing landing at `/home`: a scroll story (hero, the map panel, the
 * bento, customer act, worker act, trust, pricing, close) on a white page with
 * floating 3D objects, and a demo phone that follows the story. The sections
 * sit in the marketing frame (rails down the content column from `lg`, a
 * full-width rule between sections); the footer is its own band under it. A
 * floating "Post a task" pill (to the same place as the close's) shows once the
 * hero is out of view and gives way to the close and the footer. All
 * copy is server-rendered (SEO + no-JS legible); the scene, phone motion and
 * scroll tracking are client layers on top. Root `/` auth-redirects guests
 * here and signed-in users to `/search`.
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
    ? pricingPriceLine(pricing, loadPageI11n(pricingBag, locale).intervals)
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
        <MarketingFrame>
          <LandingStory
            hero={
              <HeroSection
                copy={landing.hero}
                ctas={{ seeHowItWorks: ctas.seeHowItWorks }}
              />
            }
            showcase={
              <>
                <SectionRule />
                <MapShowcase copy={landing.phone} />
                <SectionRule />
                <BentoSection
                  steps={landing.story.customer.steps}
                  phone={landing.phone}
                />
                <SectionRule />
              </>
            }
            story={landing.story}
            phone={landing.phone}
          />
          <SectionRule />
          <StoryStageMarker stage="trust">
            <TrustSection points={landing.trust.points} />
          </StoryStageMarker>
          <SectionRule />
          <StoryStageMarker stage="pricing">
            <PricingTeaser
              copy={landing.pricingTeaser}
              pricing={landingPricing}
              ctaLabel={ctas.viewPricing}
              pricingHref={hrefs.pricing}
            />
          </StoryStageMarker>
          <SectionRule />
          <StoryStageMarker stage="cta">
            <FinalCtaBand
              copy={landing.finalCta}
              primary={{ label: ctas.postTask, href: hrefs.postTask }}
              secondary={{ label: ctas.becomeWorker, href: hrefs.becomeWorker }}
            />
          </StoryStageMarker>
        </MarketingFrame>
        <Footer />
      </Box>
      <FloatingPostPill label={ctas.postTask} href={hrefs.postTask} />
      <StoryTracker />
    </Box>
  )
}
