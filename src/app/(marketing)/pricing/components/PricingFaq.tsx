import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { type Messages, formatMessage } from '@/i18n/getDictionary'

import { pricingDisplayPrice } from '../helpers/formatPricing'
import type { PricingRecord } from '../helpers/getPricingForPage'

type PricingFaqProps = {
  messages: Messages['pricing']['faq']
  pricing: PricingRecord
}

export function PricingFaq({ messages, pricing }: PricingFaqProps) {
  const monthlyPrice = pricingDisplayPrice(pricing)
  return (
    <Stack gap={4} w="full">
      <Heading size="md">{messages.heading}</Heading>
      <Stack gap={3}>
        {messages.items.map((item) => (
          <Box
            key={item.question}
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="xl"
            bg="bg.surface"
            p={{ base: 4, md: 5 }}
          >
            <Stack gap={2}>
              <Text fontWeight={700} color="text.default">
                {item.question}
              </Text>
              <Text fontSize="sm" color="text.muted" lineHeight="tall">
                {formatMessage(item.answer, { price: monthlyPrice })}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
