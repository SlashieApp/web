'use client'

import { useApolloClient, useMutation } from '@apollo/client/react'
import { Box, Grid, HStack, Link, Stack } from '@chakra-ui/react'
import {
  BudgetUnit,
  type CreateTaskMutation,
  DayOfWeek,
  TaskCategory,
  TaskContactMethod,
  TaskPaymentMethod,
} from '@codegen/schema'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { CREATE_TASK } from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { uploadTaskImageWithPresign } from '@/utils/taskImageUpload'
import { Button, Footer, Heading, Section, Text } from '@ui'

import {
  CreateTaskBasicsSection,
  CreateTaskBudgetSection,
  CreateTaskContactSection,
  CreateTaskLocationSection,
  CreateTaskScheduleSection,
  CreateTaskSidebar,
  CreateTaskVisualsSection,
  type TimeSlotTemplate,
} from './components'

const CATEGORY_OPTIONS = [
  TaskCategory.Plumbing,
  TaskCategory.Electrical,
  TaskCategory.Painting,
  TaskCategory.Gardening,
] as const

const TIME_SLOT_OPTIONS: readonly TimeSlotTemplate[] = [
  { value: 'MORNING', label: 'Morning (8am–12pm)' },
  { value: 'AFTERNOON', label: 'Afternoon (12pm–4pm)' },
  { value: 'EVENING', label: 'Evening (4pm–8pm)' },
  { value: 'ANYTIME', label: 'Anytime' },
] as const

const SLOT_LABEL_BY_VALUE = Object.fromEntries(
  TIME_SLOT_OPTIONS.map((s) => [s.value, s.label]),
) as Record<string, string>

function emptySlotsByDay(): Record<DayOfWeek, string[]> {
  return {
    [DayOfWeek.Sun]: [],
    [DayOfWeek.Mon]: [],
    [DayOfWeek.Tue]: [],
    [DayOfWeek.Wed]: [],
    [DayOfWeek.Thu]: [],
    [DayOfWeek.Fri]: [],
    [DayOfWeek.Sat]: [],
  }
}

