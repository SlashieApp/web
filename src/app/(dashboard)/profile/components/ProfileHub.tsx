'use client'

import { Box, Stack } from '@chakra-ui/react'
import { useCallback, useRef, useState } from 'react'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { DashboardPageLayout } from '@/app/(dashboard)/components/layout/DashboardPageLayout'
import { useI11n } from '@/i18n/useI11n'

import { getProfileLifecycle } from '../helpers/profileLifecycle'
import bag from '../i11n.json'
import {
  ContactCard,
  PersonalInfoCard,
  PublicPreviewCard,
  WorkerProfileCard,
} from './ui/cards/ProfileMainCards'
import {
  NextStepCard,
  PrivacyVisibilityCard,
  ProfileStrengthCard,
} from './ui/cards/ProfileSidebarCards'
import {
  ProfileEditDrawer,
  type ProfileEditSection,
} from './ui/edit/ProfileEditDrawer'
import { ProfileIdentityHero } from './ui/hero/ProfileIdentityHero'

export function ProfileHub({
  me,
  initialEditSection = null,
}: {
  me: MeSnapshot
  initialEditSection?: ProfileEditSection
}) {
  const t = useI11n(bag)
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
        title={t.title}
        width="wide"
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
