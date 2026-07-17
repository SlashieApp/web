'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'

import { Button, Card, Link } from '@ui'

import { WorkerMembershipCard } from '@/app/(dashboard)/components/WorkerMembershipCard'

export function DashboardMembershipPanel({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment | null | undefined
}) {
  if (membership) {
    return <WorkerMembershipCard membership={membership} />
  }

  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading size="md">Platform membership</Heading>
          <Text fontSize="sm" color="text.muted">
            Post tasks for free as a customer, or become a worker to send
            quotes.
          </Text>
        </Stack>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          Compare quotes from local workers. Job payments stay between you and
          your pro — not through Slashie.
        </Text>
        <Link href="/worker/setup" _hover={{ textDecoration: 'none' }}>
          <Button size="sm" w={{ base: 'full', md: 'auto' }}>
            Become a worker
          </Button>
        </Link>
      </Stack>
    </Card>
  )
}
