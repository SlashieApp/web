import { Container, Stack } from '@chakra-ui/react'

import { getHasAuthSession } from '@/app/helpers/getHasAuthSession'
import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { Footer } from '@ui'

import { PricingPlans } from './components/PricingPlans'
import { PricingViewCapture } from './components/analytics/PricingViewCapture'
import { PricingFaq } from './components/ui/shared/PricingFaq'
import { PricingHeader } from './components/ui/shared/PricingHeader'
import { getPricingForPage } from './helpers/getPricingForPage'
import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/pricing' })
}

/** /pricing: header, the viewer's plans (see views/README.md), FAQ. */
export default async function PricingPage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)
  const [{ pricing }, hasSession] = await Promise.all([
    getPricingForPage(),
    getHasAuthSession(),
  ])

  return (
    <>
      <Container as="section" py={{ base: 8, md: 12 }}>
        <Stack gap={{ base: 8, md: 10 }}>
          <PricingHeader copy={copy.header} />
          <PricingPlans
            pricing={pricing}
            hasSession={hasSession}
            copy={{
              plans: copy.plans,
              intervals: copy.intervals,
              unavailable: copy.unavailable,
            }}
          />
          {pricing ? (
            <PricingFaq
              pricing={pricing}
              copy={copy.faq}
              intervals={copy.intervals}
            />
          ) : null}
        </Stack>
      </Container>
      <Footer />
      <PricingViewCapture />
    </>
  )
}
