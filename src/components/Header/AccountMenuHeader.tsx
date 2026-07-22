'use client'

import { useI11n } from '@/i18n/useI11n'
import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import bag from './i11n.json'

import { MeAvatar } from '@/app/(auth)/components/MeAvatar'
import { MembershipStatusBadge } from '@/app/(dashboard)/components/membership/MembershipStatusBadge'
import {
  hasUnlimitedQuoting,
  membershipStatusDetailText,
} from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { Link } from '@ui'

export type AccountMenuHeaderProps = {
  displayName: string
  email: string
  /** @deprecated MeAvatar resolves avatars; kept for call-site compat. */
  avatarUrl?: string | null
  membership?: WorkerMembershipFieldsFragment | null
  hasWorker?: boolean
  onViewProfile?: () => void
}

function AccountMenuAvatar({
  displayName,
  email,
}: {
  displayName: string
  email: string
  avatarUrl?: string | null
}) {
  const label = displayName.trim() || email
  return <MeAvatar size="md" name={label} />
}

function AccountMenuDivider() {
  return <Box borderTopWidth="1px" borderColor="border.default" />
}

function QuoteUsageMeter({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment
}) {
  const t = useI11n(bag)
  const used = membership.quotesUsedThisMonth
  const total = Math.max(membership.freeQuotesPerMonth, 1)
  const pct = Math.min(100, Math.round((used / total) * 100))

  return (
    <Stack gap={1.5}>
      <HStack justify="space-between" align="baseline">
        <Text fontSize="xs" color="text.muted">
          {t.quotesThisMonth}
        </Text>
        <Text fontSize="xs" fontWeight={700} color="text.default">
          {used} / {total}
        </Text>
      </HStack>
      <Box
        h="1.5"
        borderRadius="full"
        bg="bg.subtle"
        overflow="hidden"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={formatMessage(t.quotesUsedAria, { used, total })}
      >
        <Box h="full" w={`${pct}%`} bg="action.primary" borderRadius="full" />
      </Box>
    </Stack>
  )
}

function CustomerMembershipSection() {
  const href = useLocalizedHref()
  const t = useI11n(bag)

  return (
    <Stack gap={1}>
      <Text fontSize="sm" fontWeight={700} color="text.default">
        {t.postTasksForFree}
      </Text>
      <Text fontSize="xs" color="text.muted" lineHeight="tall">
        {t.postTasksForFreeDescription}
      </Text>
      <Link
        href={href('/worker/setup')}
        fontSize="xs"
        tone="emphasis"
        fontWeight={600}
        color="text.link"
      >
        {t.becomeWorker}
      </Link>
    </Stack>
  )
}

function WorkerMembershipSection({
  membership,
}: {
  membership: WorkerMembershipFieldsFragment
}) {
  const href = useLocalizedHref()
  const t = useI11n(bag)
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
              href={href('/billing')}
              tone="emphasis"
              fontSize="xs"
              fontWeight={600}
              color="text.link"
            >
              {t.upgrade}
            </Link>
          ) : null}
          {membership.canManageBilling ? (
            <Link
              href={href('/billing')}
              tone="emphasis"
              fontSize="xs"
              fontWeight={600}
              color="text.link"
            >
              {t.manageBilling}
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
  const href = useLocalizedHref()
  const t = useI11n(bag)

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
            href={href('/profile')}
            tone="emphasis"
            fontSize="xs"
            fontWeight={600}
            color="text.link"
            onClick={onViewProfile}
          >
            {t.viewProfile}
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
