'use client'

import { Box, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

import { useMe } from '@/app/(auth)/store/user'
import { useBillingActions } from '@/app/(dashboard)/billing/helpers/useBillingActions'
import { getAuthToken } from '@/utils/auth'
import { Button } from '@ui'

import { resolveUnlimitedPlanCta } from '../helpers/pricingCta'

export function PricingUnlimitedCta() {
  const me = useMe()
  const isAuthenticated = Boolean(getAuthToken())
  const hasWorkerProfile = Boolean(me?.worker?.id)
  const unlimitedCta = resolveUnlimitedPlanCta({
    isAuthenticated,
    hasWorkerProfile,
  })
  const { startCheckout, checkoutLoading } = useBillingActions()

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
      as={NextLink}
      href={unlimitedCta.href}
      mt="auto"
      _hover={{ textDecoration: 'none' }}
    >
      <Button w="full">{unlimitedCta.label}</Button>
    </Link>
  )
}
