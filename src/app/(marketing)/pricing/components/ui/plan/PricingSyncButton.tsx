'use client'

import { useApolloClient } from '@apollo/client/react'
import { useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { syncMembershipFromStripe } from '@/app/(dashboard)/billing/helpers/syncMembership'
import { Button } from '@ui'

/**
 * Billing's Check again (FE-290): asks the API to re-read the plan from Stripe
 * and refreshes the profile, so the page moves on by itself once Checkout has
 * landed.
 */
export function PricingSyncButton({ label }: { label: string }) {
  const client = useApolloClient()
  const setMe = useUserStore((s) => s.setMe)
  const [loading, setLoading] = useState(false)

  return (
    <Button
      w="full"
      variant="primary"
      data-page-green-action=""
      loading={loading}
      disabled={loading}
      onClick={() => {
        setLoading(true)
        void syncMembershipFromStripe(client, setMe).finally(() =>
          setLoading(false),
        )
      }}
    >
      {label}
    </Button>
  )
}
