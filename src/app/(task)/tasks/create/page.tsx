'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { Box, Text } from '@chakra-ui/react'
import {
  type CreateTaskMutation,
  Currency,
  type MeQuery,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import { EmailVerificationBanner } from '@/app/(auth)/components/EmailVerificationBanner'
import { isEmailVerified } from '@/app/(auth)/helpers/emailVerification'
import { isPhoneVerified } from '@/app/(auth)/helpers/phoneVerification'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import CreateTask from '@/app/(task)/tasks/create/graphql/CreateTask.gql'
import Me from '@/graphql/Me.gql'
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
import { uploadTaskImagesWithPresign } from '@/utils/taskImageUpload'
import { StepFlowLayout, StepFlowProgress } from '@ui'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskMapLocationPanel,
  CreateTaskScheduleSection,
  CreateTaskVisualsSection,
} from './components'
import { CreateTaskStepper } from './components/CreateTaskStepper'
import {
  type CreateTaskFormFieldValues,
  type CreateTaskFormValues,
  buildDatetimePayload,
  createTaskFormSchema,
  toYmd,
} from './createTaskFormSchema'
import {
  CREATE_TASK_FINAL_SUB_STEP,
  CREATE_TASK_FIRST_SUB_STEP,
  CREATE_TASK_STEP_COPY,
  CREATE_TASK_STEP_FIELDS,
  type CreateTaskSubStepId,
  createTaskIsSubStepUnlocked,
  createTaskNextSubStep,
  createTaskPreviousSubStep,
  createTaskProgressPercent,
  createTaskStepCaption,
} from './helpers/createTaskSteps.config'

