'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import {
  type CreateTaskMutation,
  Currency,
  type MeQuery,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  type TaskForEditQuery,
  TaskPaymentMethod,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useReducedMotion } from 'motion/react'
import { useRouter } from 'next/navigation'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useForm } from 'react-hook-form'

import { AppStatusBanners } from '@/app/(auth)/components/ui/AppStatusBanners'
import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import CreateTask from '@/app/(stepflow)/tasks/create/graphql/CreateTask.gql'
import { MARKETPLACE_MAP_MOTION_MS } from '@/app/(task)/helpers/marketplaceMap/motion'
import { taskToEditFormValues } from '@/app/(task)/helpers/taskEditHelpers'
import TaskForEdit from '@/app/(task)/tasks/[slug]/graphql/TaskForEdit.gql'
import Me from '@/graphql/Me.gql'
import { stripLocalePrefix } from '@/i18n/navigation'
import { useI11n } from '@/i18n/useI11n'
import {
  EVENTS,
  capture,
  trackFlowFailed,
  trackFlowSucceeded,
} from '@/utils/analytics'
import { showAppToast } from '@/utils/appToast'
import { getAuthToken } from '@/utils/auth'
import {
  getGraphQLErrorCode,
  getTaskMutationErrorMessage,
} from '@/utils/graphqlErrors'
import { mapboxReverseGeocode } from '@/utils/mapboxGeocode'
import { TASK_DRAFT_TITLE_MAX } from '@/utils/taskHandoff'
import { uploadTaskImagesWithPresign } from '@/utils/taskImageUpload'
import { townOnly } from '@/utils/taskLocationDisplay'
import { StepFlowProgress } from '@ui'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskHeader,
  CreateTaskLocationMap,
  CreateTaskLocationSection,
  CreateTaskMapLayout,
  CreateTaskScheduleSection,
  CreateTaskStepper,
  CreateTaskVisualsSection,
} from './components'
import {
  type CreateTaskFormFieldValues,
  type CreateTaskFormValues,
  buildDatetimePayload,
  createTaskFormSchema,
  toYmd,
} from './createTaskFormSchema'
import {
  type CreateTaskLatLng,
  type CreateTaskStartCentre,
  resolveCreateTaskStartCentre,
} from './helpers/createTaskStartCentre'
import {
  CREATE_TASK_FINAL_SUB_STEP,
  CREATE_TASK_FIRST_SUB_STEP,
  CREATE_TASK_STEP_COPY,
  CREATE_TASK_STEP_FIELDS,
  type CreateTaskSubStepId,
  createTaskFirstErroredSubStep,
  createTaskIsSubStepUnlocked,
  createTaskNextSubStep,
  createTaskPreviousSubStep,
  createTaskProgressPercent,
  createTaskStepCaption,
} from './helpers/createTaskSteps.config'
import {
  resolvePublicAreaName,
  usePublicTaskArea,
} from './helpers/publicTaskArea'
import { publishOnce } from './helpers/publishOnce'
import { resolveSubmittedTaskLocation } from './helpers/resolveTaskLocation'
import bag from './i11n.json'

const POST_TASK_PATH = '/tasks/create'

function readDraftTitleFromUrl(): string {
  if (typeof window === 'undefined') return ''
  const raw = new URLSearchParams(window.location.search).get('title')
  return raw?.trim().slice(0, TASK_DRAFT_TITLE_MAX) ?? ''
}

/** `?repost=<taskId>`: prefill from one of the poster's earlier tasks. */
function readRepostTaskIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null
  return (
    new URLSearchParams(window.location.search).get('repost')?.trim() || null
  )
}

function readStartCentreFromUrl(): CreateTaskStartCentre {
  return resolveCreateTaskStartCentre({
    search: typeof window === 'undefined' ? '' : window.location.search,
  })
}

/** Browser location, or null when denied, unavailable, or too slow. */
function currentPosition(
  highAccuracy: boolean,
): Promise<CreateTaskLatLng | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () => resolve(null),
      { enableHighAccuracy: highAccuracy, timeout: 12_000, maximumAge: 60_000 },
    )
  })
}

function currentCreateTaskReturnPath(): string {
  if (typeof window === 'undefined') return POST_TASK_PATH
  const bare = stripLocalePrefix(window.location.pathname)
  const path = bare && bare !== '/' ? bare : POST_TASK_PATH
  return `${path}${window.location.search}`
}

