'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'

import { Button, Card, Link } from '@ui'

export function BillingNonWorkerState() {
  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading size="md">Become a worker to manage billing</Heading>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            Slashie Unlimited is for workers who send quotes on tasks. Set up
            your worker profile first, then return here to start a free trial or
            manage your subscription.
          </Text>
        </Stack>
        <Link href="/worker/setup" _hover={{ textDecoration: 'none' }}>
          <Button w={{ base: 'full', md: 'auto' }}>
            Set up worker profile
          </Button>
        </Link>
      </Stack>
    </Card>
  )
}
