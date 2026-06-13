import { Heading, Stack, Text } from '@chakra-ui/react'

export function PricingHeader() {
  return (
    <Stack gap={3} align="center" textAlign="center" maxW="40rem" mx="auto">
      <Heading
        size={{ base: 'xl', md: '2xl' }}
        letterSpacing="-0.02em"
        fontFamily="var(--font-plus-jakarta)"
      >
        Choose your Slashie plan
      </Heading>
      <Text fontSize="md" color="formLabelMuted" lineHeight="tall">
        Workers choose free or unlimited quotes.
      </Text>
    </Stack>
  )
}
