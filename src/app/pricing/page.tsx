import type { Metadata } from 'next'

import { Box, Container, Stack, Text } from '@chakra-ui/react'

import { Footer } from '@ui'

import { PricingAudienceSummary } from './components/PricingAudienceSummary'
import { PricingErrorState } from './components/PricingErrorState'
import { PricingFaq } from './components/PricingFaq'
import { PricingHeader } from './components/PricingHeader'
import { PricingPlanCards } from './components/PricingPlanCards'
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
        <Container maxW="5xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 8, md: 10 }}>
            <PricingHeader />
            {failed || !pricing ? (
              <PricingErrorState />
            ) : (
              <>
                <PricingAudienceSummary pricing={pricing} />
                <PricingPlanCards pricing={pricing} />
                <PricingFaq pricing={pricing} />
                <Text
                  fontSize="sm"
                  color="formLabelMuted"
                  textAlign="center"
                  lineHeight="tall"
                >
                  Starting in Central London. Prices shown in{' '}
                  {pricing.priceCurrency.toUpperCase()}. Platform subscription
                  is separate from job payment, which customers and workers
                  arrange directly outside Slashie.
                </Text>
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
