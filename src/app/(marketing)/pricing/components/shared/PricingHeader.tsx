import { Heading, Stack, Text } from '@chakra-ui/react'

export function PricingHeader({
  copy,
}: {
  copy: { heading: string; body: string }
}) {
  return (
    <Stack gap={3} align="center" textAlign="center" maxW="40rem" mx="auto">
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        letterSpacing="-0.02em"
        fontFamily="var(--font-plus-jakarta)"
      >
        {copy.heading}
      </Heading>
      <Text fontSize="md" color="text.muted" lineHeight="tall">
        {copy.body}
      </Text>
    </Stack>
  )
}
