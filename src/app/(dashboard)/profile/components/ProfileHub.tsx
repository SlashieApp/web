'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/DashboardPageLayout'

import { getProfileLifecycle } from '../helpers/profileLifecycle'
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

const SECTION_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Personal info', href: '#personal-info' },
  { label: 'Contact & verification', href: '#contact-verification' },
  { label: 'Worker profile', href: '#worker-profile' },
  { label: 'Preferences', href: '#preferences' },
] as const

export function ProfileHub({
  me,
  initialEditSection = null,
}: {
  me: MeSnapshot
  initialEditSection?: ProfileEditSection
}) {
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

  return (
    <>
      <DashboardPageLayout
        rootRef={onHubRef}
        eyebrow="PROFILE"
        title="Profile & professional presence"
        description="Manage your private account details and build trust with customers."
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
        sections={SECTION_LINKS}
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
