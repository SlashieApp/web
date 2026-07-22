import { Stack, Text } from '@chakra-ui/react'

import type { Messages } from '@/i18n/getDictionary'
import { Card } from '@ui'

export function PricingErrorState({
  messages,
}: {
  messages: Messages['pricing']['error']
}) {
  return (
    <Card
      layout="section"
      eyebrow={messages.eyebrow}
      heading={messages.heading}
    >
      <Stack gap={2}>
        <Text color="text.muted" lineHeight="tall">
          {messages.body}
        </Text>
        <Text fontSize="sm" color="text.muted">
          {messages.paymentNote}
        </Text>
      </Stack>
    </Card>
  )
}
