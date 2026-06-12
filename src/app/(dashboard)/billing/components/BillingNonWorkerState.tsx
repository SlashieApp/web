'use client'

import { Heading, Link, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'

import { Button, SectionCard } from '@ui'

export function BillingNonWorkerState() {
  return (
    <SectionCard p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={2}>
          <Heading size="md">Become a worker to manage billing</Heading>
          <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
            Slashie Unlimited is for workers who send quotes on tasks. Set up
            your worker profile first, then return here to start a free trial or
            manage your subscription.
          </Text>
        </Stack>
        <Link
          as={NextLink}
          href="/worker/setup"
          _hover={{ textDecoration: 'none' }}
        >
          <Button w={{ base: 'full', md: 'auto' }}>
            Set up worker profile
          </Button>
        </Link>
      </Stack>
    </SectionCard>
  )
}
