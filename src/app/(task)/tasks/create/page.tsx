'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack, Link, SimpleGrid, Stack } from '@chakra-ui/react'
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
import { useState } from 'react'

import { TaskLocationMapPicker } from '@/app/(task)/components'
import { CREATE_TASK } from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { Button, Footer, Header, Heading, Section, Text } from '@ui'
import { CreateTaskDetailsPanel, CreateTaskSubmitPanel } from './components'

const CATEGORY_OPTIONS = [
  TaskCategory.Plumbing,
  TaskCategory.Electrical,
  TaskCategory.Painting,
  TaskCategory.Gardening,
] as const

const TIME_SLOT_OPTIONS = [
  { value: 'MORNING', label: 'Morning (8am - 12pm)', hour: '09:00:00' },
  { value: 'AFTERNOON', label: 'Afternoon (12pm - 4pm)', hour: '13:00:00' },
  { value: 'EVENING', label: 'Evening (4pm - 8pm)', hour: '18:00:00' },
  { value: 'ANYTIME', label: 'Anytime', hour: '12:00:00' },
] as const

const WEEKDAY_FROM_JS: DayOfWeek[] = [
  DayOfWeek.Sun,
  DayOfWeek.Mon,
  DayOfWeek.Tue,
  DayOfWeek.Wed,
  DayOfWeek.Thu,
  DayOfWeek.Fri,
  DayOfWeek.Sat,
]

type MobileStep = 1 | 2 | 3

function toIsoDateTime(preferredDate: string, preferredTimeSlot: string) {
  if (!preferredDate) return null
  const timeConfig = TIME_SLOT_OPTIONS.find(
    (slot) => slot.value === preferredTimeSlot,
  )
  if (!timeConfig) return null
  const parsedDate = new Date(`${preferredDate}T${timeConfig.hour}`)
  if (Number.isNaN(parsedDate.getTime())) return null
  return parsedDate.toISOString()
}

function dayOfWeekFromPreferredDate(preferredDate: string): DayOfWeek | null {
  const parsedDate = new Date(`${preferredDate}T12:00:00`)
  if (Number.isNaN(parsedDate.getTime())) return null
  return WEEKDAY_FROM_JS[parsedDate.getDay()] ?? null
}

