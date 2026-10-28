import { Heading, Stack, Text } from '@chakra-ui/react'

/**
 * The page's own heading under the large "Membership" title, which is the
 * page's h1 (FE-449): an h2 at the size it always had.
 */
export function PricingHeader({
  copy,
}: {
  copy: { heading: string; body: string }
}) {
  return (
    <Stack gap={3} align="center" textAlign="center" maxW="40rem" mx="auto">
      <Heading as="h2" size={{ base: 'xl', md: '2xl' }} fontFamily="display">
        {copy.heading}
      </Heading>
      <Text fontSize="md" color="text.muted" lineHeight="tall">
        {copy.body}
      </Text>
    </Stack>
  )
}
