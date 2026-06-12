'use client'

import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import NextLink from 'next/link'

import { Button, SectionCard } from '@ui'

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
  const unlimited = hasUnlimitedQuoting(membership)
  const showMeter = !unlimited

  return (
    <SectionCard p={{ base: 5, md: 6 }}>
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
              color="formLabelMuted"
              textTransform="uppercase"
              letterSpacing="0.06em"
            >
              Platform membership
            </Text>
            <Text fontSize="lg" fontWeight={800} color="cardFg">
              {membership.planName}
            </Text>
          </Stack>
          <MembershipStatusBadge membership={membership} />
        </HStack>

        <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
          Slashie Unlimited covers platform quoting access. Job payments stay
          between customer and worker — not through Slashie.
        </Text>

        <MembershipStatusDetail membership={membership} />

        {showMeter ? (
          <BillingQuoteMeter
            used={membership.quotesUsedThisMonth}
            total={membership.freeQuotesPerMonth}
          />
        ) : null}

        <Link as={NextLink} href="/billing" _hover={{ textDecoration: 'none' }}>
          <Button size="sm" w={{ base: 'full', md: 'auto' }}>
            {membership.canManageBilling || membership.canUpgrade
              ? 'Manage billing'
              : 'View billing'}
          </Button>
        </Link>
      </Stack>
    </SectionCard>
  )
}
