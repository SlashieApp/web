import { landingCtaPath } from '@/app/(marketing)/components/ui/landing/sections/landingCtaPath'
import marketingMessages from '@/app/(marketing)/i11n.json'
import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { withLocale } from '@/i18n/navigation'
import { Footer } from '@ui'

import { PricingPageView } from './components/PricingPageView'
import { PricingViewCapture } from './components/analytics/PricingViewCapture'
import { getPricingForPage } from './helpers/getPricingForPage'
import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/pricing' })
}

/**
 * /pricing, redesigned to match Home (FE-552): Home's hero with the plans in
 * it, how quotes are counted (three cells with live snippets), the questions
 * and Home's closing band, in the marketing frame. The footer is its own band
 * under the frame. The demo tasks and the closing band's copy are Home's own
 * strings (`(marketing)/i11n.json`).
 */
export default async function PricingPage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)
  const marketing = loadPageI11n(marketingMessages, locale)
  const [{ pricing }, hasSession] = await Promise.all([
    getPricingForPage(),
    getHasAuthSession(),
  ])
  const session = hasSession ? 'signedIn' : 'guest'
  // A guest registers first, then goes on to the page the action is for.
  const ctaHref = (next: string) =>
    withLocale(locale, landingCtaPath(next, session))
  const ctas = marketing.common.ctas

  return (
    <>
      <PricingPageView
        pricing={pricing}
        hasSession={hasSession}
        copy={copy}
        phone={marketing.landing.phone}
        finalCta={{
          copy: marketing.landing.finalCta,
          primary: { label: ctas.postTask, href: ctaHref('/tasks/create') },
          secondary: {
            label: ctas.becomeWorker,
            href: ctaHref('/worker/setup'),
          },
        }}
      />
      <Footer />
      <PricingViewCapture />
    </>
  )
}
