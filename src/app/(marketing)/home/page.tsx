import { Box } from '@chakra-ui/react'

import { getPricingForPage } from '@/app/(marketing)/pricing/helpers/getPricingForPage'
import pricingBag from '@/app/(marketing)/pricing/i11n.json'
import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
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
import { FinalCtaBand } from '../components/ui/landing/sections/FinalCtaBand'
import { FloatingPostPill } from '../components/ui/landing/sections/FloatingPostPill'
import { PricingTeaser } from '../components/ui/landing/sections/PricingTeaser'
import { TrustSection } from '../components/ui/landing/sections/TrustSection'
import { landingCtaPath } from '../components/ui/landing/sections/landingCtaPath'
import { landingPricing } from '../components/ui/landing/sections/landingPricing'
import { HeroStage } from '../components/ui/landing/stage/HeroStage'
import { buildHeroStageCopy } from '../components/ui/landing/stage/heroStageCopy'
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
 * Marketing landing at `/home`: a scroll story (the hero with its scene, the
 * bento, customer act, worker act, trust, pricing, close) on a white page,
 * and a demo phone that follows the story. The hero's scene (`HeroStage`,
 * FE-542) is the product doing its job: quotes arrive on a task and the
 * customer accepts one. The sections sit in the marketing frame (rails down
 * the content column from `lg`, a full-width rule between sections); the
 * footer is its own band under it. A floating "Post a task" pill (to the same
 * place as the close's) shows once the hero is out of view and gives way to
 * the close and the footer. All copy is server-rendered (SEO + no-JS
 * legible); the scene, phone motion and scroll tracking are client layers on
 * top. Root `/` auth-redirects guests here and signed-in users to `/search`.
 */
export default async function MarketingHomePage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)
  const [{ pricing }, hasSession] = await Promise.all([
    getPricingForPage(),
    getHasAuthSession(),
  ])
  const landing = copy.landing
  const ctas = copy.common.ctas
  const session = hasSession ? 'signedIn' : 'guest'

  // A guest registers first, then goes on to the page the CTA is for; a
  // visitor with a session goes straight there (`landingCtaPath`).
  const ctaHref = (next: string) =>
    withLocale(locale, landingCtaPath(next, session))
  const hrefs = {
    pricing: withLocale(locale, '/pricing'),
    postTask: ctaHref('/tasks/create'),
    becomeWorker: ctaHref('/worker/setup'),
  }

  return (
    // The white page (`bg.surface`, no mint wash) is this box's own ground.
    <Box position="relative" isolation="isolate" bg="bg.surface">
      <LenisRoot />
      <Box position="relative" zIndex={1}>
        <MarketingFrame>
          <LandingStory
            hero={
              <HeroSection
                copy={landing.hero}
                ctas={{
                  postTask: ctas.postTask,
                  browseTasks: ctas.browseTasks,
                }}
                stage={
                  <HeroStage
                    copy={buildHeroStageCopy(landing.heroStage, locale)}
                  />
                }
                session={session}
              />
            }
            showcase={
              <>
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
              eyebrow={copy.header.nav.pricing}
              // Only what live pricing backs: no trial, price or quota is
              // made up when the API reports none (or the fetch fails).
              pricing={landingPricing(
                pricing,
                landing.pricingTeaser,
                loadPageI11n(pricingBag, locale),
              )}
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
