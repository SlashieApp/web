import { Box, Grid, Stack, Text } from '@chakra-ui/react'

import type { PricingRecord } from '../helpers/getPricingForPage'

type PricingAudienceSummaryProps = {
  pricing: PricingRecord
}

export function PricingAudienceSummary({
  pricing,
}: PricingAudienceSummaryProps) {
  const items = [
    {
      label: 'Customers',
      value: '£0',
      detail: 'Post tasks and compare quotes on Slashie.',
    },
    {
      label: 'Workers — Free',
      value: `${pricing.freeQuotesPerMonth} quotes / month`,
      detail: 'Browse tasks and send quotes until your monthly cap.',
    },
    {
      label: `Workers — ${pricing.productName}`,
      value: pricing.trialLabel?.trim() || 'Free trial',
      detail: 'Unlimited quotes while your subscription is active.',
    },
  ]

  return (
    <Grid
      templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }}
      gap={3}
      w="full"
    >
      {items.map((item) => (
        <Box
          key={item.label}
          borderWidth="1px"
          borderColor="cardBorder"
          borderRadius="xl"
          bg="cardBg"
          p={4}
        >
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="formLabelMuted"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              {item.label}
            </Text>
            <Text fontSize="md" fontWeight={800} color="cardFg">
              {item.value}
            </Text>
            <Text fontSize="sm" color="formLabelMuted" lineHeight="short">
              {item.detail}
            </Text>
          </Stack>
        </Box>
      ))}
    </Grid>
  )
}
