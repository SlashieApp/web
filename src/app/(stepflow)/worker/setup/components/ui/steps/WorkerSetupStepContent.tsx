'use client'

import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { type ComponentType, useState } from 'react'

import { useUserStore } from '@/app/(auth)/store/user'
import { ContactMethodsPanel } from '@/app/(dashboard)/components/ui/ContactMethodsPanel'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { apolloClient } from '@/utils/apolloClient'
import {
  type ImageUploadErrorCode,
  imageUploadErrorCode,
} from '@/utils/graphqlErrors'
import { isHeicFile, viewablePhoto } from '@/utils/heicPhoto'
import {
  AVATAR_ACCEPTED_TYPES,
  uploadProfileAvatar,
  validateAvatarFile,
} from '@/utils/profileAvatarUpload'
import {
  Button,
  FormField,
  Input,
  PhotoSourcePicker,
  PhotoTile,
  type PhotoTileState,
  RadioButtonGroup,
  formControlRootProps,
} from '@ui'

import { useWorkerSetup } from '../../../context/WorkerSetupProvider'
import { computeProfileStrength } from '../../../helpers/workerProfileStrength'
import {
  categorySkills,
  suggestedHeadline,
} from '../../../helpers/workerSetupCategories'
import type { WorkerSetupFormState } from '../../../helpers/workerSetupFormState'
import {
  HEADLINE_MAX_CHARS,
  workerSetupErrorText,
} from '../../../helpers/workerSetupValidation'
import bag from '../../../i11n.json'
import type { WorkerSetupScreenView, WorkerSetupSection } from '../../../views'
import { WorkerSetupAreaLocationInput } from '../inputs/WorkerSetupAreaLocationInput'
import { WorkerSetupBioComposer } from '../inputs/WorkerSetupBioComposer'
import { WorkerSetupCategoryTiles } from '../inputs/WorkerSetupCategoryTiles'
import { WorkerSetupPortfolioInput } from '../inputs/WorkerSetupPortfolioInput'
import { WorkerSetupQualificationsInput } from '../inputs/WorkerSetupQualificationsInput'
import { WorkerSetupSkillsInput } from '../inputs/WorkerSetupSkillsInput'
import { WorkerSetupProfilePreview } from '../preview/WorkerSetupProfilePreview'
import { WorkerSetupOptionalLabel } from '../shared/WorkerSetupOptionalBadge'
import { WorkerSetupStrengthMeter } from '../shared/WorkerSetupStrengthMeter'

/** Travel distances offered, in miles (the API allows up to 50). */
const TRAVEL_MILES = [5, 10, 15, 25, 50]

/** Copy, form and a field's error text in the reader's language. */
function useSetupField() {
  const t = useI11n(bag)
  const setup = useWorkerSetup()
  const error = (field: keyof WorkerSetupFormState | 'avatar' | 'contact') =>
    workerSetupErrorText(t.errors, setup.fieldErrors[field])
  return { t, error, ...setup }
}

function NameSection() {
  const { t, form, patchForm, error } = useSetupField()
  return (
    <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
      <FormField label={t.fields.firstName} errorText={error('firstName')}>
        <Input
          value={form.firstName}
          onChange={(e) => patchForm({ firstName: e.target.value })}
          autoComplete="given-name"
          rootProps={formControlRootProps}
        />
      </FormField>
      <FormField label={t.fields.lastName} errorText={error('lastName')}>
        <Input
          value={form.lastName}
          onChange={(e) => patchForm({ lastName: e.target.value })}
          autoComplete="family-name"
          rootProps={formControlRootProps}
        />
      </FormField>
    </Grid>
  )
}

/** Latest birthday that is 18 today, for the date picker's `max`. */
function latestAdultBirthday(): string {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  return date.toISOString().slice(0, 10)
}

function DateOfBirthSection() {
  const { t, form, patchForm, error } = useSetupField()
  return (
    <FormField
      label={t.fields.dateOfBirth}
      helperText={t.fields.dateOfBirthHelper}
      errorText={error('dateOfBirth')}
      maxW={{ md: '280px' }}
    >
      <Input
        type="date"
        value={form.dateOfBirth}
        max={latestAdultBirthday()}
        onChange={(e) => patchForm({ dateOfBirth: e.target.value })}
        autoComplete="bday"
        rootProps={formControlRootProps}
      />
    </FormField>
  )
}

/** A pick check, or the API's reason it refused the image. */
type PhotoProblem =
  | 'photoWrongType'
  | 'photoTooLarge'
  | 'photoUploadFailed'
  | ImageUploadErrorCode

function photoProblemText(
  t: (typeof bag)['en'],
  problem: PhotoProblem,
): string {
  switch (problem) {
    case 'photoWrongType':
    case 'photoTooLarge':
    case 'photoUploadFailed':
      return t.fields[problem]
    default:
      return t.serverErrors[problem]
  }
}

