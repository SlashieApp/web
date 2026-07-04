import type { Metadata } from 'next'

import { HomeAuthRedirect } from '@/app/(marketing)/helpers/HomeAuthRedirect'
import {
  formatPricingInterval,
  pricingDisplayPrice,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
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

const PAGE_TITLE = 'Slashie — Local tasks and trusted quotes'
const PAGE_DESCRIPTION =
  'Slashie is a map-first local task marketplace. Post a task, compare quotes from nearby workers, and pay the worker directly — Slashie never takes a cut of the job.'

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: 'Slashie',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
}

/**
 * Marketing landing. The narrative is fully server-rendered (SEO + no-JS
 * legible); the WebGL living-map hero and scroll motion are client islands
 * layered on top. Signed-in visitors are redirected to the app by
 * `HomeAuthRedirect` — unchanged behavior.
 */
export default async function MarketingHomePage() {
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
    headline: trialLabel ?? priceLine ?? 'Unlimited quotes',
    subline: trialLabel
      ? priceLine
        ? `Then ${priceLine} · unlimited quotes`
        : 'Unlimited quotes for one subscription'
      : 'Unlimited quotes for one subscription',
    freeHeadline: `${freeQuotes} quotes a month`,
  }

  return (
    <>
      <HomeAuthRedirect />
      <LenisRoot />
      <HeroSection />
      <HowItWorks />
      <AudienceSection />
      <TrustSection />
      <PricingTeaser pricing={landingPricing} />
      <FinalCtaBand />
      <Footer />
    </>
  )
}
