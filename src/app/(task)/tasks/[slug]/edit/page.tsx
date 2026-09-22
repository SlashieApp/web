'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { Box, Container, Grid, Stack, Text } from '@chakra-ui/react'
import {
  type MeQuery,
  type TaskForEditQuery,
  TaskStatus,
  type UpdateTaskMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { type UseFormRegister, useForm } from 'react-hook-form'

import { SessionLoading } from '@/app/(auth)/components/ui/SessionLoading'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'
import MyRequests from '@/app/(dashboard)/requests/graphql/MyRequests.gql'
import Tasks from '@/app/(task)/graphql/Tasks.gql'
import {
  buildUpdateTaskInput,
  countAcceptedQuotes,
  isTaskEditable,
  taskImageUrls,
  taskToEditFormValues,
} from '@/app/(task)/helpers/taskEditHelpers'
import TaskForEdit from '@/app/(task)/tasks/[slug]/graphql/TaskForEdit.gql'
import UpdateTask from '@/app/(task)/tasks/[slug]/graphql/UpdateTask.gql'
import Me from '@/graphql/Me.gql'
import { useLocale, useLocalizedHref } from '@/i18n/LocaleProvider'
import { useI11n } from '@/i18n/useI11n'
import { EVENTS, trackFlowFailed, trackFlowSucceeded } from '@/utils/analytics'
import { getAuthToken } from '@/utils/auth'
import {
  getGraphQLErrorCode,
  getTaskMutationErrorMessage,
  isUnauthenticatedError,
} from '@/utils/graphqlErrors'
import {
  nextTaskImageUploadIndex,
  uploadTaskImagesWithPresign,
} from '@/utils/taskImageUpload'
import { Badge, Button, Footer, Link, StickyHeader } from '@ui'
import { TaskStatusPill } from '../components/ui/TaskStatusPill'
import { taskQueryVariables } from '../helpers/taskQueryVariables'
import { EditTaskHelpCard } from './components/ui/EditTaskHelpCard'
import { EditTaskPreviewCard } from './components/ui/EditTaskPreviewCard'
import { editTaskPreviewLabels } from './helpers/editTaskPreview'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskMapLocationPanel,
  CreateTaskScheduleSection,
  CreateTaskVisualsSection,
} from '@/app/(stepflow)/tasks/create/components'
import type { CreateTaskFormFieldValues } from '@/app/(stepflow)/tasks/create/createTaskFormSchema'
import { EditTaskAcceptedWorkerCapSection } from '../../edit/components/ui/EditTaskAcceptedWorkerCapSection'
import {
  type EditTaskFormFieldValues,
  type EditTaskFormValues,
  editTaskFormSchema,
} from '../../edit/editTaskFormSchema'
import bag from './i11n.json'

const DATE_LOCALE = {
  en: 'en-GB',
  'zh-hk': 'zh-HK',
} as const

/** Rail sits below the compact sticky header (~68px) with a small gap. */
const RAIL_STICKY_TOP = '84px'

type EditTaskFormBodyProps = {
  taskId: string
  task: NonNullable<TaskForEditQuery['task']>
  contactOptions: ReturnType<typeof getContactOptions>
}

