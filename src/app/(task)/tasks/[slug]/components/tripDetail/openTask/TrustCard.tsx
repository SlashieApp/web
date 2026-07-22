'use client'

import { useI11n } from '@/i18n/useI11n'
import { InfoBar } from '@ui'
import bag from '../../../i11n.json'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

/**
 * "Payments outside Slashie" trust panel. Copy flips by viewer: the owner pays
 * the worker; the worker gets paid by the customer.
 */
export function TrustCard() {
  const { permissions } = useTaskDetail()
  const t = useI11n(bag)
  const isOwner = permissions.isOwner

  return (
    <InfoBar
      tone="success"
      icon={<span aria-hidden>£</span>}
      hideBadge
      heading={isOwner ? t.trust.ownerHeading : t.trust.workerHeading}
      linkLabel={t.trust.linkLabel}
      linkHref="#how-payments-work"
    >
      {isOwner ? t.trust.ownerBody : t.trust.workerBody}
    </InfoBar>
  )
}
