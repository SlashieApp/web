'use client'

import { HStack, SimpleGrid, Stack, Text, Wrap } from '@chakra-ui/react'
import {
  LuBriefcaseBusiness,
  LuCheck,
  LuLock,
  LuMail,
  LuMapPin,
  LuUser,
} from 'react-icons/lu'

import { MeAvatar } from '@/app/(auth)/components/MeAvatar'
import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import {
  isPhoneVerified,
  profileContactNumber,
} from '@/app/(auth)/helpers/phoneVerification'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import {
  categoryBySlug,
  categorySlugFromEnum,
} from '@/app/(worker)/worker/setup/helpers/workerSetupCategories'
import { workerSetupHref } from '@/app/(worker)/worker/setup/helpers/workerSetupHref'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formatPhoneForDisplay } from '@/utils/phoneNormalize'
import { Badge, Button, Link } from '@ui'

import {
  DashboardDetailRow as ProfileDetailRow,
  DashboardSectionCard as ProfileSectionCard,
} from '../../../components/layout/DashboardSectionCard'
import type { ProfileLifecycle } from '../../helpers/profileLifecycle'
import { profileIsPublished } from '../../helpers/profileLifecycle'
import bag from '../../i11n.json'
import { displayNameFromMe } from '../../profileDisplayHelpers'

function VerificationBadge({ verified }: { verified: boolean }) {
  const t = useI11n(bag)
  return (
    <Badge
      variant={verified ? 'success' : 'neutral'}
      dot={verified}
      shape="pill"
    >
      {verified ? t.verified : t.notVerified}
    </Badge>
  )
}

