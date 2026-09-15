'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { usePathname } from 'next/navigation'

import { useUserStore } from '@/app/(auth)/store/user'
import { isWorkerSetupComplete } from '@/app/(stepflow)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Link } from '@ui'

import bag from '../i11n.json'

function completionFromMe(me: {
  profile?: { name?: string | null; contactNumber?: string | null } | null
  worker?: {
    id?: string | null
    tagline?: string | null
    locationAddress?: string | null
  } | null
}) {
  const checks = [
    Boolean(me.profile?.name?.trim()),
    Boolean(me.profile?.contactNumber?.trim()),
    Boolean(me.worker?.id),
    Boolean(me.worker?.tagline?.trim()),
    Boolean(me.worker?.locationAddress?.trim()),
  ]
  const done = checks.filter(Boolean).length
  const total = checks.length
  return {
    percent: Math.round((done / total) * 100),
    done,
    total,
  }
}

/** Overview card that used to live in the dashboard sidebar. */
export function DashboardCompleteProfileCard() {
  const t = useI11n(bag).completeProfile
  const pathname = usePathname()
  const me = useUserStore((state) => state.me)
  if (!me) return null

  const completion = completionFromMe(me)
  const setupComplete = isWorkerSetupComplete(me)
  const profileLinkLabel = setupComplete ? t.manageProfile : t.continueSetup
  const profileLinkHref = setupComplete
    ? '/profile'
    : workerSetupHref(pathname ?? '/profile')

  return (
    <Stack p={4} gap={3} bg="status.success.soft" borderRadius="lg">
      <Stack gap={0.5}>
        <Text fontSize="sm" fontWeight={700}>
          {t.title}
        </Text>
        <Text fontSize="xs" color="status.success.fg">
          {t.description}
        </Text>
      </Stack>

      <Stack gap={2}>
        <HStack justify="space-between">
          <Text fontSize="xs" color="status.success.fg">
            {formatMessage(t.completeCount, {
              done: completion.done,
              total: completion.total,
            })}
          </Text>
          <Text fontSize="xs" color="status.success.fg" fontWeight={700}>
            {completion.percent}%
          </Text>
        </HStack>
        <Box h="6px" borderRadius="full" bg="bg.surface" overflow="hidden">
          <Box h="full" bg="action.primary" w={`${completion.percent}%`} />
        </Box>
      </Stack>

      <Link href={profileLinkHref} _hover={{ textDecoration: 'none' }}>
        <Button size="sm" w="full">
          {profileLinkLabel}
        </Button>
      </Link>
    </Stack>
  )
}
