'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import { useAccountSuspended } from '@/app/(auth)/helpers/accountDisabled'
import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import { useUserStore } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import { isWorkerSetupComplete } from '@/app/(stepflow)/worker/setup/helpers/workerSetupEligibility'
import { useI11n } from '@/i18n/useI11n'
import { Link } from '@ui'

import bag from '../i11n.json'
import { PROFILE_VIEWS, getProfileView } from '../views'
import {
  NextStepCard,
  PrivacyVisibilityCard,
} from './ui/cards/ProfileSidebarCards'
import { WorkerProfileCard } from './ui/cards/WorkerProfileCard'
import {
  ProfileEditDrawer,
  type ProfileEditSection,
} from './ui/edit/ProfileEditDrawer'
import { ProfileIdentityHero } from './ui/hero/ProfileIdentityHero'

/** `?section=` values other pages link with, and the card each one means. */
const SECTION_IDS: Record<string, string> = {
  worker: 'worker-profile',
  preferences: 'visibility',
  visibility: 'visibility',
}

/**
 * Profile (views/README.md): how others see you. Hero, then the worker
 * card, with the next step and Visibility in the rail (next step first on
 * phones). Suspended makes every view read-only; the gate owns loading.
 */
export function ProfileScreen({
  initialEditSection = null,
}: {
  initialEditSection?: ProfileEditSection
}) {
  const t = useI11n(bag)
  const me = useUserStore((s) => s.me)
  const suspended = useAccountSuspended(me)
  const [editSection, setEditSection] =
    useState<ProfileEditSection>(initialEditSection)
  const deepLinkHandledRef = useRef(false)

  const onRootRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || deepLinkHandledRef.current) return
    deepLinkHandledRef.current = true
    const section = new URLSearchParams(window.location.search).get('section')
    const targetId =
      window.location.hash.slice(1) || (section ? SECTION_IDS[section] : null)
    if (!targetId) return
    requestAnimationFrame(() => {
      document
        .getElementById(targetId)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  if (!me) return null

  const config =
    PROFILE_VIEWS[
      getProfileView({
        hasWorker: Boolean(me.worker?.id),
        setupComplete: isWorkerSetupComplete(me),
        phoneVerified: isPhoneVerified(me),
        isPrivate: me.settings.isProfilePrivate,
      })
    ]
  const nextStep =
    config.nextStep && !suspended ? (
      <NextStepCard step={config.nextStep} />
    ) : null

  return (
    <>
      <DashboardPageLayout
        rootRef={onRootRef}
        width="wide"
        title={t.title}
        description={
          <>
            {t.descriptionBefore}
            <Link href="/account" color="text.link">
              {t.accountLink}
            </Link>
            {t.descriptionAfter}
          </>
        }
        afterHeader={
          <Stack gap={4}>
            {nextStep ? (
              <Box display={{ base: 'block', lg: 'none' }}>{nextStep}</Box>
            ) : null}
            <ProfileIdentityHero
              me={me}
              config={config}
              readOnly={suspended}
              onEditPhoto={() => setEditSection('photo')}
              onEditDetails={() => setEditSection('personal')}
            />
          </Stack>
        }
        sidebar={
          <>
            {nextStep ? (
              <Box display={{ base: 'none', lg: 'block' }}>{nextStep}</Box>
            ) : null}
            <PrivacyVisibilityCard me={me} />
          </>
        }
      >
        <WorkerProfileCard
          me={me}
          variant={config.workerCard}
          readOnly={suspended}
          onEdit={() => setEditSection('worker')}
          onEditPhoto={() => setEditSection('photo')}
        />
      </DashboardPageLayout>

      <ProfileEditDrawer section={editSection} onOpenChange={setEditSection} />
    </>
  )
}
