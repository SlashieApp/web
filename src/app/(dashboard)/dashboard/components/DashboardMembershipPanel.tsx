'use client'

import { Heading, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'

import { Button, Card, Link } from '@ui'

import { WorkerMembershipCard } from '@/app/(dashboard)/components/WorkerMembershipCard'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'

import bag from '../i11n.json'

export function DashboardMembershipPanel({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment | null | undefined
}) {
  const t = useI11n(bag)
  const href = useLocalizedHref()
  if (membership) {
    return <WorkerMembershipCard membership={membership} />
  }

  return (
    <Card layout="section" p={{ base: 5, md: 6 }}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Heading size="md">{t.membershipEmpty.title}</Heading>
          <Text fontSize="sm" color="text.muted">
            {t.membershipEmpty.description}
          </Text>
        </Stack>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {t.membershipEmpty.body}
        </Text>
        <Link href={href('/worker/setup')} _hover={{ textDecoration: 'none' }}>
          <Button size="sm" w={{ base: 'full', md: 'auto' }}>
            {t.membershipEmpty.becomeWorker}
          </Button>
        </Link>
      </Stack>
    </Card>
  )
}