function toYmd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function preferredDateTimeIso(date: string, timeHm: string): string | null {
  if (!date || !timeHm) return null
  const parsed = new Date(`${date}T${timeHm}:00`)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

type MobileStep = 1 | 2 | 3 | 4

export default function CreateTaskPage() {
  const router = useRouter()
  const apollo = useApolloClient()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [mobileStep, setMobileStep] = useState<MobileStep>(1)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.Plumbing)
  const [streetAddress, setStreetAddress] = useState('')
  const [mapPlaceName, setMapPlaceName] = useState('')
  const [locationLat, setLocationLat] = useState('51.5074')
  const [locationLng, setLocationLng] = useState('-0.1278')
  const [preferredDate, setPreferredDate] = useState(() => toYmd(new Date()))
  const [preferredTime, setPreferredTime] = useState('09:00')
  const [slotsByDay, setSlotsByDay] =
    useState<Record<DayOfWeek, string[]>>(emptySlotsByDay)
  const [budgetMajor, setBudgetMajor] = useState('')
  const [budgetUnit, setBudgetUnit] = useState(BudgetUnit.Gbp)
  const [paymentMethod, setPaymentMethod] = useState<TaskPaymentMethod>(
    TaskPaymentMethod.Cash,
  )
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<TaskContactMethod>(TaskContactMethod.InApp)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)
  const totalMobileSteps = 4

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

  const toggleSlot = useCallback((day: DayOfWeek, slotValue: string) => {
    setSlotsByDay((prev) => {
      const cur = prev[day] ?? []
      const has = cur.includes(slotValue)
      const nextSlots = has
        ? cur.filter((s) => s !== slotValue)
        : [...cur, slotValue]
      return { ...prev, [day]: nextSlots }
    })
  }, [])

  const availabilityPayload = useMemo(() => {
    const out: { day: DayOfWeek; slots: string[] }[] = []
    for (const day of Object.values(DayOfWeek)) {
      const raw = slotsByDay[day] ?? []
      if (raw.length === 0) continue
      const labels = raw.map(
        (v) => SLOT_LABEL_BY_VALUE[v] ?? TIME_SLOT_OPTIONS[0]?.label ?? v,
      )
      out.push({ day, slots: labels })
    }
    return out
  }, [slotsByDay])

  function validateBasics() {
    if (!title.trim()) {
      setError('Please add a task title.')
      return false
    }
    if (!description.trim()) {
      setError('Please describe what needs to be done.')
      return false
    }
    const parsedBudget = Number.parseFloat(budgetMajor)
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setError('Please provide a valid budget amount.')
      return false
    }
    return true
  }

  function validateLocation() {
    if (!streetAddress.trim()) {
      setError('Please add your property address.')
      return false
    }
    if (!mapPlaceName.trim()) {
      setError('Search or move the map to set your task area.')
      return false
    }
    const parsedLocationLat = Number.parseFloat(locationLat)
    const parsedLocationLng = Number.parseFloat(locationLng)
    if (
      !Number.isFinite(parsedLocationLat) ||
      Number.isNaN(parsedLocationLat)
    ) {
      setError('Could not read map latitude. Try moving the map slightly.')
      return false
    }
    if (
      !Number.isFinite(parsedLocationLng) ||
      Number.isNaN(parsedLocationLng)
    ) {
      setError('Could not read map longitude. Try moving the map slightly.')
      return false
    }
    return true
  }

  function validateSchedule() {
    if (!preferredDate) {
      setError('Please choose a preferred date.')
      return false
    }
    if (!preferredTime) {
      setError('Please choose a preferred time.')
      return false
    }
    if (availabilityPayload.length === 0) {
      setError(
        'Add at least one weekly time window so workers know when you are free.',
      )
      return false
    }
    const iso = preferredDateTimeIso(preferredDate, preferredTime)
    if (!iso) {
      setError('Please provide a valid preferred date and time.')
      return false
    }
    return true
  }

  async function onSubmitTask() {
    setError(null)
    if (!validateBasics() || !validateLocation() || !validateSchedule()) return

    const isoDateTime = preferredDateTimeIso(preferredDate, preferredTime)
    if (!isoDateTime) {
      setError('Please provide a valid preferred date and time.')
      return
    }

    if (!getAuthToken()) {
      setError('Please log in before posting a task.')
      router.push(`/login?next=${encodeURIComponent('/tasks/create')}`)
      return
    }

    const parsedBudget = Number.parseFloat(budgetMajor)

    try {
      const imageUrls: string[] = []
      for (let i = 0; i < imageFiles.length; i += 1) {
        const url = await uploadTaskImageWithPresign(
          apollo,
          imageFiles[i] as File,
          i,
        )
        imageUrls.push(url)
      }

      const res = await runCreateTask({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            budget: parsedBudget,
            budgetUnit,
            paymentMethod,
            address: streetAddress.trim(),
            location: {
              lat: Number.parseFloat(locationLat),
              lng: Number.parseFloat(locationLng),
              name: mapPlaceName.trim(),
            },
            category,
            availability: availabilityPayload,
            preferredDateTime: isoDateTime,
            preferredContactMethod,
            images: imageUrls,
          },
        },
      })

      const createdTaskId = res.data?.createTask?.id
      if (!createdTaskId) throw new Error('Task creation failed.')
      router.push(`/task/${createdTaskId}`)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Task creation failed.'))
    }
  }

  function onNextMobileStep() {
    setError(null)
    if (mobileStep === 1) {
      if (!validateBasics()) return
      setMobileStep(2)
      return
    }
    if (mobileStep === 2) {
      if (!validateLocation()) return
      setMobileStep(3)
      return
    }
    if (mobileStep === 3) {
      if (!validateSchedule()) return
      setMobileStep(4)
    }
  }

  function onBackMobileStep() {
    setError(null)
    setMobileStep((prev) => (prev > 1 ? ((prev - 1) as MobileStep) : prev))
  }

  const formColumn = (
    <Stack gap={6}>
      <CreateTaskBasicsSection
        title={title}
        description={description}
        category={category}
        categoryOptions={CATEGORY_OPTIONS}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onCategoryChange={setCategory}
      />

      <CreateTaskLocationSection
        mapboxAccessToken={mapboxAccessToken}
        streetAddress={streetAddress}
        mapPlaceName={mapPlaceName}
        locationLat={locationLat}
        locationLng={locationLng}
        onStreetAddressChange={setStreetAddress}
        onLocationChange={setMapPlaceName}
        onLocationLatChange={setLocationLat}
        onLocationLngChange={setLocationLng}
      />

      <CreateTaskVisualsSection
        files={imageFiles}
        previews={imagePreviewUrls}
        onFilesAdded={onFilesAdded}
        onRemoveFile={onRemoveFile}
      />

      <CreateTaskBudgetSection
        budgetMajor={budgetMajor}
        budgetUnit={budgetUnit}
        paymentMethod={paymentMethod}
        onBudgetMajorChange={setBudgetMajor}
        onBudgetUnitChange={setBudgetUnit}
        onPaymentMethodChange={setPaymentMethod}
      />

      <CreateTaskScheduleSection
        preferredDate={preferredDate}
        preferredTime={preferredTime}
        slotsByDay={slotsByDay}
        slotTemplates={TIME_SLOT_OPTIONS}
        onPreferredDateChange={setPreferredDate}
        onPreferredTimeChange={setPreferredTime}
        onToggleSlot={toggleSlot}
      />

      <CreateTaskContactSection
        preferredContactMethod={preferredContactMethod}
        onPreferredContactMethodChange={setPreferredContactMethod}
      />

      <Stack gap={3} pt={2}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Button type="button" variant="ghost" disabled opacity={0.5}>
            Save as draft
          </Button>
          <Button
            type="button"
            size="lg"
            loading={creating}
            onClick={() => void onSubmitTask()}
          >
            Publish task
          </Button>
        </HStack>
        {error ? (
          <Text color="red.500" fontSize="sm">
            {error}
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )

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
                Share what you need, set your area on the map, and publish when
                you are ready.
              </Text>
            </Stack>

            <Stack display={{ base: 'none', lg: 'flex' }} gap={8}>
              <Grid
                templateColumns={{ base: '1fr', xl: 'minmax(0,1fr) 340px' }}
                gap={10}
                alignItems="start"
              >
                {formColumn}
                <CreateTaskSidebar />
              </Grid>
            </Stack>

            <Stack display={{ base: 'flex', lg: 'none' }} gap={4}>
              <Stack gap={2}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight={800} color="primary.700">
                    STEP {mobileStep} OF {totalMobileSteps}
                  </Text>
                  <Text fontSize="sm" color="muted" fontWeight={700}>
                    {Math.round((mobileStep / totalMobileSteps) * 100)}%
                    complete
                  </Text>
                </HStack>
                <Box h="8px" borderRadius="full" bg="surfaceContainerLow">
                  <Box
                    h="100%"
                    borderRadius="full"
                    bg="linear-gradient(95deg, #1A56DB 0%, #003FB1 100%)"
                    width={`${Math.round((mobileStep / totalMobileSteps) * 100)}%`}
                    transition="width 220ms ease"
                  />
                </Box>
              </Stack>

              {mobileStep === 1 ? (
                <Stack gap={6}>
                  <CreateTaskBasicsSection
                    title={title}
                    description={description}
                    category={category}
                    categoryOptions={CATEGORY_OPTIONS}
                    onTitleChange={setTitle}
                    onDescriptionChange={setDescription}
                    onCategoryChange={setCategory}
                  />
                  <CreateTaskVisualsSection
                    files={imageFiles}
                    previews={imagePreviewUrls}
                    onFilesAdded={onFilesAdded}
                    onRemoveFile={onRemoveFile}
                  />
                  <CreateTaskBudgetSection
                    budgetMajor={budgetMajor}
                    budgetUnit={budgetUnit}
                    paymentMethod={paymentMethod}
                    onBudgetMajorChange={setBudgetMajor}
                    onBudgetUnitChange={setBudgetUnit}
                    onPaymentMethodChange={setPaymentMethod}
                  />
                  <CreateTaskContactSection
                    preferredContactMethod={preferredContactMethod}
                    onPreferredContactMethodChange={setPreferredContactMethod}
                  />
                </Stack>
              ) : null}

              {mobileStep === 2 ? (
                <CreateTaskLocationSection
                  mapboxAccessToken={mapboxAccessToken}
                  streetAddress={streetAddress}
                  mapPlaceName={mapPlaceName}
                  locationLat={locationLat}
                  locationLng={locationLng}
                  onStreetAddressChange={setStreetAddress}
                  onLocationChange={setMapPlaceName}
                  onLocationLatChange={setLocationLat}
                  onLocationLngChange={setLocationLng}
                />
              ) : null}

              {mobileStep === 3 ? (
                <CreateTaskScheduleSection
                  preferredDate={preferredDate}
                  preferredTime={preferredTime}
                  slotsByDay={slotsByDay}
                  slotTemplates={TIME_SLOT_OPTIONS}
                  onPreferredDateChange={setPreferredDate}
                  onPreferredTimeChange={setPreferredTime}
                  onToggleSlot={toggleSlot}
                />
              ) : null}

              {mobileStep === 4 ? (
                <Stack gap={4}>
                  <CreateTaskSidebar />
                  <HStack justify="space-between" flexWrap="wrap" gap={3}>
                    <Button
                      type="button"
                      variant="ghost"
                      disabled
                      opacity={0.5}
                    >
                      Save as draft
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      loading={creating}
                      onClick={() => void onSubmitTask()}
                    >
                      Publish task
                    </Button>
                  </HStack>
                  {error ? (
                    <Text color="red.500" fontSize="sm">
                      {error}
                    </Text>
                  ) : null}
                </Stack>
              ) : null}

              {mobileStep < 4 ? (
                <HStack justify="space-between" pt={2}>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onBackMobileStep}
                    disabled={mobileStep === 1}
                  >
                    ← Back
                  </Button>
                  <Button type="button" onClick={onNextMobileStep}>
                    {mobileStep === 1
                      ? 'Next: Location →'
                      : mobileStep === 2
                        ? 'Next: Availability →'
                        : 'Next: Review →'}
                  </Button>
                </HStack>
              ) : null}
            </Stack>
          </Stack>
        </Section>
        <Footer />
      </Stack>
    </Box>
  )
}
