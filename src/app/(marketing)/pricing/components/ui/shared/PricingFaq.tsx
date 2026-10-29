import { Heading, List, Stack, Text } from '@chakra-ui/react'

import { SectionHead } from '@/app/(marketing)/components/layout/MarketingFrame'
import { formatMessage } from '@/i18n/loadPageI11n'
import { Link } from '@ui'

import {
  pricingPriceLine,
  pricingTrialLength,
} from '../../../helpers/formatPricing'
import type { PricingRecord } from '../../../helpers/getPricingForPage'
import type messages from '../../../i11n.json'
import { PricingSection } from '../layout/PricingSection'

type PricingCopy = (typeof messages)['en']

/** The FAQ section's heading id, which names the landmark. */
export const PRICING_FAQ_HEADING_ID = 'pricing-faq-heading'

/**
 * The same questions for everyone; the trial one only when the API offers a
 * trial. A section of the pricing page (FE-471): the head on the left from
 * `xl` (over the questions below it), the questions as hairline rows (no
 * cards), each an h3 at 18/500 over the answer at 14 in `text.muted`, and the
 * pointer to the Terms under the last one.
 */
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
    priceLine: pricingPriceLine(pricing, intervals),
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
    <PricingSection
      data-pricing-faq=""
      headingId={PRICING_FAQ_HEADING_ID}
      head={
        <SectionHead
          heading={copy.heading}
          headingId={PRICING_FAQ_HEADING_ID}
        />
      }
    >
      <Stack gap={6}>
        <List.Root ps={0} m={0} listStyle="none">
          {items.map((item) => (
            <List.Item
              key={item.question}
              data-pricing-faq-item=""
              py={{ base: 5, md: 6 }}
              borderTopWidth="1px"
              borderColor="border.default"
              // The list's last row closes it with a hairline.
              css={{ '&:last-of-type': { borderBottomWidth: '1px' } }}
            >
              <Stack gap={1.5} maxW="42rem">
                <Heading as="h3" textStyle="heading-sm" color="text.default">
                  {item.question}
                </Heading>
                <Text textStyle="text-sm" color="text.muted">
                  {formatMessage(item.answer, vars)}
                </Text>
              </Stack>
            </List.Item>
          ))}
        </List.Root>
        <Text textStyle="text-sm" color="text.muted">
          {copy.terms.before}
          <Link href="/terms" tone="emphasis">
            {copy.terms.link}
          </Link>
          {copy.terms.after}
        </Text>
      </Stack>
    </PricingSection>
  )
}
