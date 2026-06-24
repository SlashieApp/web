'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { Box, Container, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import {
  type MeQuery,
  TaskContactMethod,
  type TaskQuery,
  type UpdateTaskMutation,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useParams, useRouter } from 'next/navigation'
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { type UseFormRegister, useForm } from 'react-hook-form'

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
import Task from '@/app/(task)/tasks/[slug]/graphql/Task.gql'
import UpdateTask from '@/app/(task)/tasks/[slug]/graphql/UpdateTask.gql'
import Me from '@/graphql/Me.gql'
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
import { Button, Footer, Link } from '@ui'
import { taskQueryVariables } from '../helpers/taskQueryVariables'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskMapLocationPanel,
  CreateTaskScheduleSection,
  CreateTaskVisualsSection,
} from '../../create/components'
import type { CreateTaskFormFieldValues } from '../../create/createTaskFormSchema'
import { EditTaskAcceptedWorkerCapSection } from '../../edit/components/EditTaskAcceptedWorkerCapSection'
import {
  type EditTaskFormFieldValues,
  type EditTaskFormValues,
  editTaskFormSchema,
} from '../../edit/editTaskFormSchema'

function EditTaskPageHeader({ taskTitle }: { taskTitle: string }) {
  return (
    <Stack gap={2}>
      <Link
        href="/requests"
        fontSize="sm"
        fontWeight={600}
        color="text.link"
        _hover={{ textDecoration: 'none', color: 'text.link' }}
      >
        ← Back to my requests
      </Link>
      <Stack gap={1}>
        <Text
          fontSize="xs"
          fontWeight={700}
          color="text.muted"
          letterSpacing="0.06em"
          textTransform="uppercase"
        >
          Edit task
        </Text>
        <Text
          fontSize={{ base: '2xl', md: '3xl' }}
          fontWeight={800}
          lineHeight="short"
        >
          {taskTitle}
        </Text>
        <Text color="text.muted" fontSize="sm" maxW="3xl">
          Update your listing while it is still open. You can add more photos;
          existing photos stay on the task.
        </Text>
      </Stack>
    </Stack>
  )
}

type EditTaskFormBodyProps = {
  taskId: string
  task: NonNullable<TaskQuery['task']>
  contactOptions: ReturnType<typeof getContactOptions>
}

function EditTaskFormBody({
  taskId,
  task,
  contactOptions,
}: EditTaskFormBodyProps) {
  const router = useRouter()
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
        { query: Task, variables: { id: taskId } },
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

  const mapScheduleStack = (
    <Stack gap={6}>
      <CreateTaskMapLocationPanel
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
      <CreateTaskScheduleSection
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
    </Stack>
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
      <Grid
        w="full"
        templateColumns={{
          base: '1fr',
          lg: 'minmax(0,1fr) minmax(300px,380px)',
        }}
        templateRows={{ base: 'repeat(3, auto)', lg: 'auto auto' }}
        gap={{ base: 8, lg: 10 }}
        alignItems="start"
      >
        <Box
          gridColumn={{ base: '1', lg: '1' }}
          gridRow={{ base: '1', lg: '1' }}
        >
          <CreateTaskBasicsSection
            register={sharedRegister}
            fieldErrors={{
              title: errors.title?.message,
              category: errors.category?.message,
              description: errors.description?.message,
            }}
          />
        </Box>
        <Box
          gridColumn={{ base: '1', lg: '2' }}
          gridRow={{ base: '2', lg: '1 / span 2' }}
          position={{ base: 'static', lg: 'sticky' }}
          top={{ lg: 4 }}
          alignSelf="start"
        >
          {mapScheduleStack}
        </Box>
        <Box
          gridColumn={{ base: '1', lg: '1' }}
          gridRow={{ base: '3', lg: '2' }}
        >
          <Stack gap={6}>
            <CreateTaskVisualsSection
              sectionHeading="Photos"
              existingImageUrls={existingImageUrls}
              files={imageFiles}
              previews={imagePreviewUrls}
              onFilesAdded={onFilesAdded}
              onRemoveFile={onRemoveFile}
            />
            <CreateTaskBudgetSection
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
            <EditTaskAcceptedWorkerCapSection
              register={register}
              minAcceptedCap={minAcceptedCap}
              errorText={errors.acceptedWorkerCap?.message}
            />
            <CreateTaskContactSection
              preferredContactMethod={preferredContactMethod}
              contactOptions={contactOptions}
              onPreferredContactMethodChange={(m) =>
                setValue('preferredContactMethod', m, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            <Stack gap={3} pt={2}>
              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <Link
                  href={`/tasks/${taskId}`}
                  _hover={{ textDecoration: 'none' }}
                >
                  <Button type="button" variant="ghost">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  size="lg"
                  loading={updating || isSubmitting}
                >
                  Save changes
                </Button>
              </HStack>
              {serverError ? (
                <Stack gap={2}>
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
            </Stack>
          </Stack>
        </Box>
      </Grid>
    </form>
  )
}

export default function EditTaskPage() {
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
  } = useQuery<TaskQuery>(Task, {
    variables: taskQueryVariables(taskId),
    skip: !sessionOk || !taskId,
    fetchPolicy: 'network-only',
  })

  const task = taskData?.task ?? null
  const isOwner = Boolean(me && task && me.id === task.poster?.id)
  const editable = task ? isTaskEditable(task.status) : false

  if (!sessionOk || !taskId) {
    return (
      <Box
        bg="bg.canvas"
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

  if (meLoading && !me) {
    return (
      <Box
        bg="bg.canvas"
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

  if (taskLoading && !task) {
    return (
      <Box
        bg="bg.canvas"
        color="text.default"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="text.muted" fontSize="sm">
          Loading task…
        </Text>
      </Box>
    )
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
            <Text fontWeight={700}>Task not found</Text>
            <Text fontSize="sm" color="text.muted">
              This task may have been removed or the link is invalid.
            </Text>
            <Link href="/requests" color="text.link" fontWeight={600}>
              Back to my requests
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
      <Stack gap={0}>
        <Box as="section" bg="bg.surface" py={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
              <EditTaskPageHeader taskTitle={task.title} />
              <EditTaskFormBody
                taskId={taskId}
                task={task}
                contactOptions={contactOptions}
              />
            </Stack>
          </Container>
        </Box>
        <Footer />
      </Stack>
    </Box>
  )
}
