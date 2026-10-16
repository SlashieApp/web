import { HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { Button, Card, Link } from '@ui'

/** The API didn't return plans: what's always true, a retry and a way on. */
export function PricingErrorState({
  copy,
}: {
  copy: { heading: string; body: string; retry: string; browse: string }
}) {
  return (
    <Card layout="section" maxW="2xl" mx="auto" w="full">
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading as="h2" size="md">
            {copy.heading}
          </Heading>
          <Text color="text.muted" lineHeight="tall">
            {copy.body}
          </Text>
        </Stack>
        <HStack gap={3} flexWrap="wrap">
          <Button asChild>
            <Link href="/pricing" _hover={{ textDecoration: 'none' }}>
              {copy.retry}
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/search" _hover={{ textDecoration: 'none' }}>
              {copy.browse}
            </Link>
          </Button>
        </HStack>
      </Stack>
    </Card>
  )
}
