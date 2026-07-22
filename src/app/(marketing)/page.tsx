import type { Metadata } from 'next'

import { HomeAuthRedirect } from '@/app/(marketing)/helpers/HomeAuthRedirect'
import {
  formatPricingInterval,
  pricingDisplayPrice,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import {
  formatMessage,
  getDictionary,
  getLocalizedMetadata,
  getRequestLocale,
} from '@/i18n/getDictionary'
import { Footer } from '@/ui'

import { LenisRoot } from './components/landing/LenisRoot'
import { HeroSection } from './components/landing/hero/HeroSection'
import { AudienceSection } from './components/landing/sections/AudienceSection'
import { FinalCtaBand } from './components/landing/sections/FinalCtaBand'
import { HowItWorks } from './components/landing/sections/HowItWorks'
import {
  type LandingPricing,
  PricingTeaser,
} from './components/landing/sections/PricingTeaser'
import { TrustSection } from './components/landing/sections/TrustSection'

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const metadata = getLocalizedMetadata(locale).landing

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: 'Slashie',
      title: metadata.title,
      description: metadata.description,
      url: '/',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
    },
  }
}

/**
 * Marketing landing. The narrative is fully server-rendered (SEO + no-JS
 * legible); the WebGL living-map hero and scroll motion are client islands
 * layered on top. Signed-in visitors are redirected to the app by
 * `HomeAuthRedirect` — unchanged behavior.
 */
export default async function MarketingHomePage() {
  const locale = await getRequestLocale()
  const messages = getDictionary(locale)
  const { pricing } = await getPricingForPage()

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
      messages.landing.pricingTeaser.unlimitedHeadlineFallback,
    subline: trialLabel
      ? priceLine
        ? formatMessage(
            messages.landing.pricingTeaser.unlimitedSublineWithPrice,
            { priceLine },
          )
        : messages.landing.pricingTeaser.unlimitedSublineFallback
      : messages.landing.pricingTeaser.unlimitedSublineFallback,
    freeHeadline: formatMessage(messages.landing.pricingTeaser.freeHeadline, {
      count: freeQuotes,
    }),
  }

  return (
    <>
      <HomeAuthRedirect />
      <LenisRoot />
      <HeroSection
        ctas={messages.common.ctas}
        messages={messages.landing.hero}
      />
      <HowItWorks messages={messages.landing.howItWorks} />
      <AudienceSection
        ctas={messages.common.ctas}
        messages={messages.landing.audience}
      />
      <TrustSection messages={messages.landing.trust} />
      <PricingTeaser
        ctas={messages.common.ctas}
        messages={messages.landing.pricingTeaser}
        pricing={landingPricing}
      />
      <FinalCtaBand
        ctas={messages.common.ctas}
        messages={messages.landing.finalCta}
      />
      <Footer />
    </>
  )
}
