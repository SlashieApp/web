import { Heading, Stack, Text } from '@chakra-ui/react'

export function WorkersBrowseHeader() {
  return (
    <Stack gap={2}>
      <Text
        fontSize="xs"
        fontWeight={700}
        color="text.link"
        letterSpacing="0.08em"
        textTransform="uppercase"
      >
        Discover
      </Text>
      <Heading size={{ base: 'lg', md: 'xl' }} letterSpacing="-0.02em">
        Workers
      </Heading>
      <Text fontSize="sm" color="text.muted" lineHeight="tall" maxW="48rem">
        Browse worker profiles before you accept a quote. Open a profile to see
        bio, skills, and reputation.
      </Text>
    </Stack>
  )
}
