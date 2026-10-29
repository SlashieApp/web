'use client'

import { useApolloClient } from '@apollo/client/react'
import { Text } from '@chakra-ui/react'
import { WorkerPublishState } from '@codegen/schema'
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
import { workerSetupErrorMessage } from '@/app/(stepflow)/worker/setup/helpers/workerSetupErrors'
import { HEADLINE_MAX_CHARS } from '@/app/(stepflow)/worker/setup/helpers/workerSetupValidation'
import setupBag from '@/app/(stepflow)/worker/setup/i11n.json'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { Button, DrawerBar, FormField, FormRow, FormStack, Input } from '@ui'

import {
  WorkerProfileSaveError,
  saveWorkerProfileForm,
} from '../../../helpers/saveWorkerProfileForm'
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
  const setup = useI11n(setupBag)
  const trades = setup.trades
  const me = useUserStore((s) => s.me)
  const setMe = useUserStore((s) => s.setMe)
  const getUser = useUserStore((s) => s.getUser)
  const client = useApolloClient()
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
      await saveWorkerProfileForm(client, values, me, setMe)
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
        operation:
          me.worker?.publishState === WorkerPublishState.Draft
            ? 'SaveWorkerSetupStep'
            : 'UpdateWorkerProfile',
        route: '/profile',
        extra: { section: 'worker' },
      })
      // Each API code in this page's language (worker setup's copy); the
      // editor's own line for a draft, and "couldn't save" for the rest.
      const message =
        error instanceof WorkerProfileSaveError
          ? setup.serverErrors[error.code]
          : workerSetupErrorMessage(error, {
              ...setup,
              saveFailed: t.saveFailed,
              serverErrors: {
                ...setup.serverErrors,
                WORKER_SETUP_INCOMPLETE: t.setupIncomplete,
              },
            })
      setSubmitError(message)
      showAppToast({ title: message, type: 'error' })
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
      <FormStack>
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

        {/* Years and radius: stacked on a phone (a field gap apart), side by
            side from md (an inline gap apart). */}
        <FormRow
          gridAutoFlow={{ base: 'row', md: 'column' }}
          gap={{ base: 'form.fieldGap', md: 'form.inlineGap' }}
        >
          <FormField
            label={t.years}
            errorText={errors.yearsExperience?.message}
          >
            <Input
              {...register('yearsExperience')}
              inputMode="numeric"
              placeholder="3"
            />
          </FormField>
          <FormField
            label={t.radius}
            helperText={t.optional}
            errorText={errors.travelRadiusMiles?.message}
          >
            <Input
              {...register('travelRadiusMiles')}
              inputMode="decimal"
              placeholder="10"
            />
          </FormField>
        </FormRow>

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
          />
        </FormField>

        <WorkerSetupPortfolioInput
          errorText={errors.portfolioUrls?.message}
          value={watch('portfolioUrls')}
          onChange={(portfolioUrls) =>
            setValue('portfolioUrls', portfolioUrls, {
              shouldDirty: true,
              shouldValidate: true,
            })
          }
        />

        <DrawerBar>
          <Button
            type="button"
            variant="ghost"
            size="form"
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
            size="form"
            loading={saving || isSubmitting}
            disabled={!isDirty}
          >
            {editor.save}
          </Button>
        </DrawerBar>
      </FormStack>
    </form>
  )
}
