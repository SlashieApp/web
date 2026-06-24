'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'

import { MembershipStatusBadge } from '@/app/(dashboard)/components/membership/MembershipStatusBadge'
import {
  hasUnlimitedQuoting,
  membershipStatusDetailText,
} from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { Button, Link } from '@ui'

import { focusVisibleMatchesHover } from '@/theme/system'

export type MembershipStatusCardVariant = 'dropdown' | 'drawer'

export type MembershipStatusCardProps = {
  membership?: WorkerMembershipFieldsFragment | null
  hasWorker?: boolean
  variant?: MembershipStatusCardVariant
}

function QuoteMeterCopy({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment
}) {
  const used = membership.quotesUsedThisMonth
  const total = membership.freeQuotesPerMonth
  return (
    <Text fontSize="sm" color="text.default" fontWeight={600}>
      {used} of {total} quotes used this month
    </Text>
  )
}

function CustomerStatusCard({
  variant,
}: { variant: MembershipStatusCardVariant }) {
  const compact = variant === 'drawer'
  return (
    <Box
      bg="status.success.soft"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={compact ? 3 : 4}
    >
      <Stack gap={compact ? 2 : 3}>
        <Text fontSize="sm" fontWeight={700} color="text.default">
          Post tasks for free
        </Text>
        <Text fontSize="xs" color="text.muted" lineHeight="tall">
          Compare quotes from local workers. Job payments stay between you and
          your pro.
        </Text>
        <Link href="/worker/setup" _hover={{ textDecoration: 'none' }}>
          <Button size="sm" w={compact ? 'full' : 'auto'}>
            Become a worker
          </Button>
        </Link>
      </Stack>
    </Box>
  )
}

export function MembershipStatusCard({
  membership,
  hasWorker = false,
  variant = 'dropdown',
}: MembershipStatusCardProps) {
  if (!hasWorker || !membership) {
    return <CustomerStatusCard variant={variant} />
  }

  const unlimited = hasUnlimitedQuoting(membership)
  const detail =
    membership.statusDescription?.trim() ||
    membershipStatusDetailText(membership)
  const compact = variant === 'drawer'

  return (
    <Box
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      p={compact ? 3 : 4}
    >
      <Stack gap={compact ? 2 : 3}>
        <HStack justify="space-between" align="flex-start" gap={2}>
          <Text
            fontSize="sm"
            fontWeight={800}
            color="text.default"
            lineClamp={2}
          >
            {membership.planName}
          </Text>
          <MembershipStatusBadge membership={membership} />
        </HStack>

        {unlimited && detail ? (
          <Text fontSize="xs" color="text.muted" lineHeight="tall">
            {detail}
          </Text>
        ) : null}

        {!unlimited ? <QuoteMeterCopy membership={membership} /> : null}

        {membership.canUpgrade ? (
          <Link href="/billing" _hover={{ textDecoration: 'none' }}>
            <Button size="sm" w={compact ? 'full' : 'auto'}>
              Upgrade
            </Button>
          </Link>
        ) : null}

        {membership.canManageBilling ? (
          <Link href="/billing" _hover={{ textDecoration: 'none' }}>
            <Text
              fontSize="xs"
              fontWeight={700}
              color="text.link"
              _hover={{ textDecoration: 'underline' }}
              {...focusVisibleMatchesHover({
                color: 'text.link',
                textDecoration: 'underline',
              })}
            >
              Manage billing
            </Text>
          </Link>
        ) : null}
      </Stack>
    </Box>
  )
}
