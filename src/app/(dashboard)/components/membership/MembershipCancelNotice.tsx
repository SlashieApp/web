'use client'

import { Box, Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'

import {
  formatMembershipEndDate,
  isMembershipCancelScheduled,
} from '../../helpers/workerMembershipHelpers'

type MembershipCancelNoticeProps = {
  membership: WorkerMembershipFieldsFragment
}

export function MembershipCancelNotice({
  membership,
}: MembershipCancelNoticeProps) {
  if (!isMembershipCancelScheduled(membership)) return null

  const endDate = formatMembershipEndDate(membership)
  if (!endDate) return null

  return (
    <Box
      borderWidth="1px"
      borderColor="status.warning.solid"
      borderRadius="xl"
      bg="status.warning.soft"
      p={4}
    >
      <Text fontSize="sm" fontWeight={700} color="status.warning.fg">
        Subscription cancelling
      </Text>
      <Text fontSize="sm" color="status.warning.fg" mt={1} lineHeight="tall">
        Your Slashie Unlimited subscription will end on {endDate}. You&apos;ll
        keep unlimited quotes until then, then return to the free plan (
        {membership.freeQuotesPerMonth} quotes per UTC month).
      </Text>
    </Box>
  )
}