type CreateTaskFormBodyProps = {
  preferredContactDefault: TaskContactMethod
  emailVerified: boolean
  phoneVerified: boolean
  contactOptions: ReturnType<typeof getContactOptions>
}

function CreateTaskFormBody({
  preferredContactDefault,
  emailVerified,
  phoneVerified,
  contactOptions,
}: CreateTaskFormBodyProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const imagePreviewUrlsUnmountRef = useRef<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [startCentre] = useState(readStartCentreFromUrl)
  /**
   * True after a search, a pin drag, or a `/search` / current-location
   * start. The London camera is not a choice.
   */
  const pinChosenRef = useRef(startCentre.source !== 'default')
  const [repostTaskId] = useState(readRepostTaskIdFromUrl)
  const [locating, setLocating] = useState(false)
  const [locateUnavailable, setLocateUnavailable] = useState(false)
  const headingRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion() ?? false

  const [activeSubStep, setActiveSubStep] = useState<CreateTaskSubStepId>(
    CREATE_TASK_FIRST_SUB_STEP,
  )
  const [completedSubSteps, setCompletedSubSteps] = useState<
    Set<CreateTaskSubStepId>
  >(() => new Set())

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    watch,
    getValues,
    reset,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormFieldValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: readDraftTitleFromUrl(),
      categories: [],
      description: '',
      streetAddress: '',
      mapPlaceName: '',
      locationLat:
        startCentre.source === 'default' ? '' : startCentre.lat.toFixed(6),
      locationLng:
        startCentre.source === 'default' ? '' : startCentre.lng.toFixed(6),
      datetimeType: TaskDateTimeType.Flexible,
      preferredDate: toYmd(new Date()),
      preferredTime: '09:00',
      budgetMajor: '',
      budgetCurrency: Currency.Gbp,
      budgetType: TaskBudgetType.OneOff,
      paymentMethod: TaskPaymentMethod.Cash,
      preferredContactMethod: preferredContactDefault,
      acceptedProhibitedUse: false,
    },
  })

  const categories = watch('categories')
  const mapPlaceName = watch('mapPlaceName')
  const locationLat = watch('locationLat')
  const locationLng = watch('locationLng')
  const publicArea = usePublicTaskArea(
    locationLat,
    locationLng,
    mapboxAccessToken,
  )
  const preferredDate = watch('preferredDate')
  const preferredTime = watch('preferredTime')
  const datetimeType = watch('datetimeType')
  const budgetCurrency = watch('budgetCurrency')
  const budgetType = watch('budgetType')
  const paymentMethod = watch('paymentMethod')
  const preferredContactMethod = watch('preferredContactMethod')
  const acceptedProhibitedUse = watch('acceptedProhibitedUse')

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CreateTask)
  // One publish at a time, and none after a success (FE-213): the button
  // used to come back while the new task page loaded, and a second tap
  // created the task twice.
  const publishLockRef = useRef(false)
  const [publishing, setPublishing] = useState(false)

  useLayoutEffect(() => {
    const next = imageFiles.map((file) => URL.createObjectURL(file))
    imagePreviewUrlsUnmountRef.current = next
    setImagePreviewUrls((prev) => {
      for (const u of prev) {
        URL.revokeObjectURL(u)
      }
      return next
    })
    return () => {
      for (const u of imagePreviewUrlsUnmountRef.current) {
        URL.revokeObjectURL(u)
      }
    }
  }, [imageFiles])

  const onFilesAdded = useCallback((picked: File[]) => {
    if (picked.length === 0) return
    setImageFiles((prev) => [...prev, ...picked])
  }, [])

  const onRemoveFile = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const onMapPlaceNameChange = useCallback(
    (v: string) => {
      setValue('mapPlaceName', v, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  const onLocationLatChange = useCallback(
    (v: string) => {
      pinChosenRef.current = true
      setLocateUnavailable(false)
      setValue('locationLat', v, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  const onLocationLngChange = useCallback(
    (v: string) => {
      setValue('locationLng', v, {
        shouldValidate: true,
        shouldDirty: true,
      })
    },
    [setValue],
  )

  /**
   * Exact address from the pin (FE-209): the pin's reverse-geocoded street
   * address, copied only on tap so a later pin move never overwrites edits.
   */
  const onUsePinAddress = useCallback(() => {
    const name = getValues('mapPlaceName').trim()
    if (!name) return
    setValue('streetAddress', name, { shouldValidate: true, shouldDirty: true })
  }, [getValues, setValue])

  /** Reverse geocode a label. Keeps one the poster already has unless `replace`. */
  const labelPin = useCallback(
    (lat: number, lng: number, replace: boolean) => {
      const token = mapboxAccessToken?.trim()
      if (!token) return
      void mapboxReverseGeocode(lat, lng, token).then((name) => {
        if (!name) return
        if (!replace && getValues('mapPlaceName').trim()) return
        setValue('mapPlaceName', name, {
          shouldValidate: true,
          shouldDirty: true,
        })
      })
    },
    [getValues, mapboxAccessToken, setValue],
  )

  const placePin = useCallback(
    (lat: number, lng: number, replaceLabel: boolean) => {
      pinChosenRef.current = true
      setLocateUnavailable(false)
      setValue('locationLat', lat.toFixed(6), {
        shouldValidate: true,
        shouldDirty: true,
      })
      setValue('locationLng', lng.toFixed(6), {
        shouldValidate: true,
        shouldDirty: true,
      })
      labelPin(lat, lng, replaceLabel)
    },
    [labelPin, setValue],
  )

  // Start centre: a `/search` centre is already the pin (it only needs a
  // label). Otherwise London shows at once and current location replaces it
  // when it arrives, unless the poster has already dragged, searched, or typed.
  useEffect(() => {
    if (startCentre.source !== 'default') {
      labelPin(startCentre.lat, startCentre.lng, false)
      return
    }
    // A repost starts from its old task location, so don't ask for location.
    if (repostTaskId) return
    let cancelled = false
    void currentPosition(false).then((geolocated) => {
      if (cancelled) return
      const touched =
        pinChosenRef.current || Boolean(getValues('mapPlaceName').trim())
      if (!geolocated) {
        if (!touched) setLocateUnavailable(true)
        return
      }
      if (touched) return
      const start = resolveCreateTaskStartCentre({ search: '', geolocated })
      if (start.source === 'geolocation') placePin(start.lat, start.lng, false)
    })
    return () => {
      cancelled = true
    }
  }, [getValues, labelPin, placePin, repostTaskId, startCentre])

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
    const values = taskToEditFormValues(source)
    if (values.locationLat && values.locationLng) pinChosenRef.current = true
    reset({
      ...getValues(),
      title: values.title,
      categories: values.categories,
      description: values.description,
      streetAddress: values.streetAddress,
      mapPlaceName: values.mapPlaceName,
      locationLat: values.locationLat,
      locationLng: values.locationLng,
      budgetMajor: values.budgetMajor,
      budgetCurrency: values.budgetCurrency,
      budgetType: values.budgetType,
      paymentMethod: values.paymentMethod,
    })
  }, [getValues, repostData, reset])

  const onLocate = useCallback(() => {
    setLocating(true)
    void currentPosition(true).then((geolocated) => {
      setLocating(false)
      if (geolocated) placePin(geolocated.lat, geolocated.lng, true)
      else setLocateUnavailable(true)
    })
  }, [placePin])

  const applyResolvedLocation = useCallback(async () => {
    const values = getValues()
    const resolved = await resolveSubmittedTaskLocation({
      streetAddress: values.streetAddress,
      mapPlaceName: values.mapPlaceName,
      locationLat: values.locationLat,
      locationLng: values.locationLng,
      pinChosen: pinChosenRef.current,
      accessToken: mapboxAccessToken,
    })
    if (!resolved.ok) {
      setError('mapPlaceName', { message: resolved.error })
      return false
    }
    clearErrors(['mapPlaceName', 'locationLat', 'locationLng'])
    setValue('locationLat', String(resolved.location.lat), {
      shouldValidate: true,
      shouldDirty: true,
    })
    setValue('locationLng', String(resolved.location.lng), {
      shouldValidate: true,
      shouldDirty: true,
    })
    if (!values.mapPlaceName.trim()) {
      setValue('mapPlaceName', resolved.location.placeName, {
        shouldValidate: true,
        shouldDirty: true,
      })
    }
    pinChosenRef.current = true
    return true
  }, [clearErrors, getValues, mapboxAccessToken, setError, setValue])

  const locationError =
    errors.mapPlaceName?.message ??
    errors.locationLat?.message ??
    errors.locationLng?.message

  /** True once the task exists (the page is navigating to it). */
  async function onSubmit(values: CreateTaskFormValues): Promise<boolean> {
    setServerError(null)
    if (!getAuthToken()) {
      capture(EVENTS.login_gate, {
        route: POST_TASK_PATH,
        gate_reason: 'post_task',
      })
      router.replace(`/login?redirect=${encodeURIComponent(POST_TASK_PATH)}`)
      return false
    }

    if (!emailVerified) {
      const message =
        'Verify your email before posting tasks. Check your inbox or resend from the banner.'
      setServerError(message)
      showAppToast({
        title: 'Email verification required',
        description: message,
        type: 'warning',
      })
      return false
    }

    if (
      values.preferredContactMethod === TaskContactMethod.Phone &&
      !phoneVerified
    ) {
      const message =
        'Verify your phone in Account before choosing phone as your contact method.'
      setServerError(message)
      showAppToast({
        title: 'Phone verification required',
        description: message,
        type: 'warning',
      })
      return false
    }

    const located = await applyResolvedLocation()
    if (!located) {
      setActiveSubStep('details.location')
      return false
    }
    const locatedValues = getValues()

    const parsedBudget = Number.parseFloat(locatedValues.budgetMajor)
    const datetime = buildDatetimePayload(values)

    try {
      const res = await runCreateTask({
        variables: {
          input: {
            title: values.title.trim(),
            description: values.description.trim(),
            categories: values.categories,
            budget: {
              amount: parsedBudget,
              currency: values.budgetCurrency,
              type: values.budgetType,
              paymentMethod: values.paymentMethod,
            },
            location: {
              lat: Number.parseFloat(locatedValues.locationLat),
              lng: Number.parseFloat(locatedValues.locationLng),
              // Town at the pin, never the map's street label (FE-70).
              name: await resolvePublicAreaName({
                lat: Number.parseFloat(locatedValues.locationLat),
                lng: Number.parseFloat(locatedValues.locationLng),
                fallbackLabel: locatedValues.mapPlaceName,
                accessToken: mapboxAccessToken,
              }),
              address: locatedValues.streetAddress.trim(),
            },
            datetime,
            preferredContactMethod: values.preferredContactMethod,
            images: [],
          },
        },
      })

      const createdTaskId = res.data?.createTask?.id
      if (!createdTaskId) throw new Error('Task creation failed.')

      if (imageFiles.length > 0) {
        try {
          await uploadTaskImagesWithPresign(apollo, createdTaskId, imageFiles)
        } catch (uploadErr: unknown) {
          // The task exists: never offer Publish again (it would create a
          // second one). Go to it and say how to add the photos.
          trackFlowFailed(EVENTS.task_create_fail, uploadErr, {
            flow: 'task_create',
            action: 'uploadTaskImages',
            operation: 'CreateTask',
            route: POST_TASK_PATH,
          })
          showAppToast({
            title: 'Task posted, but the photos did not upload',
            description: 'Add them from Edit task on the task page.',
            type: 'warning',
          })
        }
      }

      trackFlowSucceeded(EVENTS.task_create_success, {
        task_id: createdTaskId,
      })
      router.push(`/tasks/${createdTaskId}`)
      return true
    } catch (err: unknown) {
      trackFlowFailed(EVENTS.task_create_fail, err, {
        flow: 'task_create',
        action: 'createTask',
        operation: 'CreateTask',
        route: POST_TASK_PATH,
      })
      const message = getTaskMutationErrorMessage(err, 'Task creation failed.')
      setServerError(message)
      const code = getGraphQLErrorCode(err)
      if (code === 'EMAIL_NOT_VERIFIED' || code === 'PHONE_NOT_VERIFIED') {
        showAppToast({
          title:
            code === 'PHONE_NOT_VERIFIED'
              ? 'Phone verification required'
              : 'Email verification required',
          description: message,
          type: 'warning',
        })
      }
      return false
    }
  }

  const goToSubStep = useCallback(
    (id: CreateTaskSubStepId) => {
      if (!createTaskIsSubStepUnlocked(id, activeSubStep, completedSubSteps)) {
        return
      }
      setServerError(null)
      setActiveSubStep(id)
    },
    [activeSubStep, completedSubSteps],
  )

  const goBack = useCallback(() => {
    const prev = createTaskPreviousSubStep(activeSubStep)
    if (prev) goToSubStep(prev)
  }, [activeSubStep, goToSubStep])

  /** On full-form failure, jump to the first step that owns an errored field. */
  const jumpToFirstErroredStep = useCallback((erroredFields: string[]) => {
    const step = createTaskFirstErroredSubStep(erroredFields)
    if (step) setActiveSubStep(step)
  }, [])

  // Move focus to the new step's title, after the map finishes resizing when
  // the step swaps between the full-screen map and the band.
  const prevSubStepRef = useRef(activeSubStep)
  useEffect(() => {
    const prev = prevSubStepRef.current
    if (prev === activeSubStep) return
    prevSubStepRef.current = activeSubStep
    const mapResized =
      (prev === 'details.location') !== (activeSubStep === 'details.location')
    const timer = window.setTimeout(
      () => headingRef.current?.focus(),
      mapResized && !reducedMotion ? MARKETPLACE_MAP_MOTION_MS : 0,
    )
    return () => window.clearTimeout(timer)
  }, [activeSubStep, reducedMotion])

  // Plain function (not useCallback): it closes over the per-render onSubmit,
  // and the layout's `actions` object is rebuilt every render anyway.
  async function continueStep() {
    const isFinal = activeSubStep === CREATE_TASK_FINAL_SUB_STEP
    if (isFinal) {
      await publishOnce(publishLockRef, publish)
      return
    }
    setServerError(null)

    const fields = CREATE_TASK_STEP_FIELDS[activeSubStep]
    if (activeSubStep === 'details.location') {
      const located = await applyResolvedLocation()
      if (!located) return
    }

    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }

    setCompletedSubSteps((prev) => {
      const next = new Set(prev)
      next.add(activeSubStep)
      return next
    })
    const next = createTaskNextSubStep(activeSubStep)
    if (next) setActiveSubStep(next)
  }

  /** Final step: validate, then create. True once the task exists. */
  async function publish(): Promise<boolean> {
    setServerError(null)
    setPublishing(true)
    let created = false
    try {
      const fields = CREATE_TASK_STEP_FIELDS[CREATE_TASK_FINAL_SUB_STEP]
      if (fields.length > 0 && !(await trigger(fields))) return false
      await handleSubmit(
        async (raw) => {
          created = await onSubmit(raw as CreateTaskFormValues)
        },
        (formErrors) => {
          setServerError(t.missingDetails)
          jumpToFirstErroredStep(Object.keys(formErrors))
        },
      )()
      return created
    } finally {
      // Stay "Publishing…" after a success until the task page replaces this one.
      if (!created) setPublishing(false)
    }
  }

  const copy = CREATE_TASK_STEP_COPY[activeSubStep]
  const isLocationStep = activeSubStep === 'details.location'
  const isFirstStep = activeSubStep === CREATE_TASK_FIRST_SUB_STEP
  const isFinalStep = activeSubStep === CREATE_TASK_FINAL_SUB_STEP

  const stepContent = (() => {
    switch (activeSubStep) {
      case 'details.basics':
        return (
          <CreateTaskBasicsSection
            bare
            register={register}
            categories={categories}
            onCategoriesChange={(next) =>
              setValue('categories', next, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            fieldErrors={{
              title: errors.title?.message,
              categories: errors.categories?.message,
              description: errors.description?.message,
            }}
          />
        )
      case 'details.location':
        return (
          <CreateTaskLocationSection
            publicArea={townOnly(publicArea) ?? ''}
            register={register}
            streetAddressError={errors.streetAddress?.message}
            locationError={locationError}
            locateUnavailable={locateUnavailable}
            onStreetAddressBlur={() => {
              void applyResolvedLocation()
            }}
            pinAddress={mapPlaceName}
            onUsePinAddress={onUsePinAddress}
          />
        )
      case 'details.timing':
        return (
          <CreateTaskScheduleSection
            bare
            datetimeType={datetimeType}
            onDatetimeTypeChange={(v) =>
              setValue('datetimeType', v, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            preferredDate={preferredDate}
            preferredTime={preferredTime}
            onPreferredDateChange={(v) =>
              setValue('preferredDate', v, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onPreferredTimeChange={(v) =>
              setValue('preferredTime', v, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            fieldErrors={{
              preferredDate: errors.preferredDate?.message,
              preferredTime: errors.preferredTime?.message,
            }}
          />
        )
      case 'publish.photos':
        return (
          <CreateTaskVisualsSection
            bare
            files={imageFiles}
            previews={imagePreviewUrls}
            onFilesAdded={onFilesAdded}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'publish.budget':
        return (
          <CreateTaskBudgetSection
            bare
            register={register}
            budgetCurrency={budgetCurrency}
            budgetType={budgetType}
            paymentMethod={paymentMethod}
            onBudgetCurrencyChange={(currency) =>
              setValue('budgetCurrency', currency, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onBudgetTypeChange={(t) =>
              setValue('budgetType', t, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            onPaymentMethodChange={(m) =>
              setValue('paymentMethod', m, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            budgetMajorError={errors.budgetMajor?.message}
          />
        )
      case 'publish.contact':
        return (
          <CreateTaskContactSection
            bare
            preferredContactMethod={preferredContactMethod}
            contactOptions={contactOptions}
            onPreferredContactMethodChange={(m) =>
              setValue('preferredContactMethod', m, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
            acceptedProhibitedUse={acceptedProhibitedUse}
            prohibitedError={errors.acceptedProhibitedUse?.message}
            onAcceptedProhibitedUseChange={(next) =>
              setValue('acceptedProhibitedUse', next, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        )
    }
  })()

  return (
    <CreateTaskMapLayout
      banner={<AppStatusBanners />}
      header={<CreateTaskHeader />}
      progress={
        <StepFlowProgress
          value={createTaskProgressPercent(activeSubStep)}
          label={createTaskStepCaption(activeSubStep)}
          trackLabel="Task creation progress"
        />
      }
      stepper={
        <CreateTaskStepper
          activeSubStep={activeSubStep}
          completedSubSteps={completedSubSteps}
          onSelectSubStep={goToSubStep}
        />
      }
      map={
        <CreateTaskLocationMap
          accessToken={mapboxAccessToken}
          location={mapPlaceName}
          locationLat={locationLat}
          locationLng={locationLng}
          onLocationChange={onMapPlaceNameChange}
          onLocationLatChange={onLocationLatChange}
          onLocationLngChange={onLocationLngChange}
          collapsed={!isLocationStep}
          onLocate={onLocate}
          locating={locating}
        />
      }
      mapExpanded={isLocationStep}
      headingRef={headingRef}
      title={copy.title}
      description={copy.description}
      errorText={serverError}
      actions={{
        showBack: !isFirstStep,
        continueLabel: isFinalStep ? t.publishTask : t.continue,
        continueLoading:
          isFinalStep && (publishing || creating || isSubmitting),
        isFinal: isFinalStep,
        onBack: goBack,
        onContinue: () => void continueStep(),
      }}
    >
      {stepContent}
    </CreateTaskMapLayout>
  )
}

export default function CreateTaskPage() {
  const router = useRouter()
  const [sessionOk, setSessionOk] = useState(false)

  const sessionGateRef = useRef(false)
  if (!sessionGateRef.current) {
    sessionGateRef.current = true
    if (!getAuthToken()) {
      router.replace(
        `/login?redirect=${encodeURIComponent(currentCreateTaskReturnPath())}`,
      )
    } else {
      setSessionOk(true)
    }
  }

  const { loading: meLoading, data: meData } = useQuery<MeQuery>(Me, {
    skip: !sessionOk,
    fetchPolicy: 'cache-first',
  })

  const preferredContactDefault =
    meData?.me?.profile?.defaultPreferredContactMethod ??
    TaskContactMethod.InApp

  const contactOptions = useMemo(
    () => (meData?.me ? getContactOptions(meData.me) : []),
    [meData?.me],
  )

  const mePrimedForForm = Boolean(meData?.me) || !meLoading

  if (!sessionOk || !mePrimedForForm) {
    return <SessionLoading minH="50vh" />
  }

  return (
    <CreateTaskFormBody
      preferredContactDefault={preferredContactDefault}
      emailVerified={isEmailVerified(meData?.me)}
      phoneVerified={isPhoneVerified(meData?.me)}
      contactOptions={contactOptions}
    />
  )
}
