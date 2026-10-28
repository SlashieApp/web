'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { HStack, Text } from '@chakra-ui/react'
import {
  type CreateTaskMutation,
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  type TaskForEditQuery,
  TaskPaymentMethod,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { LuMapPin } from 'react-icons/lu'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import type { ContactOption } from '@/app/(dashboard)/profile/profileEligibility'
import CreateTask from '@/app/(stepflow)/tasks/create/graphql/CreateTask.gql'
import { MARKETPLACE_MAP_MOTION_MS } from '@/app/(task)/helpers/marketplaceMap/motion'
import { taskToEditFormValues } from '@/app/(task)/helpers/taskEditHelpers'
import TaskForEdit from '@/app/(task)/tasks/[slug]/graphql/TaskForEdit.gql'
import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import {
  EVENTS,
  capture,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { APP_HOME } from '@/utils/appRoutes'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import {
  type PhotoUploadProgress,
  photoProgressLabel,
} from '@/utils/photoUploadProgress'
import { uploadTaskImagesSettled } from '@/utils/taskImageUpload'
import { townOnly } from '@/utils/taskLocationDisplay'
import { Button, StepFlowHeader, StepFlowProgress } from '@ui'

import {
  type CreateTaskFormFieldValues,
  type CreateTaskFormValues,
  buildDatetimePayload,
  createTaskFormSchema,
  londonToday,
} from '../createTaskFormSchema'
import {
  clearCreateTaskDraft,
  createTaskDraftKey,
  readCreateTaskDraft,
  saveCreateTaskDraft,
} from '../helpers/createTaskDraft'
import {
  type CreateTaskStartCentre,
  resolveCreateTaskStartCentre,
} from '../helpers/createTaskStartCentre'
import {
  createTaskFirstErroredStep,
  createTaskIsStepUnlocked,
  createTaskNextStep,
  createTaskPreviousStep,
  createTaskProgress,
} from '../helpers/createTaskSteps'
import {
  resolvePublicAreaName,
  usePublicTaskArea,
} from '../helpers/publicTaskArea'
import { publishOnce } from '../helpers/publishOnce'
import { taskServerError } from '../helpers/taskFieldError'
import { useCreateTaskLocation } from '../helpers/useCreateTaskLocation'
import { useTaskPhotos } from '../helpers/useTaskPhotos'
import bag from '../i11n.json'
import {
  CREATE_TASK_VIEWS,
  type CreateTaskSection,
  type CreateTaskStepId,
  type CreateTaskStepView,
  createTaskStep,
  getCreateTaskView,
} from '../views'
import { CreateTaskLocationMap } from './layout/map/CreateTaskLocationMap'
import {
  CREATE_TASK_SHEET_MS,
  CreateTaskMapLayout,
} from './layout/shared/CreateTaskMapLayout'
import { CreateTaskStepper } from './layout/shared/CreateTaskStepper'
import { CreateTaskAddressSection } from './ui/sections/CreateTaskAddressSection'
import { CreateTaskBasicsSection } from './ui/sections/CreateTaskBasicsSection'
import { CreateTaskBudgetSection } from './ui/sections/CreateTaskBudgetSection'
import { CreateTaskConsentSection } from './ui/sections/CreateTaskConsentSection'
import { CreateTaskContactSection } from './ui/sections/CreateTaskContactSection'
import { CreateTaskLocationSection } from './ui/sections/CreateTaskLocationSection'
import { CreateTaskScheduleSection } from './ui/sections/CreateTaskScheduleSection'
import { CreateTaskSummarySection } from './ui/sections/CreateTaskSummarySection'
import { CreateTaskVisualsSection } from './ui/sections/CreateTaskVisualsSection'

const POST_TASK_PATH = '/tasks/create'
const UPDATE = { shouldValidate: true, shouldDirty: true } as const

/** `?repost=<taskId>`: prefill from one of the poster's earlier tasks. */
function readRepostTaskId(): string | null {
  return (
    new URLSearchParams(window.location.search).get('repost')?.trim() || null
  )
}

function readStartCentre(): CreateTaskStartCentre {
  return resolveCreateTaskStartCentre({ search: window.location.search })
}

/** Local storage, or null where the browser blocks it. */
function draftStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function defaultValues(
  startCentre: CreateTaskStartCentre,
  contact: TaskContactMethod,
): CreateTaskFormFieldValues {
  const pinned = startCentre.source !== 'default'
  return {
    title: '',
    categories: [],
    description: '',
    streetAddress: '',
    mapPlaceName: '',
    locationLat: pinned ? startCentre.lat.toFixed(6) : '',
    locationLng: pinned ? startCentre.lng.toFixed(6) : '',
    datetimeType: TaskDateTimeType.Flexible,
    preferredDate: londonToday(),
    preferredTime: '09:00',
    budgetMajor: '',
    budgetCurrency: Currency.Gbp,
    budgetType: TaskBudgetType.OneOff,
    paymentMethod: TaskPaymentMethod.Cash,
    preferredContactMethod: contact,
    acceptedProhibitedUse: false,
  }
}

export type CreateTaskScreenProps = {
  userId: string
  /**
   * The page shows the email check (`create.verifyEmail`) before this screen,
   * so this is true there; Post task still checks it as a guard.
   */
  emailVerified: boolean
  preferredContactDefault: TaskContactMethod
  contactOptions: ContactOption[]
}

/**
 * /tasks/create (FE-295). Pick the spot on the full-screen map, then the
 * exact address (FE-352) under the map band, then details, timing, photos
 * (optional, FE-355) and budget, then review what workers will see and
 * post. From the details step on, phones give the form the whole screen.
 * What each step shows comes from its named view (views/README.md). Answers
 * are kept as a draft on this browser until the task is posted.
 */
export function CreateTaskScreen({
  userId,
  emailVerified,
  preferredContactDefault,
  contactOptions,
}: CreateTaskScreenProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const apollo = useApolloClient()
  const reducedMotion = useReducedMotion() ?? false
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const draftKey = createTaskDraftKey(userId)

  const [startCentre] = useState(readStartCentre)
  const [repostTaskId] = useState(readRepostTaskId)
  // An explicit start (repost, a /search centre) wins over an old draft.
  const [draft] = useState(() => {
    const storage = draftStorage()
    if (!storage || repostTaskId || startCentre.source === 'search') return null
    return readCreateTaskDraft(storage, draftKey)
  })
  const [defaults] = useState(() =>
    defaultValues(startCentre, preferredContactDefault),
  )

  const form = useForm<CreateTaskFormFieldValues>({
    resolver: zodResolver(createTaskFormSchema),
    mode: 'onTouched',
    defaultValues: draft ? { ...defaults, ...draft.values } : defaults,
  })
  const { register, setValue, watch, getValues, trigger, handleSubmit } = form
  const errors = form.formState.errors
  const values = watch()

  const [step, setStep] = useState<CreateTaskStepId>(draft?.step ?? 'location')
  const [done, setDone] = useState<Set<CreateTaskStepId>>(
    () => new Set(draft?.done ?? []),
  )
  const [draftNotice, setDraftNotice] = useState(Boolean(draft))
  const [serverError, setServerError] = useState<string | null>(null)
  const [advancing, setAdvancing] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [photoProgress, setPhotoProgress] =
    useState<PhotoUploadProgress | null>(null)
  const headingRef = useRef<HTMLDivElement>(null)
  // One publish at a time, and none after a success (FE-213).
  const publishLockRef = useRef(false)
  const postedRef = useRef(false)

  const photos = useTaskPhotos()
  const location = useCreateTaskLocation({
    form,
    accessToken,
    startCentre,
    skipGeolocation:
      Boolean(repostTaskId) || Boolean(draft?.values.locationLat),
    initialPinChosen: Boolean(draft?.values.locationLat),
  })
  const publicArea = usePublicTaskArea(
    values.locationLat,
    values.locationLng,
    accessToken,
  )
  const area = townOnly(publicArea) ?? ''
  // The band chip falls back to the search label's town while the lookup runs.
  const bandArea = area || townOnly(values.mapPlaceName) || ''

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CreateTask)

  // Repost: copy the earlier task's details once (not its timing, which has
  // likely passed, or its photos, whose URLs can expire).
  const { data: repostData } = useQuery<TaskForEditQuery>(TaskForEdit, {
    variables: { id: repostTaskId ?? '' },
    skip: !repostTaskId,
  })
  const repostAppliedRef = useRef(false)
  useEffect(() => {
    const source = repostData?.task
    if (!source || repostAppliedRef.current) return
    repostAppliedRef.current = true
    const copied = taskToEditFormValues(source)
    if (copied.locationLat && copied.locationLng) {
      location.pinChosenRef.current = true
    }
    form.reset({
      ...getValues(),
      title: copied.title,
      categories: copied.categories,
      description: copied.description,
      streetAddress: copied.streetAddress,
      mapPlaceName: copied.mapPlaceName,
      locationLat: copied.locationLat,
      locationLng: copied.locationLng,
      budgetMajor: copied.budgetMajor,
      budgetCurrency: copied.budgetCurrency,
      budgetType: copied.budgetType,
      paymentMethod: copied.paymentMethod,
    })
  }, [form, getValues, location.pinChosenRef, repostData])

  // Keep the draft: at every step change, and a moment after each answer.
  const stepRef = useRef(step)
  const doneRef = useRef(done)
  stepRef.current = step
  doneRef.current = done
  useEffect(() => {
    const storage = draftStorage()
    if (!storage || postedRef.current) return
    saveCreateTaskDraft(storage, draftKey, {
      step,
      done: [...done],
      values: getValues(),
    })
  }, [draftKey, getValues, step, done])
  useEffect(() => {
    const storage = draftStorage()
    if (!storage) return
    let timer: number | undefined
    const subscription = watch(() => {
      window.clearTimeout(timer)
      timer = window.setTimeout(() => {
        if (postedRef.current) return
        saveCreateTaskDraft(storage, draftKey, {
          step: stepRef.current,
          done: [...doneRef.current],
          values: getValues(),
        })
      }, 400)
    })
    return () => {
      subscription.unsubscribe()
      window.clearTimeout(timer)
    }
  }, [draftKey, getValues, watch])

  // Move focus to the new step's title once it has stopped moving: after the
  // map resizes between full screen and the band, or after the phone form
  // slides over or off the band (FE-355). Sooner, focus would scroll the
  // page to where the title still is on its way in.
  const prevStepRef = useRef(step)
  useEffect(() => {
    const prev = prevStepRef.current
    if (prev === step) return
    prevStepRef.current = step
    const from = createTaskStep(prev).map
    const to = createTaskStep(step).map
    const wait =
      reducedMotion || from === to
        ? 0
        : from === 'full' || to === 'full'
          ? MARKETPLACE_MAP_MOTION_MS
          : CREATE_TASK_SHEET_MS
    const timer = window.setTimeout(() => headingRef.current?.focus(), wait)
    return () => window.clearTimeout(timer)
  }, [step, reducedMotion])

  const view = CREATE_TASK_VIEWS[
    getCreateTaskView({ session: 'ready', step })
  ] as CreateTaskStepView
  // A HEIC photo is still converting: its step and Post wait (FE-341).
  const waitingForPhotos =
    photos.converting &&
    (view.primary === 'post' || view.sections.includes('photos'))

  const go = (next: CreateTaskStepId) => {
    setServerError(null)
    setDraftNotice(false)
    setStep(next)
  }
  const goToStep = (id: CreateTaskStepId) => {
    if (createTaskIsStepUnlocked(id, step, done)) go(id)
  }
  const goBack = () => {
    const prev = createTaskPreviousStep(step)
    if (prev) go(prev)
  }

  const startOver = () => {
    const storage = draftStorage()
    if (storage) clearCreateTaskDraft(storage, draftKey)
    location.pinChosenRef.current = startCentre.source !== 'default'
    form.reset(defaults)
    setDone(new Set())
    setDraftNotice(false)
    setServerError(null)
    setStep('location')
  }

  async function continueStep() {
    if (waitingForPhotos) return
    if (view.primary === 'post') {
      await publishOnce(publishLockRef, publish)
      return
    }
    setServerError(null)
    setAdvancing(true)
    try {
      if (step === 'location' && !(await location.applyResolvedLocation())) {
        return
      }
      if (!(await trigger([...view.fields], { shouldFocus: true }))) return
      setDone((prev) => new Set(prev).add(step))
      const next = createTaskNextStep(step)
      if (next) go(next)
    } finally {
      setAdvancing(false)
    }
  }

  /** Review step: check everything, then create. True once the task exists. */
  async function publish(): Promise<boolean> {
    setServerError(null)
    setPhotoProgress(null)
    setPublishing(true)
    let created = false
    try {
      if (!(await trigger([...view.fields], { shouldFocus: true }))) {
        return false
      }
      await handleSubmit(
        async (raw) => {
          created = await submit(raw as CreateTaskFormValues)
        },
        (formErrors) => {
          setServerError(t.missingDetails)
          const first = createTaskFirstErroredStep(Object.keys(formErrors))
          if (first) setStep(first)
        },
      )()
      return created
    } finally {
      // Stay "Posting…" after a success until the task page replaces this one.
      if (!created) setPublishing(false)
    }
  }

  async function submit(submitted: CreateTaskFormValues): Promise<boolean> {
    if (!getAuthToken()) {
      capture(EVENTS.login_gate, {
        route: POST_TASK_PATH,
        gate_reason: 'post_task',
      })
      router.replace(
        localize(`/login?next=${encodeURIComponent(POST_TASK_PATH)}`),
      )
      return false
    }
    if (!emailVerified) {
      setServerError(t.errors.verifyEmail)
      return false
    }
    const phoneUsable = contactOptions.some(
      (option) => option.value === TaskContactMethod.Phone && option.enabled,
    )
    if (
      submitted.preferredContactMethod === TaskContactMethod.Phone &&
      !phoneUsable
    ) {
      setServerError(t.errors.verifyPhone)
      return false
    }
    if (!(await location.applyResolvedLocation())) {
      setStep('location')
      return false
    }
    const located = getValues()
    const lat = Number.parseFloat(located.locationLat)
    const lng = Number.parseFloat(located.locationLng)

    try {
      const res = await runCreateTask({
        variables: {
          input: {
            title: submitted.title.trim(),
            description: submitted.description.trim(),
            categories: submitted.categories,
            budget: {
              amount: Number.parseFloat(located.budgetMajor),
              currency: submitted.budgetCurrency,
              type: submitted.budgetType,
              paymentMethod: submitted.paymentMethod,
            },
            location: {
              lat,
              lng,
              // Town at the pin, never the map's street label (FE-70).
              name: await resolvePublicAreaName({
                lat,
                lng,
                fallbackLabel: located.mapPlaceName,
                accessToken,
              }),
              address: located.streetAddress.trim(),
            },
            datetime: buildDatetimePayload(submitted),
            preferredContactMethod: submitted.preferredContactMethod,
            images: [],
          },
        },
      })
      const taskId = res.data?.createTask?.id
      if (!taskId) throw new Error('createTask returned no task')

      // The task exists: never offer Post again, and forget the draft.
      postedRef.current = true
      const storage = draftStorage()
      if (storage) clearCreateTaskDraft(storage, draftKey)

      const { failed } = await uploadTaskImagesSettled(
        apollo,
        { id: taskId, status: res.data?.createTask?.status },
        photos.files,
        { onProgress: setPhotoProgress },
      )
      if (failed > 0) {
        showAppToast({
          title:
            failed === 1
              ? t.errors.photoFailed
              : formatMessage(t.errors.photosFailed, { count: failed }),
          description: t.errors.photosFailedBody,
          type: 'warning',
        })
      }
      trackFlowSucceeded(EVENTS.task_create_success, {
        task_id: taskId,
        photos: photos.files.length,
        photos_failed: failed,
      })
      router.replace(localize(`/tasks/${taskId}`))
      return true
    } catch (err: unknown) {
      trackFlowFailed(EVENTS.task_create_fail, err, {
        flow: 'task_create',
        action: 'createTask',
        operation: 'CreateTask',
        route: POST_TASK_PATH,
      })
      setServerError(taskServerError(t.serverErrors, err, t.errors.postFailed))
      return false
    }
  }

  const section = (id: CreateTaskSection) => {
    switch (id) {
      case 'location':
        return (
          <CreateTaskLocationSection
            publicArea={area}
            locationError={
              errors.mapPlaceName?.message ??
              errors.locationLat?.message ??
              errors.locationLng?.message
            }
            locateUnavailable={location.locateUnavailable}
          />
        )
      case 'address':
        return (
          <CreateTaskAddressSection
            register={register}
            streetAddressError={errors.streetAddress?.message}
            pinAddress={values.mapPlaceName}
            onUsePinAddress={location.onUsePinAddress}
          />
        )
      case 'basics':
        return (
          <CreateTaskBasicsSection
            bare
            register={register}
            categories={values.categories}
            onCategoriesChange={(next) => setValue('categories', next, UPDATE)}
            fieldErrors={{
              title: errors.title?.message,
              categories: errors.categories?.message,
              description: errors.description?.message,
            }}
          />
        )
      case 'photos':
        // The step's heading and description already say what photos are for.
        return (
          <CreateTaskVisualsSection
            bare
            labelled={false}
            helper={false}
            photos={photos.tiles}
            rejected={photos.rejected}
            onFilesAdded={photos.add}
            onRemoveFile={photos.remove}
          />
        )
      case 'timing':
        return (
          <CreateTaskScheduleSection
            bare
            datetimeType={values.datetimeType}
            onDatetimeTypeChange={(v) => setValue('datetimeType', v, UPDATE)}
            preferredDate={values.preferredDate}
            preferredTime={values.preferredTime}
            onPreferredDateChange={(v) => setValue('preferredDate', v, UPDATE)}
            onPreferredTimeChange={(v) => setValue('preferredTime', v, UPDATE)}
            fieldErrors={{
              preferredDate: errors.preferredDate?.message,
              preferredTime: errors.preferredTime?.message,
            }}
          />
        )
      case 'budget':
        return (
          <CreateTaskBudgetSection
            bare
            register={register}
            budgetCurrency={values.budgetCurrency}
            budgetType={values.budgetType}
            paymentMethod={values.paymentMethod}
            onBudgetTypeChange={(v) => setValue('budgetType', v, UPDATE)}
            onPaymentMethodChange={(v) => setValue('paymentMethod', v, UPDATE)}
            budgetMajorError={errors.budgetMajor?.message}
          />
        )
      case 'summary':
        return (
          <CreateTaskSummarySection
            summary={{
              title: values.title,
              description: values.description,
              categories: values.categories,
              area,
              streetAddress: values.streetAddress,
              datetimeType: values.datetimeType,
              preferredDate: values.preferredDate,
              preferredTime: values.preferredTime,
              budgetMajor: values.budgetMajor,
              budgetCurrency: values.budgetCurrency,
              budgetType: values.budgetType,
              paymentMethod: values.paymentMethod,
              photoCount: photos.files.length,
            }}
            onEdit={goToStep}
          />
        )
      case 'contact':
        return (
          <CreateTaskContactSection
            bare
            preferredContactMethod={values.preferredContactMethod}
            contactOptions={contactOptions}
            onPreferredContactMethodChange={(v) =>
              setValue('preferredContactMethod', v, UPDATE)
            }
          />
        )
      case 'consent':
        return (
          <CreateTaskConsentSection
            accepted={values.acceptedProhibitedUse}
            onChange={(v) => setValue('acceptedProhibitedUse', v, UPDATE)}
            errorText={errors.acceptedProhibitedUse?.message}
          />
        )
    }
  }

  const progress = createTaskProgress(step)
  const copy = t.steps[step]
  const posting = view.primary === 'post'
  const postBusy = posting && (publishing || creating)

  return (
    <CreateTaskMapLayout
      banner={<AppStatusBanners />}
      header={
        <StepFlowHeader
          title={t.eyebrow}
          exitHref={APP_HOME}
          closeLabel={t.closeLabel}
        />
      }
      progress={
        <StepFlowProgress
          value={progress.percent}
          label={formatMessage(t.progress, {
            step: progress.index,
            total: progress.total,
            label: copy.label,
          })}
          trackLabel={t.progressTrack}
        />
      }
      stepper={
        <CreateTaskStepper active={step} done={done} onSelect={goToStep} />
      }
      map={
        <CreateTaskLocationMap
          accessToken={accessToken}
          location={values.mapPlaceName}
          locationLat={values.locationLat}
          locationLng={values.locationLng}
          onLocationChange={location.onMapPlaceNameChange}
          onLocationLatChange={location.onLocationLatChange}
          onLocationLngChange={location.onLocationLngChange}
          collapsed={view.map !== 'full'}
          onLocateFailed={location.onLocateFailed}
        />
      }
      mapMode={view.map}
      bandOverlay={
        <HStack
          gap={1}
          pl={3}
          bg="bg.surface"
          borderRadius="full"
          borderWidth="1px"
          borderColor="border.default"
          boxShadow="e2"
          maxW="full"
        >
          <LuMapPin size={14} aria-hidden />
          <Text fontSize="sm" fontWeight={500} lineClamp={1}>
            {bandArea
              ? formatMessage(t.band.near, { area: bandArea })
              : t.location.areaPending}
          </Text>
          <Button
            type="button"
            variant="ghost"
            minH="44px"
            borderRadius="full"
            color="text.link"
            aria-label={t.band.changeLabel}
            onClick={() => goToStep('location')}
          >
            {t.band.change}
          </Button>
        </HStack>
      }
      headingRef={headingRef}
      title={copy.title}
      description={copy.description}
      errorText={serverError}
      actions={{
        showBack: step !== 'location',
        backLabel: t.back,
        continueLabel: posting ? t.post : t.continue,
        continueLoading: advancing || postBusy || waitingForPhotos,
        // Post says what it's doing: the task, then each photo (FE-341).
        continueLoadingText: postBusy
          ? photoProgressLabel(
              photoProgress,
              t.photoProgress,
              t.photoProgress.posting,
            )
          : waitingForPhotos
            ? t.photoProgress.converting
            : undefined,
        isFinal: posting,
        onBack: goBack,
        onContinue: () => void continueStep(),
      }}
    >
      {draftNotice ? (
        <HStack
          justify="space-between"
          gap={3}
          pl={4}
          pr={1}
          borderRadius="lg"
          bg="status.info.soft"
        >
          <Text fontSize="sm" color="text.default">
            {t.draft.restored}
          </Text>
          <Button
            type="button"
            variant="ghost"
            minH="44px"
            color="text.link"
            onClick={startOver}
          >
            {t.draft.startOver}
          </Button>
        </HStack>
      ) : null}
      {view.sections.map((id) => (
        <Fragment key={id}>{section(id)}</Fragment>
      ))}
    </CreateTaskMapLayout>
  )
}
