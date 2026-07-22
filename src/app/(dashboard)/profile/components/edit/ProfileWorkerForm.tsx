'use client'

import { HStack, Heading, Stack, Text } from '@chakra-ui/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { useUserStore } from '@/app/(auth)/store/user'
import {
  WorkerSetupBioComposer,
  WorkerSetupCategoryTiles,
  WorkerSetupPortfolioInput,
  WorkerSetupQualificationsInput,
  WorkerSetupSkillsInput,
} from '@/app/(stepflow)/worker/setup/components'
import { categoryBySlug } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { isWorkerSetupComplete } from '@/app/(stepflow)/worker/setup/helpers/workerSetupEligibility'
import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { HEADLINE_MAX_CHARS } from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'
import { apolloClient } from '@/utils/apolloClient'
import { showAppToast } from '@/utils/appToast'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Card, FormField, Input, Link } from '@ui'

import { saveWorkerProfileForm } from '../../helpers/saveWorkerProfileForm'
import { isWorkerSetupInProgress } from '../../helpers/workerSetupProfileHelpers'
import {
  type WorkerFormValues,
  workerFormSchema,
  workerFormValuesFromMe,
} from '../../workerFormSchema'

export function ProfileWorkerForm({
  embedded = false,
  onCancel,
  onSaved,
}: {
  embedded?: boolean
  onCancel?: () => void
  onSaved?: () => void
}) {
  const me = useUserStore((s) => s.me)
  const setMe = useUserStore((s) => s.setMe)
  const getUser = useUserStore((s) => s.getUser)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const formValues = useMemo(
    () => (me ? workerFormValuesFromMe(me) : null),
    [me],
  )

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<WorkerFormValues>({
    resolver: zodResolver(workerFormSchema),
    values: formValues ?? undefined,
  })

  if (!me || !formValues) return null

  const setupComplete = isWorkerSetupComplete(me)
  const setupInProgress = isWorkerSetupInProgress(me)

  if (!me.worker?.id) {
    return (
      <Card layout="section" id="profile-worker" p={{ base: 5, md: 6 }}>
        <Stack gap={4}>
          <Stack gap={1}>
            <Heading size="md">Become a worker</Heading>
            <Text fontSize="sm" color="text.muted">
              Set up your worker profile to send quotes. Customers pay you
              directly for completed work.
            </Text>
          </Stack>
          <Link
            href={workerSetupHref('/profile')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button w={{ base: 'full', sm: 'auto' }}>Start worker setup</Button>
          </Link>
        </Stack>
      </Card>
    )
  }

  if (setupInProgress) {
    return (
      <Card layout="section" id="profile-worker" p={{ base: 5, md: 6 }}>
        <Stack gap={3}>
          <Heading size="md">Worker profile (in progress)</Heading>
          <Text fontSize="sm" color="text.muted">
            Finish setup to edit your full worker profile here. What you have
            saved so far:
          </Text>
          <WorkerProfileSummary values={formValues} />
          <Link
            href={workerSetupHref('/profile')}
            _hover={{ textDecoration: 'none' }}
          >
            <Button
              size="sm"
              variant="primary"
              w={{ base: 'full', sm: 'auto' }}
            >
              Continue setup
            </Button>
          </Link>
        </Stack>
      </Card>
    )
  }

  if (!setupComplete) {
    return null
  }

  const onSubmit = async (values: WorkerFormValues) => {
    setSubmitError(null)
    setSaving(true)
    try {
      await saveWorkerProfileForm(apolloClient, values, me, setMe)
      reset(values)
      await getUser()
      showAppToast({ title: 'Worker profile saved' })
      onSaved?.()
    } catch (error: unknown) {
      const message = getFriendlyErrorMessage(
        error,
        'Could not save worker profile.',
      )
      setSubmitError(message)
      showAppToast({
        title: 'Could not save worker profile',
        description: message,
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      id="profile-worker"
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event)
      }}
      noValidate
    >
      <Stack gap={6}>
        {submitError ? (
          <Text color="status.danger.fg" fontSize="sm">
            {submitError}
          </Text>
        ) : null}

        <Card
          layout="section"
          p={embedded ? 0 : { base: 5, md: 6 }}
          borderWidth={embedded ? 0 : '1px'}
          boxShadow={embedded ? 'none' : 'e1'}
        >
          <Stack gap={4}>
            <Stack gap={1}>
              <Heading size="md">Worker profile</Heading>
              <Text fontSize="sm" color="text.muted">
                Update the details customers see when you quote on tasks.
              </Text>
            </Stack>

            <FormField
              label="Legal name"
              helperText="Your full legal name on your public worker profile."
              errorText={errors.legalName?.message}
            >
              <Input
                {...register('legalName')}
                placeholder="Alex Johnson"
                minH="44px"
              />
            </FormField>

            <FormField
              label="Professional headline"
              helperText="Shown under your name on your public profile."
              errorText={errors.tagline?.message}
            >
              <Input
                {...register('tagline')}
                placeholder="e.g. Handyman with 8 years experience"
                maxLength={HEADLINE_MAX_CHARS}
                minH="44px"
              />
            </FormField>

            <WorkerSetupBioComposer
              value={watch('bio')}
              onChange={(bio) =>
                setValue('bio', bio, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              errorText={errors.bio?.message}
            />

            <FormField
              label="What kind of work do you do most?"
              helperText="Your primary trade — it leads your profile headline."
              errorText={errors.primaryCategory?.message}
            >
              <WorkerSetupCategoryTiles
                value={watch('primaryCategory')}
                onChange={(slug) =>
                  setValue('primaryCategory', slug, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
            </FormField>

            <WorkerSetupSkillsInput
              value={watch('skills')}
              onChange={(skills) =>
                setValue('skills', skills, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              suggestions={
                categoryBySlug(watch('primaryCategory'))?.suggestedSkills.length
                  ? categoryBySlug(watch('primaryCategory'))?.suggestedSkills
                  : undefined
              }
              errorText={errors.skills?.message}
            />

            <HStack gap={4} flexWrap="wrap" align="flex-start">
              <FormField
                label="Years of experience"
                errorText={errors.yearsExperience?.message}
                flex="1"
                minW={{ base: 'full', md: '200px' }}
              >
                <Input
                  {...register('yearsExperience')}
                  inputMode="numeric"
                  placeholder="3"
                  minH="44px"
                />
              </FormField>
              <FormField
                label="Travel radius (miles)"
                helperText="Optional"
                errorText={errors.travelRadiusMiles?.message}
                flex="1"
                minW={{ base: 'full', md: '200px' }}
              >
                <Input
                  {...register('travelRadiusMiles')}
                  inputMode="decimal"
                  placeholder="10"
                  minH="44px"
                />
              </FormField>
            </HStack>

            <WorkerSetupQualificationsInput
              value={watch('qualifications')}
              onChange={(qualifications) =>
                setValue('qualifications', qualifications, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />

            <FormField
              label="Service area"
              helperText="City or postcode. Coordinates are refreshed when you save."
              errorText={errors.locationName?.message}
            >
              <Input
                {...register('locationName')}
                onChange={(e) => {
                  setValue('locationName', e.target.value, {
                    shouldDirty: true,
                  })
                  setValue('locationLat', null, { shouldDirty: true })
                  setValue('locationLng', null, { shouldDirty: true })
                }}
                placeholder="London or WD17 2AW"
                minH="44px"
              />
            </FormField>

            <WorkerSetupPortfolioInput
              value={watch('portfolioUrls')}
              onChange={(portfolioUrls) =>
                setValue('portfolioUrls', portfolioUrls, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </Stack>
        </Card>

        <HStack
          gap={3}
          justify="flex-end"
          position={embedded ? 'sticky' : 'static'}
          bottom={0}
          bg="bg.surface"
          py={embedded ? 3 : 0}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              reset(formValues)
              onCancel?.()
            }}
            disabled={saving}
          >
            {embedded ? 'Cancel' : 'Reset'}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving || isSubmitting}
            disabled={!isDirty}
          >
            {embedded ? 'Save' : 'Save worker profile'}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}

function WorkerProfileSummary({ values }: { values: WorkerFormValues }) {
  const rows: { label: string; value: string }[] = [
    { label: 'Name', value: values.legalName },
    { label: 'Bio', value: values.bio },
    { label: 'Skills', value: values.skills.join(', ') },
    { label: 'Experience', value: values.yearsExperience },
    { label: 'Service area', value: values.locationName },
  ].filter((row) => row.value.trim())

  return (
    <Stack gap={2}>
      {rows.map((row) => (
        <Stack key={row.label} gap={0}>
          <Text
            fontSize="xs"
            fontWeight={700}
            color="text.muted"
            textTransform="uppercase"
          >
            {row.label}
          </Text>
          <Text fontSize="sm">{row.value}</Text>
        </Stack>
      ))}
    </Stack>
  )
}
