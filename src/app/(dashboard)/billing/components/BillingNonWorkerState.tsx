'use client'

import { Stack, Text } from '@chakra-ui/react'
import { LuBriefcase } from 'react-icons/lu'

import { DashboardSectionCard } from '@/app/(dashboard)/components/layout/DashboardSectionCard'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import bag from '../i11n.json'

export function BillingNonWorkerState() {
  const t = useI11n(bag)

  return (
    <DashboardSectionCard
      title={t.nonWorker.title}
      description={t.nonWorker.description}
      icon={<LuBriefcase size={18} aria-hidden />}
    >
      <Stack gap={4}>
        <Text fontSize="sm" color="text.muted" lineHeight="tall">
          {t.nonWorker.body}
        </Text>
        <Link href={'/worker/setup'} _hover={{ textDecoration: 'none' }}>
          <Button w={{ base: 'full', md: 'auto' }}>{t.nonWorker.cta}</Button>
        </Link>
      </Stack>
    </DashboardSectionCard>
  )
}
