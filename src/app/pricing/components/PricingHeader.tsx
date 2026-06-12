import { Heading, Stack, Text } from '@chakra-ui/react'

export function PricingHeader() {
  return (
    <Stack gap={3} align="center" textAlign="center" maxW="40rem" mx="auto">
      <Text
        fontSize="xs"
        fontWeight={700}
        color="primary.600"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        Pricing
      </Text>
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        letterSpacing="-0.02em"
        fontFamily="var(--font-plus-jakarta)"
      >
        Simple, honest pricing
      </Heading>
      <Text fontSize="md" color="formLabelMuted" lineHeight="tall">
        Customers post tasks for free. Workers choose the free quote tier or
        Slashie Unlimited for unlimited quoting — subscription is for platform
        access, not job payments.
      </Text>
    </Stack>
  )
}
