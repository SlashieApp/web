'use client'

import { Text } from '@chakra-ui/react'
import type { WorkerMembershipFieldsFragment } from '@codegen/schema'
import { WorkerSubscriptionStatus } from '@codegen/schema'

import {
  hasUnlimitedQuoting,
  isMembershipCancelScheduled,
  isMembershipCanceled,
  isMembershipPaymentWarning,
  membershipCanceledBodyCopy,
  membershipStatusDetailText,
} from '../../helpers/workerMembershipHelpers'

type MembershipStatusDetailProps = {
  membership: WorkerMembershipFieldsFragment
}

export function MembershipStatusDetail({
  membership,
}: MembershipStatusDetailProps) {
  const detail = membershipStatusDetailText(membership)
  const unlimited = hasUnlimitedQuoting(membership)

  if (isMembershipCanceled(membership) && !unlimited) {
    return (
      <Text fontSize="sm" color="text.default" lineHeight="tall">
        {membershipCanceledBodyCopy(membership)}
      </Text>
    )
  }

  if (isMembershipCancelScheduled(membership) && detail) {
    return (
      <Text
        fontSize="sm"
        color="status.warning.fg"
        fontWeight={600}
        lineHeight="tall"
      >
        {detail}
      </Text>
    )
  }

  if (isMembershipPaymentWarning(membership.subscriptionStatus)) {
    return (
      <Text
        fontSize="sm"
        color="status.warning.fg"
        fontWeight={600}
        lineHeight="tall"
      >
        {membership.subscriptionStatus === WorkerSubscriptionStatus.PastDue
          ? 'Payment issue — update your payment method to keep unlimited quotes.'
          : 'Payment required — update billing to restore unlimited quotes.'}
      </Text>
    )
  }

  if (unlimited) {
    if (isMembershipCancelScheduled(membership)) {
      return (
        <Text fontSize="sm" color="text.default" fontWeight={600}>
          Unlimited quotes until your subscription ends.
        </Text>
      )
    }
    if (detail) {
      return (
        <Text fontSize="sm" color="text.default" fontWeight={600}>
          Unlimited quotes — {detail.charAt(0).toLowerCase()}
          {detail.slice(1)}.
        </Text>
      )
    }
    return (
      <Text fontSize="sm" color="text.default" fontWeight={600}>
        Unlimited quotes while your subscription is active.
      </Text>
    )
  }

  if (detail) {
    return (
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {detail}
      </Text>
    )
  }

  return null
}
