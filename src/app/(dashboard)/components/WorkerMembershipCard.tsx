'use client'

import { useI11n } from '@/i18n/useI11n'
import { HStack, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import bag from '../i11n.json'

import { Button, Card, Link } from '@ui'

import { BillingQuoteMeter } from '../billing/components/BillingQuoteMeter'
import { hasUnlimitedQuoting } from '../helpers/workerMembershipHelpers'
import { MembershipCancelNotice } from './membership/MembershipCancelNotice'
import { MembershipStatusBadge } from './membership/MembershipStatusBadge'
import { MembershipStatusDetail } from './membership/MembershipStatusDetail'

type WorkerMembershipCardProps = {
  membership: WorkerMembershipFieldsFragment
}

export function WorkerMembershipCard({
  membership,
}: WorkerMembershipCardProps) {
  const t = useI11n(bag)
  const unlimited = hasUnlimitedQuoting(membership)
  const showMeter = !unlimited

  return (
    <Card layout="section" p={{ base: 4, md: 5 }}>
      <Stack gap={4}>
        <MembershipCancelNotice membership={membership} />

        <HStack
          justify="space-between"
          align="flex-start"
          gap={3}
          flexWrap="wrap"
        >
          <Stack gap={1}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="status.success.fg"
              textTransform="uppercase"
              letterSpacing="0.08em"
            >
              {t.membership.title}
            </Text>
            <Text fontSize="lg" fontWeight={700} color="text.default">
              {membership.planName}
            </Text>
          </Stack>
          <MembershipStatusBadge membership={membership} />
        </HStack>

        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {t.membership.body}
        </Text>

        <MembershipStatusDetail membership={membership} />

        {showMeter ? (
          <BillingQuoteMeter
            used={membership.quotesUsedThisMonth}
            total={membership.freeQuotesPerMonth}
          />
        ) : null}

        <Link href={'/billing'} _hover={{ textDecoration: 'none' }}>
          <Button size="sm" w={{ base: 'full', md: 'auto' }}>
            {membership.canManageBilling || membership.canUpgrade
              ? t.membership.manageBilling
              : t.membership.viewBilling}
          </Button>
        </Link>
      </Stack>
    </Card>
  )
}