function PhotoSection() {
  const { t, form, account, clearErrors, error, photoStage, setPhotoStage } =
    useSetupField()
  const me = useUserStore((s) => s.me)
  const patchMe = useUserStore((s) => s.patchMe)
  // Shown instead of the photo while a HEIC converts, or when it can't be.
  const [tile, setTile] = useState<Exclude<PhotoTileState, 'ready'> | null>(
    null,
  )
  const [problem, setProblem] = useState<PhotoProblem | null>(null)
  const initial =
    `${form.firstName}${form.lastName}`.trim().charAt(0).toUpperCase() || '?'

  const upload = async (picked: File | undefined) => {
    if (!picked) return
    const invalid = validateAvatarFile(picked)
    if (invalid) {
      setProblem(invalid === 'type' ? 'photoWrongType' : 'photoTooLarge')
      return
    }
    setProblem(null)
    // A HEIC this browser can't show becomes a JPEG first; if that fails
    // the original goes up and the API converts it.
    if (isHeicFile(picked)) {
      setPhotoStage('converting')
      setTile('converting')
    }
    const { file, viewable } = await viewablePhoto(picked)
    setTile(viewable ? null : 'unavailable')
    setPhotoStage('uploading')
    try {
      // Saved here by `finalizeAvatarUpload`; Continue only checks it is set.
      const saved = await uploadProfileAvatar(apolloClient, file)
      if (me) {
        patchMe({
          profile: { ...me.profile, avatarUrl: saved.profile.avatarUrl },
          workerEligibility: saved.workerEligibility,
        })
      }
      clearErrors(['avatar'])
    } catch (failure) {
      setProblem(imageUploadErrorCode(failure) ?? 'photoUploadFailed')
    } finally {
      setPhotoStage(null)
      setTile(null)
    }
  }

  return (
    <FormField
      label={t.fields.photo}
      helperText={t.fields.photoHelper}
      errorText={problem ? photoProblemText(t, problem) : error('avatar')}
    >
      {(field) => (
        <HStack gap={4} align="center">
          {tile ? (
            <PhotoTile state={tile} alt={t.fields.photoAlt} size="88px" round />
          ) : (
            <Box
              boxSize="88px"
              borderRadius="full"
              bg="status.success.soft"
              color="status.success.fg"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontWeight={800}
              fontSize="2xl"
              overflow="hidden"
              flexShrink={0}
            >
              {account.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={account.avatarUrl}
                  alt={t.fields.photoAlt}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span aria-hidden>{initial}</span>
              )}
            </Box>
          )}
          {/* The front camera, for a selfie. The API converts every listed
              type (HEIC too) to JPEG. */}
          <PhotoSourcePicker
            camera="user"
            accept={AVATAR_ACCEPTED_TYPES.join(',')}
            onFiles={(files) => void upload(files[0])}
          >
            {(trigger) => (
              <Button
                {...trigger}
                id={field.controlId}
                type="button"
                variant="secondary"
                minH="44px"
                loading={photoStage !== null}
                aria-describedby={field.describedBy}
              >
                {account.avatarUrl
                  ? t.fields.changePhoto
                  : t.fields.uploadPhoto}
              </Button>
            )}
          </PhotoSourcePicker>
        </HStack>
      )}
    </FormField>
  )
}

function TradeSection() {
  const { t, form, patchForm, error } = useSetupField()
  return (
    <WorkerSetupCategoryTiles
      label={t.fields.trade}
      helperText={t.fields.tradeHelper}
      value={form.primaryCategory}
      onChange={(slug) => patchForm({ primaryCategory: slug })}
      errorText={error('primaryCategory')}
    />
  )
}

function SkillsSection() {
  const { t, form, patchForm, error } = useSetupField()
  return (
    <WorkerSetupSkillsInput
      value={form.skills}
      onChange={(skills) => patchForm({ skills })}
      suggestions={categorySkills(form.primaryCategory, t.trades)}
      errorText={error('skills')}
    />
  )
}

function ExperienceSection() {
  const { t, form, patchForm, error } = useSetupField()
  return (
    <FormField
      label={t.fields.years}
      helperText={t.fields.yearsHelper}
      errorText={error('yearsExperience')}
      maxW={{ md: '280px' }}
    >
      <Input
        value={form.yearsExperience}
        onChange={(e) => patchForm({ yearsExperience: e.target.value })}
        inputMode="numeric"
        rootProps={formControlRootProps}
      />
    </FormField>
  )
}

function QualificationsSection() {
  const { form, patchForm } = useSetupField()
  return (
    <WorkerSetupQualificationsInput
      value={form.qualifications}
      onChange={(qualifications) => patchForm({ qualifications })}
    />
  )
}

