'use client'

import { useApolloClient, useMutation } from '@apollo/client/react'
import { Box, Grid, HStack, Link, Stack } from '@chakra-ui/react'
import {
  BudgetUnit,
  type CreateTaskMutation,
  type DayOfWeek,
  TaskCategory,
  TaskContactMethod,
  TaskPaymentMethod,
} from '@codegen/schema'
import { zodResolver } from '@hookform/resolvers/zod'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
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
  TIME_SLOT_OPTIONS,
  buildAvailabilityPayload,
  createTaskFormSchema,
  emptySlotsByDay,
  toPreferredDateTimeIso,
  toYmd,
} from './createTaskFormSchema'

const POST_TASK_PATH = '/tasks/create'

const CATEGORY_OPTIONS = [
  TaskCategory.Plumbing,
  TaskCategory.Electrical,
  TaskCategory.Painting,
  TaskCategory.Gardening,
] as const

export default function CreateTaskPage() {
  const router = useRouter()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [sessionOk, setSessionOk] = useState(false)
  const [imageFiles, setImageFiles] = useState<File[]>([])
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
      category: TaskCategory.Plumbing,
      preferredDate: toYmd(new Date()),
      preferredTime: '09:00',
      slotsByDay: emptySlotsByDay(),
      budgetMajor: '',
      budgetUnit: BudgetUnit.Gbp,
      paymentMethod: TaskPaymentMethod.Cash,
      preferredContactMethod: TaskContactMethod.InApp,
    },
  })

  const category = watch('category')
  const mapPlaceName = watch('mapPlaceName')
  const locationLat = watch('locationLat')
  const locationLng = watch('locationLng')
  const preferredDate = watch('preferredDate')
  const preferredTime = watch('preferredTime')
  const slotsByDay = watch('slotsByDay')
  const budgetUnit = watch('budgetUnit')
  const paymentMethod = watch('paymentMethod')
  const preferredContactMethod = watch('preferredContactMethod')

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)

  useEffect(() => {
    if (!getAuthToken()) {
      router.replace(`/login?redirect=${encodeURIComponent(POST_TASK_PATH)}`)
      return
    }
    setSessionOk(true)
  }, [router])

  const imagePreviewUrls = useMemo(
    () => imageFiles.map((f) => URL.createObjectURL(f)),
    [imageFiles],
  )

  useEffect(() => {
    return () => {
      for (const u of imagePreviewUrls) URL.revokeObjectURL(u)
    }
  }, [imagePreviewUrls])

  const onFilesAdded = useCallback((list: FileList | null) => {
    if (!list?.length) return
    setImageFiles((prev) => [...prev, ...Array.from(list)])
  }, [])

  const onRemoveFile = useCallback((index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const toggleSlot = useCallback(
    (day: DayOfWeek, slotValue: string) => {
      const prev = getValues('slotsByDay')
      const cur = prev[day] ?? []
      const has = cur.includes(slotValue)
      const nextSlots = has
        ? cur.filter((s) => s !== slotValue)
        : [...cur, slotValue]
      setValue(
        'slotsByDay',
        { ...prev, [day]: nextSlots },
        { shouldValidate: true, shouldDirty: true },
      )
    },
    [getValues, setValue],
  )

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

    const isoDateTime = toPreferredDateTimeIso(values)
    const parsedBudget = Number.parseFloat(values.budgetMajor)
    const availability = buildAvailabilityPayload(values)

    try {
      const imageUrls = await uploadTaskImagesWithPresign(apollo, imageFiles)

      const res = await runCreateTask({
        variables: {
          input: {
            title: values.title.trim(),
            description: values.description.trim(),
            budget: parsedBudget,
            budgetUnit: values.budgetUnit,
            paymentMethod: values.paymentMethod,
            address: values.streetAddress.trim(),
            location: {
              lat: Number.parseFloat(values.locationLat),
              lng: Number.parseFloat(values.locationLng),
              name: values.mapPlaceName.trim(),
            },
            category: values.category,
            availability,
            preferredDateTime: isoDateTime,
            preferredContactMethod: values.preferredContactMethod,
            images: imageUrls,
          },
        },
      })

      const createdTaskId = res.data?.createTask?.id
      if (!createdTaskId) throw new Error('Task creation failed.')
      router.push(`/task/${createdTaskId}`)
    } catch (err: unknown) {
      setServerError(getFriendlyErrorMessage(err, 'Task creation failed.'))
    }
  }

  const mapScheduleColumn = (
    <Stack
      gap={6}
      position={{ base: 'static', lg: 'sticky' }}
      top={{ lg: 4 }}
      alignSelf="start"
    >
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
        preferredDate={preferredDate}
        preferredTime={preferredTime}
        slotsByDay={slotsByDay}
        slotTemplates={TIME_SLOT_OPTIONS}
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
        onToggleSlot={toggleSlot}
        fieldErrors={{
          preferredDate: errors.preferredDate?.message,
          preferredTime: errors.preferredTime?.message,
          slotsByDay: errors.slotsByDay?.message as string | undefined,
        }}
      />
    </Stack>
  )

  const mainFormColumn = (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack gap={6}>
        <CreateTaskBasicsSection
          register={register}
          category={category}
          categoryOptions={CATEGORY_OPTIONS}
          onCategoryChange={(c) =>
            setValue('category', c, {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          fieldErrors={{
            title: errors.title?.message,
            description: errors.description?.message,
          }}
        />

        <CreateTaskVisualsSection
          files={imageFiles}
          previews={imagePreviewUrls}
          onFilesAdded={onFilesAdded}
          onRemoveFile={onRemoveFile}
        />

        <CreateTaskBudgetSection
          register={register}
          budgetUnit={budgetUnit}
          paymentMethod={paymentMethod}
          onBudgetUnitChange={(u) =>
            setValue('budgetUnit', u, {
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
            <Button type="submit" size="lg" loading={creating || isSubmitting}>
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

            <Grid
              templateColumns={{
                base: '1fr',
                lg: 'minmax(0,1fr) minmax(300px,380px)',
              }}
              gap={{ base: 8, lg: 10 }}
              alignItems="start"
            >
              <Box order={{ base: 2, lg: 1 }}>{mainFormColumn}</Box>
              <Box order={{ base: 1, lg: 2 }}>{mapScheduleColumn}</Box>
            </Grid>
          </Stack>
        </Section>
        <Footer />
      </Stack>
    </Box>
  )
}
