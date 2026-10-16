import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { formatMessage } from '@/i18n/loadPageI11n'
import { Link } from '@ui'

import {
  pricingDisplayPrice,
  pricingIntervalLabel,
  pricingTrialLength,
} from '../../../helpers/formatPricing'
import type { PricingRecord } from '../../../helpers/getPricingForPage'
import type messages from '../../../i11n.json'

type PricingCopy = (typeof messages)['en']

/** The same questions for everyone; the trial one only when the API offers a trial. */
export function PricingFaq({
  pricing,
  copy,
  intervals,
}: {
  pricing: PricingRecord
  copy: PricingCopy['faq']
  intervals: PricingCopy['intervals']
}) {
  const vars = {
    price: pricingDisplayPrice(pricing),
    interval: pricingIntervalLabel(pricing.priceInterval, intervals),
    count: pricing.freeQuotesPerMonth,
  }
  const items = [
    copy.customers,
    copy.freeQuotes,
    copy.unlimited,
    copy.payments,
    ...(pricingTrialLength(pricing.trialDays) ? [copy.trial] : []),
    copy.cancel,
  ]

  return (
    <Stack gap={4} w="full" maxW="4xl" mx="auto">
      <Heading as="h2" size="md">
        {copy.heading}
      </Heading>
      <Stack gap={3}>
        {items.map((item) => (
          <Box
            key={item.question}
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="xl"
            bg="bg.surface"
            p={{ base: 4, md: 5 }}
          >
            <Stack gap={2}>
              <Heading as="h3" size="sm">
                {item.question}
              </Heading>
              <Text fontSize="sm" color="text.muted" lineHeight="tall">
                {formatMessage(item.answer, vars)}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
      <Text fontSize="sm" color="text.muted">
        {copy.terms.before}
        <Link href="/terms" tone="emphasis">
          {copy.terms.link}
        </Link>
        {copy.terms.after}
      </Text>
    </Stack>
  )
}
