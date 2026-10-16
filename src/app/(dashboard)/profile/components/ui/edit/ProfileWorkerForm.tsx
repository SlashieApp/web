'use client'

import { HStack, Stack, Text } from '@chakra-ui/react'
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
import { categorySkills } from '@/app/(stepflow)/worker/setup/helpers/workerSetupCategories'
import { HEADLINE_MAX_CHARS } from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'
import setupBag from '@/app/(stepflow)/worker/setup/i11n.json'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { apolloClient } from '@/utils/apolloClient'
import { showAppToast } from '@/utils/appToast'
import { Button, FormField, Input } from '@ui'

import { saveWorkerProfileForm } from '../../../helpers/saveWorkerProfileForm'
import bag from '../../../i11n.json'
import {
  type WorkerFormValues,
  createWorkerFormSchema,
  workerFormValuesFromMe,
} from '../../../workerFormSchema'

/**
 * Edit a finished worker profile (the Profile drawer). Unfinished workers
 * edit in worker setup; the worker card only offers Edit once it's live.
 */
export function ProfileWorkerForm({
  onCancel,
  onSaved,
}: {
  onCancel?: () => void
  onSaved?: () => void
}) {
  const { workerForm: t, editor } = useI11n(bag)
  const trades = useI11n(setupBag).trades
  const me = useUserStore((s) => s.me)
  const setMe = useUserStore((s) => s.setMe)
  const getUser = useUserStore((s) => s.getUser)
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const schema = useMemo(() => createWorkerFormSchema(t.errors), [t.errors])

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
    resolver: zodResolver(schema),
    values: formValues ?? undefined,
  })

  if (!me?.worker?.id || !formValues) return null

  const onSubmit = async (values: WorkerFormValues) => {
    setSubmitError(null)
    setSaving(true)
    try {
      await saveWorkerProfileForm(apolloClient, values, me, setMe)
      reset(values)
      await getUser()
      trackFlowSucceeded(EVENTS.profile_update_success, {
        section: 'worker',
      })
      showAppToast({ title: t.saved })
      onSaved?.()
    } catch (error: unknown) {
      trackFlowFailed(EVENTS.profile_update_fail, error, {
        flow: 'profile_update',
        action: 'saveWorkerProfileForm',
        operation: 'SaveWorkerSetupStep',
        route: '/profile',
        extra: { section: 'worker' },
      })
      setSubmitError(t.saveFailed)
      showAppToast({ title: t.saveFailed, type: 'error' })
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
          <Text color="status.danger.fg" fontSize="sm" role="alert">
            {submitError}
          </Text>
        ) : null}

        <FormField
          label={t.legalName}
          helperText={t.legalNameHelp}
          errorText={errors.legalName?.message}
        >
          <Input
            {...register('legalName')}
            placeholder={t.legalNamePlaceholder}
            minH="44px"
          />
        </FormField>

        <FormField
          label={t.headline}
          helperText={t.headlineHelp}
          errorText={errors.tagline?.message}
        >
          <Input
            {...register('tagline')}
            placeholder={t.headlinePlaceholder}
            maxLength={HEADLINE_MAX_CHARS}
            minH="44px"
          />
        </FormField>

        <WorkerSetupBioComposer
          value={watch('bio')}
          onChange={(bio) =>
            setValue('bio', bio, { shouldDirty: true, shouldValidate: true })
          }
          errorText={errors.bio?.message}
        />

        <WorkerSetupCategoryTiles
          label={t.category}
          helperText={t.categoryHelp}
          errorText={errors.primaryCategory?.message}
          value={watch('primaryCategory')}
          onChange={(slug) =>
            setValue('primaryCategory', slug, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <WorkerSetupSkillsInput
          value={watch('skills')}
          onChange={(skills) =>
            setValue('skills', skills, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
          suggestions={categorySkills(watch('primaryCategory'), trades)}
          errorText={errors.skills?.message}
        />

        <HStack gap={4} flexWrap="wrap" align="flex-start">
          <FormField
            label={t.years}
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
            label={t.radius}
            helperText={t.optional}
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
          label={t.area}
          helperText={t.areaHelp}
          errorText={errors.locationName?.message}
        >
          <Input
            {...register('locationName')}
            onChange={(e) => {
              setValue('locationName', e.target.value, { shouldDirty: true })
              setValue('locationLat', null, { shouldDirty: true })
              setValue('locationLng', null, { shouldDirty: true })
            }}
            placeholder={t.areaPlaceholder}
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

        <HStack
          gap={3}
          justify="flex-end"
          position="sticky"
          bottom={0}
          bg="bg.surface"
          py={3}
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
            {editor.cancel}
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={saving || isSubmitting}
            disabled={!isDirty}
          >
            {editor.save}
          </Button>
        </HStack>
      </Stack>
    </form>
  )
}
