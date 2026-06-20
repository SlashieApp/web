'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'

import { Button, Link } from '@ui'

export function QuoteLimitPaywall() {
  return (
    <Stack
      gap={3}
      borderWidth="1px"
      borderColor="orange.200"
      borderRadius="xl"
      bg="orange.50"
      p={4}
    >
      <Text fontSize="sm" fontWeight={700} color="orange.900">
        Monthly quote limit reached
      </Text>
      <Text fontSize="sm" color="orange.900" lineHeight="tall">
        You&apos;ve used all free quotes this UTC month. Upgrade to Slashie
        Unlimited for unlimited quoting — separate from job payments between you
        and the customer.
      </Text>
      <HStack gap={2} flexWrap="wrap">
        <Link href="/billing" _hover={{ textDecoration: 'none' }}>
          <Button size="sm">Upgrade on billing</Button>
        </Link>
      </HStack>
    </Stack>
  )
}
