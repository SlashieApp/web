'use client'

import { Box } from '@chakra-ui/react'

import { useMe } from '@/app/(auth)/store/user'
import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { hasUnlimitedQuoting } from '@/app/(dashboard)/helpers/workerMembershipHelpers'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { getAuthToken } from '@/utils/auth'
import { Button, Link } from '@ui'

import { resolveUnlimitedPlanCta } from '../helpers/pricingCta'

export function PricingUnlimitedCta({
  copy,
}: {
  copy: {
    currentPlan: string
    setUpWorkerProfile: string
    upgrade: string
  }
}) {
  const me = useMe()
  const href = useLocalizedHref()
  const isAuthenticated = Boolean(getAuthToken())
  const hasWorkerProfile = Boolean(me?.worker?.id)
  const hasUnlimitedPlan = hasUnlimitedQuoting(me?.worker?.membership)
  const unlimitedCta = resolveUnlimitedPlanCta({
    isAuthenticated,
    hasWorkerProfile,
    hasUnlimitedPlan,
  })
  const label = hasUnlimitedPlan
    ? copy.currentPlan
    : hasWorkerProfile || !isAuthenticated
      ? copy.upgrade
      : copy.setUpWorkerProfile
  const { startCheckout, checkoutLoading } = useBillingActions()

  if (hasUnlimitedPlan) {
    return (
      <Box mt="auto">
        <Button w="full" disabled opacity={0.72}>
          {label}
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
          {label}
        </Button>
      </Box>
    )
  }

  return (
    <Link
      href={href(unlimitedCta.href)}
      mt="auto"
      _hover={{ textDecoration: 'none' }}
    >
      <Button w="full">{label}</Button>
    </Link>
  )
}
