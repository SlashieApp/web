'use client'

import { useApolloClient, useMutation } from '@apollo/client/react'
import { Box, Grid, HStack, Link, Stack } from '@chakra-ui/react'
import {
  type CreateTaskMutation,
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { CREATE_TASK } from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { uploadTaskImagesWithPresign } from '@/utils/taskImageUpload'
import { Button, Footer, Heading, Section, Text } from '@ui'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskMapLocationPanel,
  CreateTaskScheduleSection,
  CreateTaskVisualsSection,
} from './components'
import {
  buildDatetimePayload,
  createTaskFormSchema,
  toYmd,
} from './createTaskFormSchema'

const POST_TASK_PATH = '/tasks/create'

export default function CreateTaskPage() {
  const router = useRouter()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [sessionOk, setSessionOk] = useState(false)
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
  } = useForm<z.infer<typeof createTaskFormSchema>>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      streetAddress: '',
      mapPlaceName: '',
      locationLat: '51.5074',
      locationLng: '-0.1278',
      datetimeType: TaskDateTimeType.Flexible,
      preferredDate: toYmd(new Date()),
      preferredTime: '09:00',
      budgetMajor: '',
      budgetCurrency: Currency.Gdp,
      budgetType: TaskBudgetType.OneOff,
      paymentMethod: TaskPaymentMethod.Cash,
      preferredContactMethod: TaskContactMethod.InApp,
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
    useMutation<CreateTaskMutation>(CREATE_TASK)

  const sessionGateRef = useRef(false)
  if (!sessionGateRef.current) {
    sessionGateRef.current = true
    if (!getAuthToken()) {
      router.replace(`/login?redirect=${encodeURIComponent(POST_TASK_PATH)}`)
    } else {
      setSessionOk(true)
    }
  }

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

  async function onSubmit(values: z.infer<typeof createTaskFormSchema>) {
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
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

  if (!sessionOk) {
    return (
      <Box
        bg="surface"
        color="fg"
        minH="50vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Text color="muted" fontSize="sm">
          Checking your session…
        </Text>
      </Box>
    )
  }

  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section bg="surfaceContainerLow" py={{ base: 8, md: 10 }}>
          <Stack gap={8} maxW="7xl" mx="auto" px={{ base: 4, md: 6 }}>
            <Stack gap={2}>
              <Link
                as={NextLink}
                href="/"
                fontWeight={600}
                color="primary.700"
                _hover={{ textDecoration: 'none' }}
              >
                ← Back to tasks
              </Link>
              <Heading size={{ base: '2xl', md: '3xl' }} fontWeight={800}>
                Post a new task
              </Heading>
              <Text color="muted">
                Detail your requirements, set your budget, and find the right
                professional for your project.
              </Text>
            </Stack>

            {createTaskForm}
          </Stack>
        </Section>
        <Footer />
      </Stack>
    </Box>
  )
}
