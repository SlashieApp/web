'use client'

import { Box, HStack, SimpleGrid, Stack, Text, Wrap } from '@chakra-ui/react'
import {
  LuBriefcaseBusiness,
  LuCheck,
  LuLock,
  LuMail,
  LuMapPin,
  LuPhone,
  LuUser,
} from 'react-icons/lu'

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
import { formatPhoneForDisplay } from '@/utils/phoneNormalize'
import { Badge, Button, CurrentUserAvatar, Link } from '@ui'

import type { ProfileLifecycle } from '../helpers/profileLifecycle'
import { profileIsPublished } from '../helpers/profileLifecycle'
import { displayNameFromMe } from '../profileDisplayHelpers'
import { ProfileDetailRow, ProfileSectionCard } from './ProfileSectionCard'

function VerificationBadge({ verified }: { verified: boolean }) {
  return (
    <Badge
      variant={verified ? 'success' : 'neutral'}
      dot={verified}
      shape="pill"
    >
      {verified ? 'Verified' : 'Not verified'}
    </Badge>
  )
}

function privateDateLabel(value: unknown): string {
  if (!value) return 'Not added'
  const date = new Date(String(value))
  if (Number.isNaN(date.getTime())) return 'Not added'
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
  return (
    <ProfileSectionCard
      id="personal-info"
      title="Personal information"
      description="Private account details and your public display name."
      icon={<LuUser size={18} aria-hidden />}
      onEdit={onEdit}
    >
      <Stack gap={3}>
        <ProfileDetailRow label="Full name" value={displayNameFromMe(me)} />
        <ProfileDetailRow
          label="Date of birth"
          value={privateDateLabel(me.profile?.dateOfBirth)}
          trailing={<LuLock size={13} aria-label="Private" />}
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
  const phone = profileContactNumber(me)

  return (
    <ProfileSectionCard
      id="contact-verification"
      title="Contact details"
      description="Visible only to you. Verification status comes from your account."
      icon={<LuMail size={18} aria-hidden />}
      onEdit={onEdit}
      editLabel="Manage"
    >
      <Stack gap={4}>
        <ProfileDetailRow
          label="Email"
          value={me.email}
          trailing={<VerificationBadge verified={isEmailVerified(me)} />}
        />
        <ProfileDetailRow
          label="Phone"
          value={phone ? formatPhoneForDisplay(phone) : 'Not added'}
          trailing={<VerificationBadge verified={isPhoneVerified(me)} />}
        />
      </Stack>
    </ProfileSectionCard>
  )
}

function workerLocationLabel(me: MeSnapshot): string {
  return (
    me.worker?.location?.name?.trim() ||
    me.worker?.locationAddress?.trim() ||
    'Not added'
  )
}

function publicServiceAreaLabel(me: MeSnapshot): string {
  return me.worker?.location?.name?.trim() || 'Service area not added'
}

function workerCategoryLabel(me: MeSnapshot): string {
  const slug = categorySlugFromEnum(me.worker?.primaryCategory)
  return categoryBySlug(slug)?.label ?? 'Not added'
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
  if (!me.worker?.id) {
    return (
      <ProfileSectionCard
        id="worker-profile"
        title="Worker profile"
        description="Create a professional profile to send quotes and appear in search."
        icon={<LuBriefcaseBusiness size={18} aria-hidden />}
      >
        <Stack gap={4} align="flex-start">
          <Text fontSize="sm" color="text.muted">
            You have a customer account. Worker fields and profile-strength
            progress will appear after you begin setup.
          </Text>
          <Link
            href={workerSetupHref('/profile?section=worker')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button size="sm">Become a worker</Button>
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
      title="Worker profile"
      description="Professional details customers see when reviewing your work."
      icon={<LuBriefcaseBusiness size={18} aria-hidden />}
      onEdit={draft ? undefined : onEdit}
    >
      <Stack gap={4}>
        <HStack justify="space-between" gap={3} flexWrap="wrap">
          <Badge variant={draft ? 'warning' : 'success'} dot shape="pill">
            {draft ? 'Not published yet' : 'Published'}
          </Badge>
          {draft ? (
            <Link
              href={workerSetupHref('/profile?section=worker')}
              _hover={{ textDecoration: 'none' }}
            >
              <Button size="sm">Continue setup</Button>
            </Link>
          ) : null}
        </HStack>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
          <ProfileDetailRow
            label="Professional headline"
            value={worker.tagline?.trim() || 'Not added'}
          />
          <ProfileDetailRow
            label="Primary service"
            value={workerCategoryLabel(me)}
          />
          <ProfileDetailRow
            label="Years of experience"
            value={
              typeof worker.yearsExperience === 'number'
                ? `${worker.yearsExperience} years`
                : 'Not added'
            }
          />
          <ProfileDetailRow
            label="Service area"
            value={workerLocationLabel(me)}
          />
        </SimpleGrid>
        {worker.bio?.trim() ? (
          <Stack gap={1}>
            <Text fontSize="sm" color="text.muted">
              Bio
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
  if (!me.worker?.id) return null
  const published = profileIsPublished(lifecycle)

  return (
    <ProfileSectionCard
      id="public-preview"
      title="Public profile preview"
      description="Owner-only preview. Private contact details and exact addresses are excluded."
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
          <CurrentUserAvatar size="md" name={displayNameFromMe(me)} />
          <Stack gap={1} minW={0}>
            <Text fontSize="sm" fontWeight={700}>
              {displayNameFromMe(me)}
            </Text>
            <Text fontSize="sm" color="text.muted">
              {me.worker.tagline?.trim() || 'Professional headline not added'}
            </Text>
            <HStack gap={1.5} color="text.muted">
              <LuMapPin size={14} aria-hidden />
              <Text fontSize="xs">
                Serves {publicServiceAreaLabel(me)}
                {me.worker.travelRadiusMiles
                  ? ` (about ${me.worker.travelRadiusMiles} miles)`
                  : ''}
              </Text>
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
              Safe public view
            </Text>
          </HStack>
          <Text fontSize="xs" color="text.muted" lineHeight="tall">
            Customers see only your approximate service area. Email, phone, date
            of birth, and street address remain private.
          </Text>
          {published && lifecycle.publicProfileHref ? (
            <Link
              href={lifecycle.publicProfileHref}
              fontSize="xs"
              fontWeight={600}
            >
              View full public profile
            </Link>
          ) : (
            <Badge variant="warning" shape="pill">
              Not published yet
            </Badge>
          )}
        </Stack>
      </SimpleGrid>
    </ProfileSectionCard>
  )
}