const POST_TASK_PATH = '/tasks/create'

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
  const router = useRouter()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const imagePreviewUrlsUnmountRef = useRef<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

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
    watch,
    getValues,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormFieldValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: '',
      category: '',
      description: '',
      streetAddress: '',
      mapPlaceName: '',
      locationLat: '51.5074',
      locationLng: '-0.1278',
      datetimeType: TaskDateTimeType.Flexible,
      preferredDate: toYmd(new Date()),
      preferredTime: '09:00',
      budgetMajor: '',
      budgetCurrency: Currency.Gbp,
      budgetType: TaskBudgetType.OneOff,
      paymentMethod: TaskPaymentMethod.Cash,
      preferredContactMethod: preferredContactDefault,
    },
  })

  const mapPlaceName = watch('mapPlaceName')
  const locationLat = watch('locationLat')
  const locationLng = watch('locationLng')
  const preferredDate = watch('preferredDate')
  const preferredTime = watch('preferredTime')
  const datetimeType = watch('datetimeType')
  const budgetCurrency = watch('budgetCurrency')
  const budgetType = watch('budgetType')
  const paymentMethod = watch('paymentMethod')
  const preferredContactMethod = watch('preferredContactMethod')

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CreateTask)

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

  const onCopyMapPlaceToAddress = useCallback(() => {
    const name = getValues('mapPlaceName').trim()
    if (!name) return
    setValue('streetAddress', name, {
      shouldValidate: true,
      shouldDirty: true,
    })
  }, [getValues, setValue])

  const locationError =
    errors.mapPlaceName?.message ??
    errors.locationLat?.message ??
    errors.locationLng?.message

  async function onSubmit(values: CreateTaskFormValues) {
    setServerError(null)
    if (!getAuthToken()) {
      capture(EVENTS.login_gate, {
        route: POST_TASK_PATH,
        gate_reason: 'post_task',
      })
      router.replace(`/login?redirect=${encodeURIComponent(POST_TASK_PATH)}`)
      return
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
      return
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
      return
    }

    const parsedBudget = Number.parseFloat(values.budgetMajor)
    const datetime = buildDatetimePayload(values)

    try {
      const res = await runCreateTask({
        variables: {
          input: {
            title: values.title.trim(),
            description: values.description.trim(),
            category: values.category,
            budget: {
              amount: parsedBudget,
              currency: values.budgetCurrency,
              type: values.budgetType,
              paymentMethod: values.paymentMethod,
            },
            location: {
              lat: Number.parseFloat(values.locationLat),
              lng: Number.parseFloat(values.locationLng),
              name: values.mapPlaceName.trim(),
              address: values.streetAddress.trim(),
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
        await uploadTaskImagesWithPresign(apollo, createdTaskId, imageFiles)
      }

      trackFlowSucceeded(EVENTS.task_create_success, {
        task_id: createdTaskId,
      })
      router.push(`/tasks/${createdTaskId}`)
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
    for (const [stepId, fields] of Object.entries(CREATE_TASK_STEP_FIELDS)) {
      if (fields.some((field) => erroredFields.includes(field))) {
        setActiveSubStep(stepId as CreateTaskSubStepId)
        return
      }
    }
  }, [])

  // Plain function (not useCallback): it closes over the per-render onSubmit,
  // and the layout's `actions` object is rebuilt every render anyway.
  async function continueStep() {
    setServerError(null)
    const isFinal = activeSubStep === CREATE_TASK_FINAL_SUB_STEP

    const fields = CREATE_TASK_STEP_FIELDS[activeSubStep]
    if (fields.length > 0) {
      const valid = await trigger(fields)
      if (!valid) return
    }

    if (isFinal) {
      await handleSubmit(
        (raw) => onSubmit(raw as CreateTaskFormValues),
        (formErrors) => {
          setServerError('Some details are missing — check earlier steps.')
          jumpToFirstErroredStep(Object.keys(formErrors))
        },
      )()
      return
    }

    setCompletedSubSteps((prev) => {
      const next = new Set(prev)
      next.add(activeSubStep)
      return next
    })
    const next = createTaskNextSubStep(activeSubStep)
    if (next) setActiveSubStep(next)
  }

  const copy = CREATE_TASK_STEP_COPY[activeSubStep]
  const isFirstStep = activeSubStep === CREATE_TASK_FIRST_SUB_STEP
  const isFinalStep = activeSubStep === CREATE_TASK_FINAL_SUB_STEP

  const stepContent = (() => {
    switch (activeSubStep) {
      case 'details.basics':
        return (
          <CreateTaskBasicsSection
            bare
            register={register}
            fieldErrors={{
              title: errors.title?.message,
              category: errors.category?.message,
              description: errors.description?.message,
            }}
          />
        )
      case 'details.location':
        return (
          <CreateTaskMapLocationPanel
            bare
            mapboxAccessToken={mapboxAccessToken}
            mapPlaceName={mapPlaceName}
            locationLat={locationLat}
            locationLng={locationLng}
            register={register}
            streetAddressError={errors.streetAddress?.message}
            onCopyMapPlaceToAddress={onCopyMapPlaceToAddress}
            locationError={locationError}
            onLocationChange={onMapPlaceNameChange}
            onLocationLatChange={onLocationLatChange}
            onLocationLngChange={onLocationLngChange}
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
          />
        )
    }
  })()

  return (
    <StepFlowLayout
      banner={<EmailVerificationBanner />}
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
      title={copy.title}
      description={copy.description}
      errorText={serverError}
      actions={{
        showBack: !isFirstStep,
        continueLabel: isFinalStep ? 'Publish task' : 'Continue',
        continueLoading: isFinalStep && (creating || isSubmitting),
        isFinal: isFinalStep,
        onBack: goBack,
        onContinue: () => void continueStep(),
      }}
    >
      {stepContent}
    </StepFlowLayout>
  )
}

export default function CreateTaskPage() {
  const router = useRouter()
  const [sessionOk, setSessionOk] = useState(false)

  const sessionGateRef = useRef(false)
  if (!sessionGateRef.current) {
    sessionGateRef.current = true
    if (!getAuthToken()) {
      router.replace(`/login?redirect=${encodeURIComponent(POST_TASK_PATH)}`)
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

  if (!sessionOk) {
    return (
      <Box
        bg="bg.subtle"
        color="text.default"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="text.muted" fontSize="sm">
          Checking your session…
        </Text>
      </Box>
    )
  }

  if (!mePrimedForForm) {
    return (
      <Box
        bg="bg.subtle"
        color="text.default"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="text.muted" fontSize="sm">
          Loading your profile…
        </Text>
      </Box>
    )
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