function HeadlineSection() {
  const { t, form, patchForm, error } = useSetupField()
  const suggestion = suggestedHeadline(form, t)
  return (
    <Stack gap={1}>
      <FormField
        label={t.fields.headline}
        helperText={t.fields.headlineHelper}
        errorText={error('tagline')}
      >
        <Input
          value={form.tagline}
          onChange={(e) => patchForm({ tagline: e.target.value })}
          placeholder={t.fields.headlinePlaceholder}
          maxLength={HEADLINE_MAX_CHARS}
          rootProps={formControlRootProps}
        />
      </FormField>
      {suggestion && suggestion !== form.tagline.trim() ? (
        <Button
          type="button"
          variant="ghost"
          alignSelf="flex-start"
          minH="44px"
          px={2}
          color="text.link"
          fontWeight={600}
          whiteSpace="normal"
          textAlign="left"
          onClick={() => patchForm({ tagline: suggestion })}
        >
          {formatMessage(t.fields.useSuggestion, { suggestion })}
        </Button>
      ) : null}
    </Stack>
  )
}

function BioSection() {
  const { form, patchForm, error } = useSetupField()
  return (
    <WorkerSetupBioComposer
      value={form.bio}
      onChange={(bio) => patchForm({ bio })}
      errorText={error('bio')}
    />
  )
}

function PortfolioSection() {
  const { form, patchForm } = useSetupField()
  return (
    <WorkerSetupPortfolioInput
      value={form.portfolioUrls}
      onChange={(portfolioUrls) => patchForm({ portfolioUrls })}
    />
  )
}

function TravelSection() {
  const { t, form, patchForm } = useSetupField()
  const saved = Number.parseFloat(form.travelRadiusMiles)
  // A distance saved before these choices existed stays on the list.
  const miles = [
    ...new Set([...TRAVEL_MILES, ...(saved > 0 && saved <= 50 ? [saved] : [])]),
  ].sort((a, b) => a - b)
  return (
    <RadioButtonGroup
      label={
        <WorkerSetupOptionalLabel>{t.fields.travel}</WorkerSetupOptionalLabel>
      }
      helperText={t.fields.travelHelper}
      value={Number.isFinite(saved) ? String(saved) : null}
      options={miles.map((value) => ({
        value: String(value),
        label: formatMessage(t.fields.miles, { miles: value }),
      }))}
      onChange={(value) => patchForm({ travelRadiusMiles: value })}
      columns={{ base: 3, sm: miles.length }}
    />
  )
}

function PhoneSection() {
  const { clearErrors, error } = useSetupField()
  const problem = error('contact')
  return (
    <Stack gap={3} data-invalid={problem ? '' : undefined}>
      <ContactMethodsPanel
        requirePhone
        onContactUpdated={() => clearErrors(['contact'])}
      />
      {problem ? (
        <Text color="status.danger.fg" fontSize="sm" role="alert">
          {problem}
        </Text>
      ) : null}
    </Stack>
  )
}

function StrengthSection() {
  const { form, account, goToScreen } = useSetupField()
  return (
    <WorkerSetupStrengthMeter
      strength={computeProfileStrength({
        form,
        avatarUrl: account.avatarUrl,
        phoneVerified: account.phoneVerified,
      })}
      onGoToScreen={goToScreen}
    />
  )
}

function PreviewSection() {
  const { t } = useSetupField()
  return (
    <Stack gap={2}>
      <Text as="h2" fontSize="md" fontWeight={700} color="text.default">
        {t.review.previewTitle}
      </Text>
      <WorkerSetupProfilePreview />
    </Stack>
  )
}

function NotesSection() {
  const { t, account } = useSetupField()
  return (
    <Stack gap={2}>
      {account.emailVerified ? null : (
        <Text fontSize="sm" color="text.default" lineHeight="tall">
          {t.review.verifyEmailNote}
        </Text>
      )}
      <Text fontSize="sm" color="text.muted" lineHeight="tall">
        {t.review.paymentsNote}
      </Text>
    </Stack>
  )
}

const SECTIONS: Record<WorkerSetupSection, ComponentType> = {
  name: NameSection,
  dateOfBirth: DateOfBirthSection,
  photo: PhotoSection,
  trade: TradeSection,
  skills: SkillsSection,
  experience: ExperienceSection,
  qualifications: QualificationsSection,
  headline: HeadlineSection,
  bio: BioSection,
  portfolio: PortfolioSection,
  area: WorkerSetupAreaLocationInput,
  travel: TravelSection,
  phone: PhoneSection,
  strength: StrengthSection,
  preview: PreviewSection,
  notes: NotesSection,
}

/** A setup screen: its view's sections, in order. */
export function WorkerSetupStepContent({
  view,
}: {
  view: WorkerSetupScreenView
}) {
  return (
    <Stack gap={8}>
      {view.sections.map((section) => {
        const Section = SECTIONS[section]
        return <Section key={section} />
      })}
    </Stack>
  )
}
