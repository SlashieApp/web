'use client'

import { Stack, Text } from '@chakra-ui/react'
import { LuBriefcase } from 'react-icons/lu'

import { DashboardSectionCard } from '@/app/(dashboard)/components/DashboardSectionCard'
import { Button, Link } from '@ui'

export function BillingNonWorkerState() {
  return (
    <DashboardSectionCard
      title="Become a worker to manage billing"
      description="Slashie Unlimited is for workers who send quotes on tasks."
      icon={<LuBriefcase size={18} aria-hidden />}
    >
      <Stack gap={4}>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          Set up your worker profile first, then return here to start a free
          trial or manage your subscription.
        </Text>
        <Link href="/worker/setup" _hover={{ textDecoration: 'none' }}>
          <Button w={{ base: 'full', md: 'auto' }}>
            Set up worker profile
          </Button>
        </Link>
      </Stack>
    </DashboardSectionCard>
  )
}
