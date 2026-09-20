import { Stack, Text } from '@chakra-ui/react'

import { Card } from '@ui'

export function PricingErrorState({
  copy,
}: {
  copy: { eyebrow: string; heading: string; body: string; paymentNote: string }
}) {
  return (
    <Card layout="section" eyebrow={copy.eyebrow} heading={copy.heading}>
      <Stack gap={2}>
        <Text color="text.muted" lineHeight="tall">
          {copy.body}
        </Text>
        <Text fontSize="sm" color="text.muted">
          {copy.paymentNote}
        </Text>
      </Stack>
    </Card>
  )
}
