'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { LuFlag, LuLock } from 'react-icons/lu'

import { useAccountSuspended } from '@/app/(auth)/helpers/accountDisabled'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { SettingToggle } from '@/app/(dashboard)/components/ui/SettingToggle'
import { useMySettingToggle } from '@/app/(dashboard)/helpers/useMySettingToggle'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, Link } from '@ui'

import bag from '../../../i11n.json'
import type { ProfileViewConfig } from '../../../views'

/** Where each next step goes: setup, or the phone row on Account. */
const NEXT_STEP_HREF = {
  continueSetup: workerSetupHref('/profile'),
  verifyPhone: '/account#contact',
} as const

/** The one thing to do next (the view decides; none means no card). */
export function NextStepCard({
  step,
}: {
  step: NonNullable<ProfileViewConfig['nextStep']>
}) {
  const t = useI11n(bag).nextStep
  const copy = t[step]

  return (
    <Card layout="section" p={5}>
      <Stack gap={4}>
        <HStack gap={2}>
          <LuFlag
            size={18}
            color="var(--chakra-colors-status-warning-fg)"
            aria-hidden
          />
          <Heading as="h2" fontSize="md">
            {t.title}
          </Heading>
        </HStack>
        <Stack gap={1}>
          <Text fontSize="sm" fontWeight={600}>
            {copy.heading}
          </Text>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {copy.body}
          </Text>
        </Stack>
        <Button asChild w="full" minH="44px" variant="primary">
          <Link href={NEXT_STEP_HREF[step]} _hover={{ textDecoration: 'none' }}>
            {copy.action}
          </Link>
        </Button>
      </Stack>
    </Card>
  )
}

/** Visibility: the private profile switch and what never shows. */
export function PrivacyVisibilityCard({ me }: { me: MeSnapshot }) {
  const t = useI11n(bag).visibility
  const suspended = useAccountSuspended(me)
  const { update, pending, error } = useMySettingToggle(t.error)
  const isPrivate = me.settings.isProfilePrivate

  return (
    <Card id="visibility" layout="section" p={5} scrollMarginTop="96px">
      <Stack gap={4}>
        <Stack gap={1}>
          <HStack gap={2}>
            <LuLock size={18} aria-hidden />
            <Heading as="h2" fontSize="md">
              {t.title}
            </Heading>
          </HStack>
          <Text fontSize="xs" color="text.muted" lineHeight="tall">
            {t.description}
          </Text>
        </Stack>
        <SettingToggle
          label={t.privateProfile}
          description={error ?? (isPrivate ? t.privateHint : t.publicHint)}
          checked={isPrivate}
          disabled={suspended || pending === 'isProfilePrivate'}
          onChange={(next) => void update('isProfilePrivate', next)}
        />
        <Stack gap={0}>
          <Text fontSize="sm" fontWeight={600}>
            {t.contactStaysPrivate}
          </Text>
          <Text fontSize="xs" color="text.muted">
            {t.contactStaysPrivateHint}
          </Text>
        </Stack>
      </Stack>
    </Card>
  )
}