function EditTaskFormBody({
  taskId,
  task,
  contactOptions,
}: EditTaskFormBodyProps) {
  const t = useI11n(bag)
  const router = useRouter()
  const localize = useLocalizedHref()
  const locale = useLocale()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  const minAcceptedCap = countAcceptedQuotes(task.quotes)
  const existingImageUrls = useMemo(() => taskImageUrls(task), [task])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const imagePreviewUrlsUnmountRef = useRef<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverErrorCode, setServerErrorCode] = useState<string | null>(null)

  const initialValues = useMemo(() => taskToEditFormValues(task), [task])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EditTaskFormFieldValues>({
    resolver: zodResolver(editTaskFormSchema),
    values: initialValues,
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
  const title = watch('title')
  const description = watch('description')
  const category = watch('category')
  const budgetMajor = watch('budgetMajor')

  const preview = editTaskPreviewLabels(
    {
      mapPlaceName,
      locationLat,
      locationLng,
      datetimeType,
      preferredDate,
      preferredTime,
      category,
      budgetMajor,
      budgetCurrency,
    },
    t.preview,
    DATE_LOCALE[locale],
  )

  const onBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back()
      return
    }
    router.push(localize(`/tasks/${taskId}`))
  }, [router, localize, taskId])

  const sharedRegister =
    register as unknown as UseFormRegister<CreateTaskFormFieldValues>

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

  const [runUpdateTask, { loading: updating }] =
    useMutation<UpdateTaskMutation>(UpdateTask, {
      refetchQueries: [
        { query: TaskForEdit, variables: { id: taskId } },
        { query: MyRequests },
        { query: Tasks },
      ],
      awaitRefetchQueries: true,
    })

  const onMapPlaceNameChange = useCallback(
    (v: string) => {
      setValue('mapPlaceName', v, { shouldValidate: true, shouldDirty: true })
    },
    [setValue],
  )

  const onLocationLatChange = useCallback(
    (v: string) => {
      setValue('locationLat', v, { shouldValidate: true, shouldDirty: true })
    },
    [setValue],
  )

  const onLocationLngChange = useCallback(
    (v: string) => {
      setValue('locationLng', v, { shouldValidate: true, shouldDirty: true })
    },
    [setValue],
  )

  const onCopyMapPlaceToAddress = useCallback(() => {
    const name = getValues('mapPlaceName').trim()
    if (!name) return
    setValue('streetAddress', name, { shouldValidate: true, shouldDirty: true })
  }, [getValues, setValue])

  const locationError =
    errors.mapPlaceName?.message ??
    errors.locationLat?.message ??
    errors.locationLng?.message

  async function onSubmit(values: EditTaskFormValues) {
    setServerError(null)
    setServerErrorCode(null)
    if (!getAuthToken()) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/tasks/${taskId}/edit`)}`,
      )
      return
    }

    if (values.acceptedWorkerCap < minAcceptedCap) {
      setServerError(
        `Worker cap cannot be below ${minAcceptedCap} — you already have that many accepted quotes.`,
      )
      return
    }

    try {
      await runUpdateTask({
        variables: {
          taskId,
          input: buildUpdateTaskInput(values),
        },
      })

      if (imageFiles.length > 0) {
        await uploadTaskImagesWithPresign(
          apollo,
          taskId,
          imageFiles,
          nextTaskImageUploadIndex(existingImageUrls),
        )
      }

      trackFlowSucceeded(EVENTS.task_save_success, { task_id: taskId })
      router.push(`/tasks/${taskId}`)
    } catch (err: unknown) {
      trackFlowFailed(EVENTS.task_save_fail, err, {
        flow: 'task_save',
        action: 'updateTask',
        operation: 'UpdateTask',
        route: `/tasks/${taskId}/edit`,
        extra: { task_id: taskId },
      })
      if (isUnauthenticatedError(err)) {
        router.replace(
          `/login?redirect=${encodeURIComponent(`/tasks/${taskId}/edit`)}`,
        )
        return
      }
      const code = getGraphQLErrorCode(err)
      setServerErrorCode(code ?? null)
      setServerError(
        getTaskMutationErrorMessage(err, 'Could not save your changes.'),
      )
    }
  }

  const saving = updating || isSubmitting
  const statusBadge =
    task.status === TaskStatus.Draft ? (
      <Badge variant="neutral" dot shape="pill" size="sm">
        {t.preview.draft}
      </Badge>
    ) : (
      <TaskStatusPill status="OPEN" size="sm" />
    )

  return (
    <form
      onSubmit={(event) => {
        void handleSubmit((raw) => void onSubmit(raw as EditTaskFormValues))(
          event,
        )
      }}
      noValidate
    >
      <StickyHeader
        title={t.title}
        description={t.description}
        backLabel={t.back}
        backAriaLabel={t.backAria}
        onBack={onBack}
        action={({ isStuck }) => (
          <Button type="submit" size={isStuck ? 'sm' : 'md'} loading={saving}>
            {t.submit}
          </Button>
        )}
      />
      {serverError ? (
        <Stack
          gap={2}
          mb={4}
          p={4}
          borderRadius="lg"
          bg="status.danger.bg"
          role="alert"
        >
          <Text color="status.danger.fg" fontSize="sm">
            {serverError}
          </Text>
          {serverErrorCode === 'PROFILE_PHONE_REQUIRED' ? (
            <Link
              href="/account"
              fontSize="sm"
              fontWeight={600}
              color="text.link"
            >
              Add or verify phone in Account
            </Link>
          ) : null}
        </Stack>
      ) : null}
      <Grid
        w="full"
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0, 1fr) minmax(320px, 400px)',
        }}
        gap={{ base: 6, lg: 8 }}
        alignItems="start"
        pb={{ base: 10, md: 16 }}
      >
        <Stack gap={6} minW={0}>
          <CreateTaskBasicsSection
            sectionHeading={t.sections.basics}
            register={sharedRegister}
            fieldErrors={{
              title: errors.title?.message,
              category: errors.category?.message,
              description: errors.description?.message,
            }}
          />
          <CreateTaskScheduleSection
            sectionHeading={t.sections.timing}
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
          <CreateTaskMapLocationPanel
            sectionHeading={t.sections.location}
            mapboxAccessToken={mapboxAccessToken}
            mapPlaceName={mapPlaceName}
            locationLat={locationLat}
            locationLng={locationLng}
            register={sharedRegister}
            streetAddressError={errors.streetAddress?.message}
            onCopyMapPlaceToAddress={onCopyMapPlaceToAddress}
            locationError={locationError}
            onLocationChange={onMapPlaceNameChange}
            onLocationLatChange={onLocationLatChange}
            onLocationLngChange={onLocationLngChange}
          />
          <CreateTaskBudgetSection
            sectionHeading={t.sections.budget}
            register={sharedRegister}
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
          <CreateTaskVisualsSection
            sectionHeading={t.sections.photos}
            existingImageUrls={existingImageUrls}
            files={imageFiles}
            previews={imagePreviewUrls}
            onFilesAdded={onFilesAdded}
            onRemoveFile={onRemoveFile}
          />
          <EditTaskAcceptedWorkerCapSection
            register={register}
            minAcceptedCap={minAcceptedCap}
            errorText={errors.acceptedWorkerCap?.message}
          />
          <CreateTaskContactSection
            sectionHeading={t.sections.contact}
            preferredContactMethod={preferredContactMethod}
            contactOptions={contactOptions}
            onPreferredContactMethodChange={(m) =>
              setValue('preferredContactMethod', m, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />
        </Stack>
        <Stack
          gap={6}
          minW={0}
          position={{ base: 'static', lg: 'sticky' }}
          top={{ lg: RAIL_STICKY_TOP }}
        >
          <EditTaskPreviewCard
            eyebrow={t.preview.eyebrow}
            statusBadge={statusBadge}
            title={title.trim() || t.preview.untitled}
            description={description.trim() || t.preview.noDescription}
            locationLabel={preview.locationLabel}
            whenLabel={preview.whenLabel}
            categoryLabel={preview.categoryLabel}
            budgetLabel={preview.budgetLabel}
            lat={preview.lat}
            lng={preview.lng}
            mapboxAccessToken={mapboxAccessToken}
          />
          <EditTaskHelpCard />
        </Stack>
      </Grid>
    </form>
  )
}

