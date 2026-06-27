'use client'

import { InfoBar } from '@ui'

import { useTaskDetail } from '../../../context/TaskDetailProvider'

/**
 * "Payments outside Slashie" trust panel. Copy flips by viewer: the owner pays
 * the worker; the worker gets paid by the customer.
 */
export function TrustCard() {
  const { permissions } = useTaskDetail()
  const isOwner = permissions.isOwner

  return (
    <InfoBar
      tone="info"
      icon={<span aria-hidden>£</span>}
      badgeLabel="Payments"
      heading={
        isOwner
          ? 'You pay the worker directly'
          : "You pay the customer's agreed price directly"
      }
      linkLabel="How payments work"
      linkHref="#how-payments-work"
    >
      {isOwner
        ? 'Slashie never handles job payment. Agree a price and pay your worker directly. Quotes and bookings happen here, money does not.'
        : 'Slashie never handles job payment. Agree a price and get paid by the customer directly. Quotes and bookings happen here, money does not.'}
    </InfoBar>
  )
}
