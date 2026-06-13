import type { Metadata } from 'next'

import { Box, Container, Stack } from '@chakra-ui/react'

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

export const metadata: Metadata = {
  title: 'Pricing | Slashie',
  description:
    'Customers post tasks for free. Workers choose the free quote tier or Slashie Unlimited for unlimited quoting. Job payments stay between customer and worker.',
}

export default async function PricingPage() {
  const { pricing, failed } = await getPricingForPage()

  return (
    <>
      <Box as="section" py={{ base: 8, md: 12 }} pb={{ base: 10, md: 12 }}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 8, md: 10 }}>
            <PricingHeader />
            {failed || !pricing ? (
              <PricingErrorState />
            ) : (
              <>
                <PricingTrialBanner pricing={pricing} />
                <PricingPlanCards pricing={pricing} />
                <PricingPlanDetailsLink />
                <PricingDisclaimer />
                <Box id="plan-details" scrollMarginTop="6rem">
                  <PricingFaq pricing={pricing} />
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
