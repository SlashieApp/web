import chromeMessages from '@/app/(marketing)/i11n.chrome.json'
import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
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
 * /pricing: the page header with a large "Membership" (FE-458: it shrinks
 * into the bar on scroll, as on Account and Plan & billing; it is the page's
 * h1), then the plans section (its own heading, the viewer's plans: see
 * views/README.md) and the FAQ, in the marketing frame (FE-471). The footer
 * is its own band under the frame.
 */
export default async function PricingPage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)
  const chrome = loadPageI11n(chromeMessages, locale)
  const [{ pricing }, hasSession] = await Promise.all([
    getPricingForPage(),
    getHasAuthSession(),
  ])

  return (
    <>
      <PricingPageView
        pricing={pricing}
        hasSession={hasSession}
        copy={copy}
        eyebrow={chrome.pricing}
      />
      <Footer />
      <PricingViewCapture />
    </>
  )
}
