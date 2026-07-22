import type { Metadata } from 'next'

import { Box, Container, Stack } from '@chakra-ui/react'

import {
  getDictionary,
  getLocalizedMetadata,
  getRequestLocale,
} from '@/i18n/getDictionary'
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale()
  const metadata = getLocalizedMetadata(locale).pricing

  return {
    title: metadata.title,
    description: metadata.description,
  }
}

export default async function PricingPage() {
  const locale = await getRequestLocale()
  const messages = getDictionary(locale)
  const { pricing, failed } = await getPricingForPage()

  return (
    <>
      <Box as="section" py={{ base: 8, md: 12 }} pb={{ base: 10, md: 12 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 8, md: 10 }}>
            <PricingHeader messages={messages.pricing.header} />
            {failed || !pricing ? (
              <PricingErrorState messages={messages.pricing.error} />
            ) : (
              <>
                <PricingTrialBanner
                  messages={messages.pricing.trialBanner}
                  pricing={pricing}
                />
                <PricingPlanCards
                  messages={messages.pricing.plans}
                  pricing={pricing}
                />
                <PricingPlanDetailsLink label={messages.pricing.detailsLink} />
                <PricingDisclaimer messages={messages.pricing.disclaimer} />
                <Box id="plan-details" scrollMarginTop="6rem">
                  <PricingFaq
                    messages={messages.pricing.faq}
                    pricing={pricing}
                  />
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