export default function EditTaskPage() {
  const t = useI11n(bag)
  const router = useRouter()
  const params = useParams<{ slug: string }>()
  const taskId = typeof params.slug === 'string' ? params.slug : ''
  const editPath = taskId ? `/tasks/${taskId}/edit` : '/requests'

  const [sessionOk, setSessionOk] = useState(false)
  const sessionGateRef = useRef(false)
  if (!sessionGateRef.current) {
    sessionGateRef.current = true
    if (!getAuthToken()) {
      router.replace(`/login?redirect=${encodeURIComponent(editPath)}`)
    } else {
      setSessionOk(true)
    }
  }

  const { data: meData, loading: meLoading } = useQuery<MeQuery>(Me, {
    skip: !sessionOk,
    fetchPolicy: 'cache-first',
  })
  const me = meData?.me ?? null
  const contactOptions = useMemo(() => (me ? getContactOptions(me) : []), [me])

  const {
    data: taskData,
    loading: taskLoading,
    error: taskError,
  } = useQuery<TaskForEditQuery>(TaskForEdit, {
    variables: taskQueryVariables(taskId),
    skip: !sessionOk || !taskId,
    fetchPolicy: 'network-only',
  })

  const task = taskData?.task ?? null
  const isOwner = Boolean(me && task && me.id === task.poster?.id)
  const editable = task ? isTaskEditable(task.status) : false

  if (!sessionOk || !taskId) {
    return <SessionLoading minH="50vh" />
  }

  if (meLoading && !me) {
    return <SessionLoading minH="50vh" label={t.loadingProfile} />
  }

  if (taskLoading && !task) {
    return <SessionLoading minH="50vh" label={t.loading} />
  }

  if (taskError || !task) {
    return (
      <Box bg="bg.canvas" color="text.default" minH="50vh" py={12}>
        <Container maxW="lg">
          <Stack
            gap={4}
            p={6}
            borderRadius="xl"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
          >
            <Text fontWeight={700}>{t.notFoundTitle}</Text>
            <Text fontSize="sm" color="text.muted">
              {t.notFoundDescription}
            </Text>
            <Link href="/requests" color="text.link" fontWeight={600}>
              {t.backToRequests}
            </Link>
          </Stack>
        </Container>
      </Box>
    )
  }

  if (!isOwner) {
    return (
      <Box bg="bg.canvas" color="text.default" minH="50vh" py={12}>
        <Container maxW="lg">
          <Stack
            gap={4}
            p={6}
            borderRadius="xl"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
          >
            <Text fontWeight={700}>You cannot edit this task</Text>
            <Text fontSize="sm" color="text.muted">
              Only the person who posted the task can make changes.
            </Text>
            <Link href={`/tasks/${taskId}`} color="text.link" fontWeight={600}>
              View task
            </Link>
          </Stack>
        </Container>
      </Box>
    )
  }

  if (!editable) {
    return (
      <Box bg="bg.canvas" color="text.default" minH="50vh" py={12}>
        <Container maxW="lg">
          <Stack
            gap={4}
            p={6}
            borderRadius="xl"
            bg="bg.surface"
            borderWidth="1px"
            borderColor="border.default"
          >
            <Text fontWeight={700}>This task can no longer be edited</Text>
            <Text fontSize="sm" color="text.muted">
              Tasks can only be updated while they are open or still in draft.
              Once a quote is accepted or work has started, details are locked.
            </Text>
            <Link href={`/tasks/${taskId}`} color="text.link" fontWeight={600}>
              View task
            </Link>
          </Stack>
        </Container>
      </Box>
    )
  }

  return (
    <Box bg="bg.canvas" color="text.default" minH="100vh">
      <Container>
        <EditTaskFormBody
          taskId={taskId}
          task={task}
          contactOptions={contactOptions}
        />
      </Container>
      <Footer />
    </Box>
  )
}
