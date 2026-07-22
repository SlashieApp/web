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
import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.landing.metadata, {
    locale,
    path: '/',
  })
}

/**
 * Marketing landing. The narrative is fully server-rendered (SEO + no-JS
 * legible); the Spotlight + Spline hero and scroll motion are client islands
 * layered on top. Signed-in visitors stay on the landing (no auto-redirect).
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
  const hrefs = {
    register: withLocale(locale, '/register'),
    login: withLocale(locale, '/login'),
    pricing: withLocale(locale, '/pricing'),
  }

  return (
    <>
      <LenisRoot />
      <HeroSection
        copy={landing.hero}
        ctas={{
          seeHowItWorks: ctas.seeHowItWorks,
        }}
      />
      <HowItWorks copy={landing.howItWorks} />
      <AudienceSection
        copy={landing.audience}
        ctas={{
          postTask: ctas.postTask,
          becomeWorker: ctas.becomeWorker,
        }}
        registerHref={hrefs.register}
      />
      <TrustSection points={landing.trust.points} />
      <PricingTeaser
        copy={landing.pricingTeaser}
        pricing={landingPricing}
        ctaLabel={ctas.viewPricing}
        pricingHref={hrefs.pricing}
      />
      <FinalCtaBand
        copy={landing.finalCta}
        ctas={{ getStarted: ctas.getStarted, logIn: ctas.logIn }}
        registerHref={hrefs.register}
        loginHref={hrefs.login}
      />
      <Footer />
    </>
  )
}
