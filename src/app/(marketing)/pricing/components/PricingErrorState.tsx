import { Stack, Text } from '@chakra-ui/react'

import { Card } from '@ui'

export function PricingErrorState() {
  return (
    <Card layout="section" eyebrow="Pricing" heading="Pricing unavailable">
      <Stack gap={2}>
        <Text color="formLabelMuted" lineHeight="tall">
          We could not load plan details right now. Please refresh the page or
          try again in a few minutes.
        </Text>
        <Text fontSize="sm" color="formLabelMuted">
          Job payments are always arranged directly between customers and
          workers outside Slashie.
        </Text>
      </Stack>
    </Card>
  )
}
