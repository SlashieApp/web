'use client'
import { Link } from '../Link'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import Image from 'next/image'

import { MembershipStatusBadge } from '@/app/(dashboard)/components/membership/MembershipStatusBadge'
import {
  hasUnlimitedQuoting,
  membershipStatusDetailText,
} from '@/app/(dashboard)/helpers/workerMembershipHelpers'

export type AccountMenuHeaderProps = {
  displayName: string
  email: string
  avatarUrl?: string | null
  membership?: WorkerMembershipFieldsFragment | null
  hasWorker?: boolean
  onViewProfile?: () => void
}

function AccountMenuAvatar({
  displayName,
  email,
  avatarUrl,
}: {
  displayName: string
  email: string
  avatarUrl?: string | null
}) {
  const label = displayName.trim() || email
  const initial = label.trim().charAt(0).toUpperCase() || '?'

  return (
    <Box
      boxSize="40px"
      borderRadius="full"
      bg="status.success.soft"
      color="status.success.fg"
      fontSize="md"
      fontWeight={700}
      display="flex"
      alignItems="center"
      justifyContent="center"
      overflow="hidden"
      flexShrink={0}
      aria-hidden
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={40}
          height={40}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        initial
      )}
    </Box>
  )
}

function AccountMenuDivider() {
  return <Box borderTopWidth="1px" borderColor="border.default" />
}

function QuoteUsageMeter({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment
}) {
  const used = membership.quotesUsedThisMonth
  const total = Math.max(membership.freeQuotesPerMonth, 1)
  const pct = Math.min(100, Math.round((used / total) * 100))

  return (
    <Stack gap={1.5}>
      <HStack justify="space-between" align="baseline">
        <Text fontSize="xs" color="text.muted">
          Quotes this month
        </Text>
        <Text fontSize="xs" fontWeight={700} color="text.default">
          {used} / {total}
        </Text>
      </HStack>
      <Box
        h="1.5"
        borderRadius="full"
        bg="neutral.200"
        overflow="hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`${used} of ${total} quotes used this month`}
      >
        <Box h="full" w={`${pct}%`} bg="action.primary" borderRadius="full" />
      </Box>
    </Stack>
  )
}

function CustomerMembershipSection() {
  return (
    <Stack gap={1}>
      <Text fontSize="sm" fontWeight={700} color="text.default">
        Post tasks for free
      </Text>
      <Text fontSize="xs" color="text.muted" lineHeight="tall">
        Compare quotes from local workers on your posted tasks.
      </Text>
      <Link
        href="/worker/setup"
        fontSize="xs"
        tone="emphasis"
        fontWeight={600}
        color="text.link"
      >
        Become a worker
      </Link>
    </Stack>
  )
}

function WorkerMembershipSection({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment
}) {
  const unlimited = hasUnlimitedQuoting(membership)
  const detail =
    membership.statusDescription?.trim() ||
    membershipStatusDetailText(membership)

  return (
    <Stack gap={2.5}>
      <HStack justify="space-between" align="flex-start" gap={2}>
        <Text fontSize="sm" fontWeight={700} color="text.default" lineClamp={2}>
          {membership.planName}
        </Text>
        <MembershipStatusBadge membership={membership} />
      </HStack>

      {unlimited && detail ? (
        <Text fontSize="xs" color="text.muted" lineHeight="tall">
          {detail}
        </Text>
      ) : null}

      {!unlimited ? <QuoteUsageMeter membership={membership} /> : null}

      {membership.canUpgrade || membership.canManageBilling ? (
        <HStack gap={3} flexWrap="wrap">
          {membership.canUpgrade ? (
            <Link
              href="/billing"
              tone="emphasis"
              fontSize="xs"
              fontWeight={600}
              color="text.link"
            >
              Upgrade
            </Link>
          ) : null}
          {membership.canManageBilling ? (
            <Link
              href="/billing"
              tone="emphasis"
              fontSize="xs"
              fontWeight={600}
              color="text.link"
            >
              Manage billing
            </Link>
          ) : null}
        </HStack>
      ) : null}
    </Stack>
  )
}

export function AccountMenuHeader({
  displayName,
  email,
  avatarUrl,
  membership,
  hasWorker = false,
  onViewProfile,
}: AccountMenuHeaderProps) {
  return (
    <Stack gap={0}>
      <HStack align="flex-start" gap={3} px={3} py={3}>
        <AccountMenuAvatar
          displayName={displayName}
          email={email}
          avatarUrl={avatarUrl}
        />
        <Stack gap={0.5} minW={0} flex={1} align="flex-start">
          <Text
            fontSize="sm"
            fontWeight={700}
            color="text.default"
            truncate
            w="full"
          >
            {displayName}
          </Text>
          <Text fontSize="xs" color="text.muted" truncate w="full">
            {email}
          </Text>
          <Link
            href="/profile"
            tone="emphasis"
            fontSize="xs"
            fontWeight={600}
            color="text.link"
            onClick={onViewProfile}
          >
            View profile
          </Link>
        </Stack>
      </HStack>

      <AccountMenuDivider />

      <Box px={3} py={3}>
        {hasWorker && membership ? (
          <WorkerMembershipSection membership={membership} />
        ) : (
          <CustomerMembershipSection />
        )}
      </Box>

      <AccountMenuDivider />
    </Stack>
  )
}
