import { HStack, Heading, Stack, Text } from '@chakra-ui/react'

import { Button, Card, Link } from '@ui'

/**
 * The API didn't return plans: what's always true, a retry and a way on. It
 * stands where the plan cards would, in the plans section under its h2, so its
 * own heading is an h3; it is left-aligned like everything on the page. Try
 * again is the green main action (it carries `data-page-green-action`, so the
 * marketing header's Get started gives way to it); Browse tasks is a text link
 * (FE-290).
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
        {/* One main action (FE-290): Try again is the green button, Browse
            tasks a text link beside it. */}
        <HStack gap={5} flexWrap="wrap" rowGap={3}>
          <Button asChild variant="primary" data-page-green-action="">
            <Link href="/pricing" _hover={{ textDecoration: 'none' }}>
              {copy.retry}
            </Link>
          </Button>
          <Link href="/search" fontWeight={500} color="text.link">
            {copy.browse}
          </Link>
        </HStack>
      </Stack>
    </Card>
  )
}
