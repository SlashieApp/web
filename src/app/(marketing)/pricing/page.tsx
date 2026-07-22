import { Box, Container, Stack } from '@chakra-ui/react'

import { getRequestLocale } from '@/i18n/getRequestLocale'
import { loadPageI11n, metadataFromI11n } from '@/i18n/loadPageI11n'
import { withLocale } from '@/i18n/navigation'
import { Footer } from '@ui'

import { PricingDisclaimer } from './components/PricingDisclaimer'
import { PricingErrorState } from './components/PricingErrorState'
import { PricingFaq } from './components/PricingFaq'
import { PricingHeader } from './components/PricingHeader'
import { PricingPlanCards } from './components/PricingPlanCards'
import { PricingPlanDetailsLink } from './components/PricingPlanDetailsLink'
import { PricingTrialBanner } from './components/PricingTrialBanner'
import { PricingViewCapture } from './components/PricingViewCapture'
import { getPricingForPage } from './helpers/getPricingForPage'
import messages from './i11n.json'

export async function generateMetadata() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)

  return metadataFromI11n(copy.metadata, { locale, path: '/pricing' })
}

export default async function PricingPage() {
  const locale = await getRequestLocale()
  const copy = loadPageI11n(messages, locale)
  const { pricing, failed } = await getPricingForPage()

  return (
    <>
      <Box as="section" py={{ base: 8, md: 12 }} pb={{ base: 10, md: 12 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 8, md: 10 }}>
            <PricingHeader copy={copy.header} />
            {failed || !pricing ? (
              <PricingErrorState copy={copy.error} />
            ) : (
              <>
                <PricingTrialBanner pricing={pricing} copy={copy.trialBanner} />
                <PricingPlanCards pricing={pricing} copy={copy.plans} />
                <PricingPlanDetailsLink label={copy.detailsLink} />
                <PricingDisclaimer
                  copy={copy.disclaimer}
                  termsHref={withLocale(locale, '/terms')}
                />
                <Box id="plan-details" scrollMarginTop="6rem">
                  <PricingFaq pricing={pricing} copy={copy.faq} />
                </Box>
              </>
            )}
          </Stack>
        </Container>
      </Box>
      <Footer />
      <PricingViewCapture />
    </>
  )
}
