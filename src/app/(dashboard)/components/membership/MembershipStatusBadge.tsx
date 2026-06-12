'use client'

import type { WorkerMembershipFieldsFragment } from '@codegen/schema'

import { Badge } from '@ui'

import {
  membershipBadgeColors,
  membershipBadgeVariant,
} from '../../helpers/workerMembershipHelpers'

type MembershipStatusBadgeProps = {
  membership: WorkerMembershipFieldsFragment
}

export function MembershipStatusBadge({
  membership,
}: MembershipStatusBadgeProps) {
  const colors = membershipBadgeColors(membership)
  const variant = membershipBadgeVariant(membership)

  return (
    <Badge
      bg={colors.bg}
      color={colors.color}
      fontWeight={700}
      aria-label={`Membership status: ${membership.statusLabel}`}
      data-variant={variant}
    >
      {membership.statusLabel}
    </Badge>
  )
}
