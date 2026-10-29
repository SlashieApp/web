import { HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { Button, Card, Link } from '@ui'

/**
 * The API didn't return plans: what's always true, a retry and a way on. It
 * stands where the plan cards would, in the plans section under its h2, so its
 * own heading is an h3; it is left-aligned like everything on the page. Both
 * pills are outline: the marketing header's Get started is the screen's one
 * green button.
 */
export function PricingErrorState({
  copy,
}: {
  copy: { heading: string; body: string; retry: string; browse: string }
}) {
  return (
    <Card layout="section" maxW="2xl" w="full">
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading as="h3" size="md">
            {copy.heading}
          </Heading>
          <Text color="text.muted" lineHeight="tall">
            {copy.body}
          </Text>
        </Stack>
        <HStack gap={3} flexWrap="wrap">
          <Button asChild variant="secondary">
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