function privateDateLabel(value: unknown, notAdded: string): string {
  if (!value) return notAdded
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return notAdded
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function PersonalInfoCard({
  me,
  onEdit,
}: {
  me: MeSnapshot
  onEdit: () => void
}) {
  const t = useI11n(bag)
  return (
    <ProfileSectionCard
      id="personal-info"
      title={t.personalTitle}
      description={t.personalDescription}
      icon={<LuUser size={18} aria-hidden />}
      onEdit={onEdit}
      editLabel={t.edit}
    >
      <Stack gap={3}>
        <ProfileDetailRow label={t.fullName} value={displayNameFromMe(me)} />
        <ProfileDetailRow
          label={t.dateOfBirth}
          value={privateDateLabel(me.profile?.dateOfBirth, t.notAdded)}
          trailing={<LuLock size={13} aria-label={t.private} />}
        />
      </Stack>
    </ProfileSectionCard>
  )
}

export function ContactCard({
  me,
  onEdit,
}: {
  me: MeSnapshot
  onEdit: () => void
}) {
  const t = useI11n(bag)
  const phone = profileContactNumber(me)

  return (
    <ProfileSectionCard
      id="contact-verification"
      title={t.contactTitle}
      description={t.contactDescription}
      icon={<LuMail size={18} aria-hidden />}
      onEdit={onEdit}
      editLabel={t.manage}
    >
      <Stack gap={4}>
        <ProfileDetailRow
          label={t.email}
          value={me.email}
          trailing={<VerificationBadge verified={isEmailVerified(me)} />}
        />
        <ProfileDetailRow
          label={t.phone}
          value={phone ? formatPhoneForDisplay(phone) : t.notAdded}
          trailing={<VerificationBadge verified={isPhoneVerified(me)} />}
        />
      </Stack>
    </ProfileSectionCard>
  )
}

function workerLocationLabel(me: MeSnapshot, notAdded: string): string {
  return (
    me.worker?.location?.name?.trim() ||
    me.worker?.locationAddress?.trim() ||
    notAdded
  )
}

function publicServiceAreaLabel(me: MeSnapshot, notAdded: string): string {
  return me.worker?.location?.name?.trim() || notAdded
}

function workerCategoryLabel(me: MeSnapshot, notAdded: string): string {
  const slug = categorySlugFromEnum(me.worker?.primaryCategory)
  return categoryBySlug(slug)?.label ?? notAdded
}

export function WorkerProfileCard({
  me,
  lifecycle,
  onEdit,
}: {
  me: MeSnapshot
  lifecycle: ProfileLifecycle
  onEdit: () => void
}) {
  const t = useI11n(bag)

  if (!me.worker?.id) {
    return (
      <ProfileSectionCard
        id="worker-profile"
        title={t.workerTitle}
        description={t.workerDescriptionEmpty}
        icon={<LuBriefcaseBusiness size={18} aria-hidden />}
      >
        <Stack gap={4} align="flex-start">
          <Text fontSize="sm" color="text.muted">
            {t.workerEmptyBody}
          </Text>
          <Link
            href={workerSetupHref('/profile?section=worker')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm">{t.becomeWorker}</Button>
          </Link>
        </Stack>
      </ProfileSectionCard>
    )
  }

  const worker = me.worker
  const draft = lifecycle.kind === 'setupInProgress'

  return (
    <ProfileSectionCard
      id="worker-profile"
      title={t.workerTitle}
      description={t.workerDescription}
      icon={<LuBriefcaseBusiness size={18} aria-hidden />}
      onEdit={draft ? undefined : onEdit}
      editLabel={t.edit}
    >
      <Stack gap={4}>
        <HStack justify="space-between" gap={3} flexWrap="wrap">
          <Badge variant={draft ? 'warning' : 'success'} dot shape="pill">
            {draft ? t.notPublished : t.published}
          </Badge>
          {draft ? (
            <Link
              href={workerSetupHref('/profile?section=worker')}
              _hover={{ textDecoration: 'none' }}
            >
              <Button size="sm">{t.continueSetup}</Button>
            </Link>
          ) : null}
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ProfileDetailRow
            label={t.headline}
            value={worker.tagline?.trim() || t.notAdded}
          />
          <ProfileDetailRow
            label={t.primaryService}
            value={workerCategoryLabel(me, t.notAdded)}
          />
          <ProfileDetailRow
            label={t.yearsExperience}
            value={
              typeof worker.yearsExperience === 'number'
                ? formatMessage(t.yearsValue, {
                    years: worker.yearsExperience,
                  })
                : t.notAdded
            }
          />
          <ProfileDetailRow
            label={t.serviceArea}
            value={workerLocationLabel(me, t.notAdded)}
          />
        </SimpleGrid>
        {worker.bio?.trim() ? (
          <Stack gap={1}>
            <Text fontSize="sm" color="text.muted">
              {t.bio}
            </Text>
            <Text fontSize="sm" lineHeight="tall">
              {worker.bio.trim()}
            </Text>
          </Stack>
        ) : null}
        {worker.skills.length > 0 ? (
          <Wrap gap={2}>
            {worker.skills.map((skill) => (
              <Badge key={skill} variant="neutral" shape="pill">
                {skill}
              </Badge>
            ))}
          </Wrap>
        ) : null}
      </Stack>
    </ProfileSectionCard>
  )
}

export function PublicPreviewCard({
  me,
  lifecycle,
}: {
  me: MeSnapshot
  lifecycle: ProfileLifecycle
}) {
  const t = useI11n(bag)
  if (!me.worker?.id) return null
  const published = profileIsPublished(lifecycle)
  const area = publicServiceAreaLabel(me, t.serviceAreaNotAdded)
  const servesLabel = me.worker.travelRadiusMiles
    ? formatMessage(t.servesAreaMiles, {
        area,
        miles: me.worker.travelRadiusMiles,
      })
    : formatMessage(t.servesArea, { area })

  return (
    <ProfileSectionCard
      id="public-preview"
      title={t.publicPreviewTitle}
      description={t.publicPreviewDescription}
      icon={<LuCheck size={18} aria-hidden />}
    >
      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
        <HStack
          gap={3}
          align="flex-start"
          p={4}
          borderRadius="lg"
          bg="bg.subtle"
        >
          <MeAvatar size="md" name={displayNameFromMe(me)} />
          <Stack gap={1} minW={0}>
            <Text fontSize="sm" fontWeight={700}>
              {displayNameFromMe(me)}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {me.worker.tagline?.trim() || t.headlineNotAdded}
            </Text>
            <HStack gap={1.5} color="text.muted">
              <LuMapPin size={14} aria-hidden />
              <Text fontSize="xs">{servesLabel}</Text>
            </HStack>
            {me.worker.skills.length > 0 ? (
              <Wrap gap={1.5} pt={1}>
                {me.worker.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="neutral" shape="pill">
                    {skill}
                  </Badge>
                ))}
              </Wrap>
            ) : null}
          </Stack>
        </HStack>
        <Stack
          gap={2}
          p={4}
          borderRadius="lg"
          bg="status.success.soft"
          align="flex-start"
        >
          <HStack gap={2}>
            <LuLock size={15} aria-hidden />
            <Text fontSize="sm" fontWeight={600}>
              {t.safePublicView}
            </Text>
          </HStack>
          <Text fontSize="xs" color="text.muted" lineHeight="tall">
            {t.safePublicViewBody}
          </Text>
          {published && lifecycle.publicProfileHref ? (
            <Link
              href={lifecycle.publicProfileHref}
              fontSize="xs"
              fontWeight={600}
            >
              {t.viewFullPublicProfile}
            </Link>
          ) : (
            <Badge variant="warning" shape="pill">
              {t.notPublished}
            </Badge>
          )}
        </Stack>
      </SimpleGrid>
    </ProfileSectionCard>
  )
}
