'use client'

import { Box } from '@chakra-ui/react'

import { useMe } from '@/app/(auth)/store/user'
import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { hasUnlimitedQuoting } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import type { Messages } from '@/i18n/getDictionary'
import { getAuthToken } from '@/utils/auth'
import { Button, Link } from '@ui'

import { resolveUnlimitedPlanCta } from '../helpers/pricingCta'

export function PricingUnlimitedCta({
  messages,
}: {
  messages: Messages['pricing']['plans']
}) {
  const me = useMe()
  const isAuthenticated = Boolean(getAuthToken())
  const hasWorkerProfile = Boolean(me?.worker?.id)
  const hasUnlimitedPlan = hasUnlimitedQuoting(me?.worker?.membership)
  const unlimitedCta = resolveUnlimitedPlanCta({
    labels: {
      currentPlan: messages.currentPlan,
      setUpWorkerProfile: messages.setUpWorkerProfile,
      upgrade: messages.upgrade,
    },
    isAuthenticated,
    hasWorkerProfile,
    hasUnlimitedPlan,
  })
  const { startCheckout, checkoutLoading } = useBillingActions()

  if (hasUnlimitedPlan) {
    return (
      <Box mt="auto">
        <Button w="full" disabled opacity={0.72}>
          {unlimitedCta.label}
        </Button>
      </Box>
    )
  }

  if (isAuthenticated && hasWorkerProfile) {
    return (
      <Box mt="auto">
        <Button
          w="full"
          onClick={() => void startCheckout('pricing')}
          loading={checkoutLoading}
          disabled={checkoutLoading}
        >
          {unlimitedCta.label}
        </Button>
      </Box>
    )
  }

  return (
    <Link
      href={unlimitedCta.href}
      mt="auto"
      _hover={{ textDecoration: 'none' }}
    >
      <Button w="full">{unlimitedCta.label}</Button>
    </Link>
  )
}
