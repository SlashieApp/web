import type { Metadata } from 'next'

import { HomeAuthRedirect } from '@/app/(marketing)/helpers/HomeAuthRedirect'
import {
  formatPricingInterval,
  pricingDisplayPrice,
} from '@/app/(marketing)/pricing/helpers/formatPricing'
import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import { buildWorkerFreePlan } from '@/app/(marketing)/pricing/helpers/pricingPlans'
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
  const workerFree = buildWorkerFreePlan(pricing?.freeQuotesPerMonth ?? 3)
  const unlimitedPrice = pricing
    ? `${pricingDisplayPrice(pricing)}/${formatPricingInterval(pricing.priceInterval)}`
    : '£19.99/month'

  const landingPricing: LandingPricing = {
    productName: pricing?.productName ?? 'Slashie Unlimited',
    trialLabel: pricing?.trialLabel?.trim() || '6 months free trial',
    priceLine: `Then ${unlimitedPrice}`,
    freeBadge: workerFree.badge,
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
