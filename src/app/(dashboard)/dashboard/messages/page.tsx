'use client'

import { Stack } from '@chakra-ui/react'

import { Button, Link } from '@ui'

import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import { useI11n } from '@/i18n/useI11n'

import bag from './i11n.json'

/** Placeholder until in-app messaging ships. Keeps primary nav destinations live. */
export default function MessagesPage() {
  const t = useI11n(bag)

  return (
    <DashboardPageLayout
      eyebrow={t.eyebrow}
      title={t.title}
      description={t.description}
    >
      <Stack gap={4} maxW="520px">
        <Button asChild size="sm" variant="secondary" alignSelf="flex-start">
          <Link href="/dashboard" _hover={{ textDecoration: 'none' }}>
            {t.backToDashboard}
          </Link>
        </Button>
      </Stack>
    </DashboardPageLayout>
  )
}
