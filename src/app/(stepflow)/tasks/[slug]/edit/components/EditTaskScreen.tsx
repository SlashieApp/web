'use client'

import { useApolloClient, useMutation } from '@apollo/client/react'
import { HStack, Text } from '@chakra-ui/react'
import type {
  TaskContactMethod,
  TaskForEditQuery,
  UpdateTaskMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { type UseFormRegister, useForm } from 'react-hook-form'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import type { ContactOption } from '@/app/(dashboard)/profile/profileEligibility'
import { TaskLocationMapPicker } from '@/app/(stepflow)/tasks/create/components/layout/map/TaskLocationMapPicker'
import { CreateTaskAddressSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskAddressSection'
import { CreateTaskBasicsSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskBasicsSection'
import { CreateTaskBudgetSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskBudgetSection'
import { CreateTaskContactSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskContactSection'
import { CreateTaskLocationSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskLocationSection'
import { CreateTaskScheduleSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskScheduleSection'
import { CreateTaskVisualsSection } from '@/app/(stepflow)/tasks/create/components/ui/sections/CreateTaskVisualsSection'
import type { CreateTaskFormFieldValues } from '@/app/(stepflow)/tasks/create/createTaskFormSchema'
import {
  resolvePublicAreaName,
  usePublicTaskArea,
} from '@/app/(stepflow)/tasks/create/helpers/publicTaskArea'
import { taskServerError } from '@/app/(stepflow)/tasks/create/helpers/taskFieldError'
import { useTaskPhotos } from '@/app/(stepflow)/tasks/create/helpers/useTaskPhotos'
import createBag from '@/app/(stepflow)/tasks/create/i11n.json'
import {
  taskImageUrls,
  taskToEditFormValues,
} from '@/app/(task)/helpers/taskEditHelpers'
import UpdateTask from '@/app/(task)/tasks/[slug]/graphql/UpdateTask.gql'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import { isUnauthenticatedError } from '@/utils/graphqlErrors'
import {
  type PhotoUploadProgress,
  photoProgressLabel,
} from '@/utils/photoUploadProgress'
import { freeTaskImageSlots } from '@/utils/taskImageKeys'
import { uploadTaskImagesSettled } from '@/utils/taskImageUpload'
import { townOnly } from '@/utils/taskLocationDisplay'
import {
  FormSection,
  FormStack,
  InfoBar,
  Modal,
  StepFlowHeader,
  StepFlowLayout,
} from '@ui'

import {
  type EditTaskFormFieldValues,
  type EditTaskFormValues,
  editTaskFormSchema,
} from '../editTaskFormSchema'
import {
  buildEditTaskInput,
  editTaskLocationChanged,
} from '../helpers/editTaskInput'
import bag from '../i11n.json'
import { EditTaskMobileBar, EditTaskRail } from './EditTaskRail'

const UPDATE = { shouldValidate: true, shouldDirty: true } as const

export type EditTaskScreenProps = {
  task: NonNullable<TaskForEditQuery['task']>
  contactOptions: ContactOption[]
  liveQuotes: number
  /** Workers have quoted: they won't be told about changes. */
  quotesWarning: boolean
}

/**
 * /tasks/[slug]/edit (FE-297), in the step-flow shell: create's own sections
 * on one page, one Save at the bottom. Only what changed is sent, so an
 * untouched contact method keeps its current value. Leaving with changes
 * asks first.
 *
 * Form spacing (FE-481): it is a long form, so the groups are sections: 32
 * apart with no dividing line, each title 12 above its first field, the fields
 * inside 20 apart. The quotes warning is a field group above them (20).
 */
export function EditTaskScreen({
  task,
  contactOptions,
  liveQuotes,
  quotesWarning,
}: EditTaskScreenProps) {
  const t = useI11n(bag)
  const create = useI11n(createBag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const apollo = useApolloClient()
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const taskHref = `/tasks/${task.id}`
  const [existing] = useState(() => taskImageUrls(task))
  const [initial] = useState(() => {
    const { preferredContactMethod: _, ...values } = taskToEditFormValues(task)
    return values
  })

  const form = useForm<EditTaskFormFieldValues>({
    resolver: zodResolver(editTaskFormSchema),
    mode: 'onTouched',
    defaultValues: initial,
  })
  const { register, setValue, watch, trigger, getValues, formState } = form
  const values = watch()
  const errors = formState.errors
  // The shared sections type `register` against create's form; edit's fields
  // are the same minus the contact method, which they don't register.
  const sharedRegister =
    register as unknown as UseFormRegister<CreateTaskFormFieldValues>

  const photos = useTaskPhotos(existing.length)
  const [contact, setContact] = useState<TaskContactMethod | null>(null)
  // "Use pin address" only once the pin has moved: before that, the label is
  // the stored town, not an address.
  const [pinMoved, setPinMoved] = useState(false)
  // Locate-me found nothing: create's hint, until the pin moves (FE-356).
  const [locateUnavailable, setLocateUnavailable] = useState(false)
  const [saving, setSaving] = useState(false)
  const [photoProgress, setPhotoProgress] =
    useState<PhotoUploadProgress | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [discardOpen, setDiscardOpen] = useState(false)
  const saveLockRef = useRef(false)
  const publicArea = usePublicTaskArea(
    values.locationLat,
    values.locationLng,
    accessToken,
  )
  const changed =
    formState.isDirty || contact !== null || photos.files.length > 0

  // A reload or closing the tab with changes asks the browser's question.
  useEffect(() => {
    if (!changed) return
    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [changed])

  const [runUpdateTask] = useMutation<UpdateTaskMutation>(UpdateTask, {
    refetchQueries: ['MyRequests', 'Tasks'],
  })

  const loginHref = localize(
    `/login?next=${encodeURIComponent(`${taskHref}/edit`)}`,
  )

  /** One save at a time; the lock stays while the task page loads. */
  async function save() {
    // A HEIC photo still converting: Save waits for it (FE-341).
    if (saveLockRef.current || photos.converting) return
    saveLockRef.current = true
    setSaving(true)
    setPhotoProgress(null)
    setServerError(null)
    let leaving = false
    try {
      if (!(await trigger(undefined, { shouldFocus: true }))) {
        setServerError(t.errors.fixFields)
        return
      }
      if (!getAuthToken()) {
        leaving = true
        router.replace(loginHref)
        return
      }
      if (!changed) {
        leaving = true
        router.push(localize(taskHref))
        return
      }
      const submitted = getValues() as EditTaskFormValues
      const dirty = formState.dirtyFields as Record<string, unknown>
      const publicName = editTaskLocationChanged(dirty)
        ? // Town at the pin, never the map's street label (FE-70).
          await resolvePublicAreaName({
            lat: Number.parseFloat(submitted.locationLat),
            lng: Number.parseFloat(submitted.locationLng),
            fallbackLabel: submitted.mapPlaceName,
            accessToken,
          })
        : ''
      const input = buildEditTaskInput({
        values: submitted,
        dirty,
        contact,
        publicName,
      })
      if (Object.keys(input).length > 0) {
        await runUpdateTask({ variables: { taskId: task.id, input } })
      }
      const { failed } = await uploadTaskImagesSettled(
        apollo,
        task,
        photos.files,
        { slots: freeTaskImageSlots(existing), onProgress: setPhotoProgress },
      )
      showAppToast(
        failed > 0
          ? {
              title:
                failed === 1
                  ? t.errors.photoFailed
                  : formatMessage(t.errors.photosFailed, { count: failed }),
              description: t.errors.photosFailedBody,
              type: 'warning',
            }
          : { title: t.saved, type: 'success' },
      )
      trackFlowSucceeded(EVENTS.task_save_success, {
        task_id: task.id,
        photos_failed: failed,
      })
      leaving = true
      router.replace(localize(taskHref))
    } catch (err: unknown) {
      trackFlowFailed(EVENTS.task_save_fail, err, {
        flow: 'task_save',
        action: 'updateTask',
        operation: 'UpdateTask',
        route: `${taskHref}/edit`,
        extra: { task_id: task.id },
      })
      if (isUnauthenticatedError(err)) {
        leaving = true
        router.replace(loginHref)
        return
      }
      setServerError(
        taskServerError(create.serverErrors, err, t.errors.saveFailed),
      )
    } finally {
      if (!leaving) {
        saveLockRef.current = false
        setSaving(false)
      }
    }
  }

  return (
    <>
      <StepFlowLayout
        banner={<AppStatusBanners />}
        header={
          <StepFlowHeader
            title={t.eyebrow}
            exitHref={taskHref}
            closeLabel={t.closeLabel}
            onExit={(event) => {
              if (!changed) return
              event.preventDefault()
              setDiscardOpen(true)
            }}
          />
        }
        stepper={<EditTaskRail taskId={task.id} liveQuotes={liveQuotes} />}
        mobileTop={
          <EditTaskMobileBar taskId={task.id} liveQuotes={liveQuotes} />
        }
        title={task.title}
        description={t.description}
        errorText={serverError}
        actions={{
          showBack: false,
          continueLabel: t.save,
          continueLoading: saving || photos.converting,
          // Save says which photo it's on; before the photos it just spins.
          continueLoadingText: saving
            ? photoProgressLabel(photoProgress, create.photoProgress)
            : photos.converting
              ? create.photoProgress.converting
              : undefined,
          isFinal: true,
          onContinue: () => void save(),
        }}
      >
        {quotesWarning ? (
          <InfoBar tone="warning" heading={t.quotesWarningHeading} hideBadge>
            {liveQuotes === 1
              ? t.quotesWarningOne
              : formatMessage(t.quotesWarning, { count: liveQuotes })}
          </InfoBar>
        ) : null}

        <FormStack gap="section">
          <FormSection title={create.steps.details.label}>
            <CreateTaskBasicsSection
              bare
              register={sharedRegister}
              categories={values.categories}
              onCategoriesChange={(next) =>
                setValue('categories', next, UPDATE)
              }
              fieldErrors={{
                title: errors.title?.message,
                categories: errors.categories?.message,
                description: errors.description?.message,
              }}
            />
          </FormSection>

          <FormSection title={create.steps.timing.label}>
            <CreateTaskScheduleSection
              bare
              datetimeType={values.datetimeType}
              onDatetimeTypeChange={(v) => setValue('datetimeType', v, UPDATE)}
              preferredDate={values.preferredDate}
              preferredTime={values.preferredTime}
              onPreferredDateChange={(v) =>
                setValue('preferredDate', v, UPDATE)
              }
              onPreferredTimeChange={(v) =>
                setValue('preferredTime', v, UPDATE)
              }
              fieldErrors={{
                preferredDate: errors.preferredDate?.message,
                preferredTime: errors.preferredTime?.message,
              }}
            />
          </FormSection>

          <FormSection title={create.steps.location.label}>
            <TaskLocationMapPicker
              accessToken={accessToken}
              location={values.mapPlaceName}
              locationLat={values.locationLat}
              locationLng={values.locationLng}
              onLocationChange={(v) => setValue('mapPlaceName', v, UPDATE)}
              onLocationLatChange={(v) => {
                setPinMoved(true)
                setLocateUnavailable(false)
                setValue('locationLat', v, UPDATE)
              }}
              onLocationLngChange={(v) => setValue('locationLng', v, UPDATE)}
              onLocateFailed={() => setLocateUnavailable(true)}
            />
            <CreateTaskLocationSection
              privacyCallout
              publicArea={townOnly(publicArea) ?? ''}
              locationError={
                errors.mapPlaceName?.message ??
                errors.locationLat?.message ??
                errors.locationLng?.message
              }
              locateUnavailable={locateUnavailable}
            />
            <CreateTaskAddressSection
              register={sharedRegister}
              privacyHint
              streetAddressError={errors.streetAddress?.message}
              pinAddress={values.mapPlaceName}
              onUsePinAddress={
                pinMoved
                  ? () => {
                      const name = getValues('mapPlaceName').trim()
                      if (name) setValue('streetAddress', name, UPDATE)
                    }
                  : undefined
              }
            />
          </FormSection>

          <FormSection title={create.steps.budget.label}>
            <CreateTaskBudgetSection
              bare
              register={sharedRegister}
              budgetCurrency={values.budgetCurrency}
              budgetType={values.budgetType}
              paymentMethod={values.paymentMethod}
              onBudgetTypeChange={(v) => setValue('budgetType', v, UPDATE)}
              onPaymentMethodChange={(v) =>
                setValue('paymentMethod', v, UPDATE)
              }
              budgetMajorError={errors.budgetMajor?.message}
            />
          </FormSection>

          <FormSection title={t.sections.photos}>
            <CreateTaskVisualsSection
              bare
              labelled={false}
              existingImageUrls={existing}
              photos={photos.tiles}
              rejected={photos.rejected}
              onFilesAdded={photos.add}
              onRemoveFile={photos.remove}
            />
          </FormSection>

          <FormSection title={t.sections.contact}>
            <CreateTaskContactSection
              bare
              preferredContactMethod={contact}
              onPreferredContactMethodChange={setContact}
              contactOptions={contactOptions}
              helperText={t.contactKeep}
            />
          </FormSection>
        </FormStack>
      </StepFlowLayout>

      <Modal
        open={discardOpen}
        onOpenChange={setDiscardOpen}
        title={t.discard.title}
        size="sm"
        cancelLabel={t.discard.keep}
        submitLabel={t.discard.discard}
        onSubmit={() => {
          setDiscardOpen(false)
          router.push(localize(taskHref))
        }}
      >
        <HStack>
          <Text fontSize="sm" color="text.muted" lineHeight="tall">
            {t.discard.body}
          </Text>
        </HStack>
      </Modal>
    </>
  )
}
