'use client'

import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import { Box, Container, Grid, HStack, Stack, Text } from '@chakra-ui/react'
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
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'

import CreateTask from '@/app/(task)/graphql/CreateTask.gql'
import Me from '@/graphql/Me.gql'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { uploadTaskImagesWithPresign } from '@/utils/taskImageUpload'
import { Button, Footer } from '@ui'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskMapLocationPanel,
  CreateTaskScheduleSection,
  CreateTaskVisualsSection,
} from './components'
import { CreateTaskPageHeader } from './components/CreateTaskPageHeader'
import {
  type CreateTaskFormFieldValues,
  type CreateTaskFormValues,
  buildDatetimePayload,
  createTaskFormSchema,
  toYmd,
} from './createTaskFormSchema'

const POST_TASK_PATH = '/tasks/create'

type CreateTaskFormBodyProps = {
  preferredContactDefault: TaskContactMethod
}

function CreateTaskFormBody({
  preferredContactDefault,
}: CreateTaskFormBodyProps) {
  const router = useRouter()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([])
  const imagePreviewUrlsUnmountRef = useRef<string[]>([])
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
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
      router.replace(`/login?redirect=${encodeURIComponent(POST_TASK_PATH)}`)
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

      router.push(`/task/${createdTaskId}`)
    } catch (err: unknown) {
      setServerError(getFriendlyErrorMessage(err, 'Task creation failed.'))
    }
  }

  const mapScheduleStack = (
    <Stack gap={6}>
      <CreateTaskMapLocationPanel
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

  const createTaskForm = (
    <form
      onSubmit={handleSubmit(
        (raw) => void onSubmit(raw as CreateTaskFormValues),
      )}
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
            register={register}
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
              files={imageFiles}
              previews={imagePreviewUrls}
              onFilesAdded={onFilesAdded}
              onRemoveFile={onRemoveFile}
            />
            <CreateTaskBudgetSection
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
            <CreateTaskContactSection
              preferredContactMethod={preferredContactMethod}
              onPreferredContactMethodChange={(m) =>
                setValue('preferredContactMethod', m, {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            />
            <Stack gap={3} pt={2}>
              <HStack justify="space-between" flexWrap="wrap" gap={3}>
                <Button type="button" variant="ghost" disabled opacity={0.5}>
                  Save as draft
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  loading={creating || isSubmitting}
                >
                  Publish task
                </Button>
              </HStack>
              {serverError ? (
                <Text color="red.500" fontSize="sm">
                  {serverError}
                </Text>
              ) : null}
            </Stack>
          </Stack>
        </Box>
      </Grid>
    </form>
  )

  return (
    <>
      <CreateTaskPageHeader />
      {createTaskForm}
    </>
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

  const mePrimedForForm = Boolean(meData?.me) || !meLoading

  if (!sessionOk) {
    return (
      <Box
        bg="bg"
        color="cardFg"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="formLabelMuted" fontSize="sm">
          Checking your session…
        </Text>
      </Box>
    )
  }

  if (!mePrimedForForm) {
    return (
      <Box
        bg="bg"
        color="cardFg"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="formLabelMuted" fontSize="sm">
          Loading your profile…
        </Text>
      </Box>
    )
  }

  return (
    <Box bg="bg" color="cardFg" minH="100vh">
      <Stack gap={0}>
        <Box as="section" bg="cardBg" py={{ base: 8, md: 10 }}>
          <Container>
            <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
              <CreateTaskFormBody
                preferredContactDefault={preferredContactDefault}
              />
            </Stack>
          </Container>
        </Box>
        <Footer />
      </Stack>
    </Box>
  )
}
