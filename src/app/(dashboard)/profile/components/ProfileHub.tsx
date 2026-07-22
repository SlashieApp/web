'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'
import { usePageI11n } from '@/i18n/usePageI11n'

import { getProfileLifecycle } from '../helpers/profileLifecycle'
import bag from '../i11n.json'
import { ProfileEditDrawer, type ProfileEditSection } from './ProfileEditDrawer'
import { ProfileIdentityHero } from './ProfileIdentityHero'
import {
  ContactCard,
  PersonalInfoCard,
  PublicPreviewCard,
  WorkerProfileCard,
} from './ProfileMainCards'
import {
  NextStepCard,
  PrivacyVisibilityCard,
  ProfileStrengthCard,
} from './ProfileSidebarCards'

export function ProfileHub({
  me,
  initialEditSection = null,
}: {
  me: MeSnapshot
  initialEditSection?: ProfileEditSection
}) {
  const t = usePageI11n(bag)
  const lifecycle = getProfileLifecycle(me)
  const [editSection, setEditSection] =
    useState<ProfileEditSection>(initialEditSection)
  const deepLinkHandledRef = useRef(false)
  const onHubRef = useCallback((node: HTMLDivElement | null) => {
    if (!node || deepLinkHandledRef.current || typeof window === 'undefined') {
      return
    }
    deepLinkHandledRef.current = true
    const querySection = new URLSearchParams(window.location.search).get(
      'section',
    )
    const sectionId =
      querySection === 'worker'
        ? 'worker-profile'
        : querySection === 'personal'
          ? 'personal-info'
          : querySection === 'contact'
            ? 'contact-verification'
            : querySection === 'preferences'
              ? 'preferences'
              : null
    const targetId = window.location.hash.slice(1) || sectionId
    if (!targetId) return
    requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }, [])
  const sectionLinks = [
    { label: t.navOverview, href: '#overview' },
    { label: t.navPersonalInfo, href: '#personal-info' },
    { label: t.navContactVerification, href: '#contact-verification' },
    { label: t.navWorkerProfile, href: '#worker-profile' },
    { label: t.navPreferences, href: '#preferences' },
  ] as const

  return (
    <>
      <DashboardPageLayout
        rootRef={onHubRef}
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        afterHeader={
          <Stack gap={4}>
            <Box display={{ base: 'block', lg: 'none' }}>
              <NextStepCard
                lifecycle={lifecycle}
                onAction={
                  lifecycle.kind === 'actionRequired'
                    ? () => setEditSection('contact')
                    : undefined
                }
              />
            </Box>
            <ProfileIdentityHero
              me={me}
              lifecycle={lifecycle}
              onEditPhoto={() => setEditSection('photo')}
            />
          </Stack>
        }
        sections={sectionLinks}
        sidebar={
          <>
            <Box display={{ base: 'none', lg: 'block' }}>
              <NextStepCard
                lifecycle={lifecycle}
                onAction={
                  lifecycle.kind === 'actionRequired'
                    ? () => setEditSection('contact')
                    : undefined
                }
              />
            </Box>
            <ProfileStrengthCard me={me} />
            <Box id="preferences" scrollMarginTop="96px">
              <PrivacyVisibilityCard me={me} />
            </Box>
          </>
        }
      >
        <PersonalInfoCard me={me} onEdit={() => setEditSection('personal')} />
        <ContactCard me={me} onEdit={() => setEditSection('contact')} />
        <WorkerProfileCard
          me={me}
          lifecycle={lifecycle}
          onEdit={() => setEditSection('worker')}
        />
        <PublicPreviewCard me={me} lifecycle={lifecycle} />
      </DashboardPageLayout>

      <ProfileEditDrawer section={editSection} onOpenChange={setEditSection} />
    </>
  )
}
