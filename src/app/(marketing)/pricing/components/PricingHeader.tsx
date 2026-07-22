import { Heading, Stack, Text } from '@chakra-ui/react'

import type { Messages } from '@/i18n/getDictionary'

export function PricingHeader({
  messages,
}: {
  messages: Messages['pricing']['header']
}) {
  return (
    <Stack gap={3} align="center" textAlign="center" maxW="40rem" mx="auto">
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        letterSpacing="-0.02em"
        fontFamily="var(--font-plus-jakarta)"
      >
        {messages.heading}
      </Heading>
      <Text fontSize="md" color="text.muted" lineHeight="tall">
        {messages.body}
      </Text>
    </Stack>
  )
}