export default function CreateTaskPage() {
  const router = useRouter()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [mobileStep, setMobileStep] = useState<MobileStep>(1)
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState('Tap leaking under the sink')
  const [category, setCategory] = useState<TaskCategory>(TaskCategory.Plumbing)
  const [streetAddress, setStreetAddress] = useState(
    '12 Example Street, London',
  )
  const [mapPlaceName, setMapPlaceName] = useState('Hackney, London')
  const [locationLat, setLocationLat] = useState('51.5416')
  const [locationLng, setLocationLng] = useState('-0.0572')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('MORNING')
  const [budgetMajor, setBudgetMajor] = useState('45')
  const [paymentMethod, setPaymentMethod] = useState<TaskPaymentMethod>(
    TaskPaymentMethod.Cash,
  )
  const [preferredContactMethod, setPreferredContactMethod] =
    useState<TaskContactMethod>(TaskContactMethod.Phone)
  const [error, setError] = useState<string | null>(null)

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)
  const totalMobileSteps = 3

  function validateDetails() {
    if (!title.trim()) {
      setError('Please add a task title.')
      return false
    }
    if (!description.trim()) {
      setError('Please describe what needs to be done.')
      return false
    }
    if (!streetAddress.trim()) {
      setError('Please add the property address for the tradesperson.')
      return false
    }
    if (!preferredDate) {
      setError('Please provide a preferred date.')
      return false
    }
    const parsedBudget = Number.parseFloat(budgetMajor)
    if (!Number.isFinite(parsedBudget) || parsedBudget <= 0) {
      setError('Please provide a valid budget in pounds.')
      return false
    }
    return true
  }

  function validateLocation() {
    if (!mapPlaceName.trim()) {
      setError('Please confirm a location on the map (place name).')
      return false
    }
    const parsedLocationLat = Number.parseFloat(locationLat)
    const parsedLocationLng = Number.parseFloat(locationLng)
    if (
      !Number.isFinite(parsedLocationLat) ||
      Number.isNaN(parsedLocationLat)
    ) {
      setError('Please provide a valid latitude.')
      return false
    }
    if (
      !Number.isFinite(parsedLocationLng) ||
      Number.isNaN(parsedLocationLng)
    ) {
      setError('Please provide a valid longitude.')
      return false
    }
    return true
  }

  async function onSubmitTask() {
    setError(null)
    if (!validateDetails() || !validateLocation()) return

    const isoDateTime = toIsoDateTime(preferredDate, preferredTimeSlot)
    if (!isoDateTime) {
      setError('Please provide a valid date and time.')
      return
    }

    const day = dayOfWeekFromPreferredDate(preferredDate)
    if (!day) {
      setError('Please provide a valid preferred date.')
      return
    }

    const slotConfig = TIME_SLOT_OPTIONS.find(
      (slot) => slot.value === preferredTimeSlot,
    )
    const slotLabel = slotConfig?.label ?? 'Anytime'

    if (!getAuthToken()) {
      setError('Please log in before posting a task.')
      router.push(`/login?next=${encodeURIComponent('/tasks/create')}`)
      return
    }

    const parsedBudget = Number.parseFloat(budgetMajor)

    try {
      const res = await runCreateTask({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            budget: parsedBudget,
            budgetUnit: BudgetUnit.Gbp,
            paymentMethod,
            address: streetAddress.trim(),
            location: {
              lat: Number.parseFloat(locationLat),
              lng: Number.parseFloat(locationLng),
              name: mapPlaceName.trim(),
            },
            category,
            availability: [{ day, slots: [slotLabel] }],
            preferredDateTime: isoDateTime,
            preferredContactMethod,
            images: [],
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
      if (!validateDetails()) return
      setMobileStep(2)
      return
    }
    if (mobileStep === 2) {
      if (!validateLocation()) return
      setMobileStep(3)
    }
  }

  function onBackMobileStep() {
    setError(null)
    setMobileStep((prev) => (prev > 1 ? ((prev - 1) as MobileStep) : prev))
  }

  return (
    <Box bg="surface" color="fg" minH="100vh">
      <Stack gap={0}>
        <Section id="header" py={{ base: 4, md: 5 }}>
          <Header activeItem="post-task" />
        </Section>

        <Section bg="surfaceContainerLow" py={{ base: 8, md: 10 }}>
          <Stack gap={8}>
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
                Post a task request
              </Heading>
              <Text color="muted">
                Add job details and place your location on the map.
              </Text>
            </Stack>

            <Stack display={{ base: 'none', md: 'flex' }} gap={6}>
              <SimpleGrid columns={{ md: 2 }} gap={6} alignItems="start">
                <CreateTaskDetailsPanel
                  title={title}
                  description={description}
                  streetAddress={streetAddress}
                  category={category}
                  preferredDate={preferredDate}
                  preferredTimeSlot={preferredTimeSlot}
                  budgetMajor={budgetMajor}
                  preferredContactMethod={preferredContactMethod}
                  paymentMethod={paymentMethod}
                  categoryOptions={CATEGORY_OPTIONS}
                  timeSlotOptions={TIME_SLOT_OPTIONS}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onStreetAddressChange={setStreetAddress}
                  onCategoryChange={setCategory}
                  onPreferredDateChange={setPreferredDate}
                  onPreferredTimeSlotChange={setPreferredTimeSlot}
                  onBudgetMajorChange={setBudgetMajor}
                  onPreferredContactMethodChange={setPreferredContactMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
                <Stack gap={6}>
                  <TaskLocationMapPicker
                    accessToken={mapboxAccessToken}
                    location={mapPlaceName}
                    locationLat={locationLat}
                    locationLng={locationLng}
                    onLocationChange={setMapPlaceName}
                    onLocationLatChange={setLocationLat}
                    onLocationLngChange={setLocationLng}
                  />
                  <CreateTaskSubmitPanel
                    loading={creating}
                    error={error}
                    onSubmit={() => void onSubmitTask()}
                  />
                </Stack>
              </SimpleGrid>
            </Stack>

            <Stack display={{ base: 'flex', md: 'none' }} gap={4}>
              <Stack gap={2}>
                <HStack justify="space-between" align="center">
                  <Text fontSize="sm" fontWeight={800} color="primary.700">
                    STEP {mobileStep} OF {totalMobileSteps}
                  </Text>
                  <Text fontSize="sm" color="muted" fontWeight={700}>
                    {Math.round((mobileStep / totalMobileSteps) * 100)}%
                    Complete
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
                <CreateTaskDetailsPanel
                  title={title}
                  description={description}
                  streetAddress={streetAddress}
                  category={category}
                  preferredDate={preferredDate}
                  preferredTimeSlot={preferredTimeSlot}
                  budgetMajor={budgetMajor}
                  preferredContactMethod={preferredContactMethod}
                  paymentMethod={paymentMethod}
                  categoryOptions={CATEGORY_OPTIONS}
                  timeSlotOptions={TIME_SLOT_OPTIONS}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onStreetAddressChange={setStreetAddress}
                  onCategoryChange={setCategory}
                  onPreferredDateChange={setPreferredDate}
                  onPreferredTimeSlotChange={setPreferredTimeSlot}
                  onBudgetMajorChange={setBudgetMajor}
                  onPreferredContactMethodChange={setPreferredContactMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
              ) : null}

              {mobileStep === 2 ? (
                <TaskLocationMapPicker
                  accessToken={mapboxAccessToken}
                  location={mapPlaceName}
                  locationLat={locationLat}
                  locationLng={locationLng}
                  onLocationChange={setMapPlaceName}
                  onLocationLatChange={setLocationLat}
                  onLocationLngChange={setLocationLng}
                />
              ) : null}

              {mobileStep === 3 ? (
                <CreateTaskSubmitPanel
                  loading={creating}
                  error={error}
                  onSubmit={() => void onSubmitTask()}
                />
              ) : null}

              {mobileStep < 3 ? (
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
                    {mobileStep === 1 ? 'Next: Location →' : 'Next: Submit →'}
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
