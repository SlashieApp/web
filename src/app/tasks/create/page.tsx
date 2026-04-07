'use client'

import { useMutation } from '@apollo/client/react'
import { Box, HStack, Link, SimpleGrid, Stack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { TaskLocationMapPicker } from '@/app/components'
import {
  CreateTaskDetailsPanel,
  CreateTaskSubmitPanel,
} from '@/app/tasks/create/components'
import { CREATE_TASK } from '@/graphql/tasks'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { type CreateTaskMutation, TaskPaymentMethod } from '@codegen/schema'
import { Button, Footer, Header, Heading, Section, Text } from '@ui'

const CATEGORY_OPTIONS = [
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Gardening',
] as const

const TIME_SLOT_OPTIONS = [
  { value: 'MORNING', label: 'Morning (8am - 12pm)', hour: '09:00:00' },
  { value: 'AFTERNOON', label: 'Afternoon (12pm - 4pm)', hour: '13:00:00' },
  { value: 'EVENING', label: 'Evening (4pm - 8pm)', hour: '18:00:00' },
  { value: 'ANYTIME', label: 'Anytime', hour: '12:00:00' },
] as const

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

export default function CreateTaskPage() {
  const router = useRouter()
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

  const [mobileStep, setMobileStep] = useState<MobileStep>(1)
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState('Tap leaking under the sink')
  const [category, setCategory] = useState('Plumbing')
  const [location, setLocation] = useState('Hackney, London')
  const [locationLat, setLocationLat] = useState('51.5416')
  const [locationLng, setLocationLng] = useState('-0.0572')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('MORNING')
  const [priceOfferPence, setPriceOfferPence] = useState('4500')
  const [paymentMethod, setPaymentMethod] = useState<TaskPaymentMethod>(
    TaskPaymentMethod.Cash,
  )
  const [contactMethod, setContactMethod] = useState('Phone')
  const [error, setError] = useState<string | null>(null)

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)
  const totalMobileSteps = 3

  function validateDetails() {
    if (!title.trim()) {
      setError('Please add a task title.')
      return false
    }
    if (!category.trim()) {
      setError('Please choose a category.')
      return false
    }
    if (!description.trim()) {
      setError('Please describe what needs to be done.')
      return false
    }
    if (!preferredDate) {
      setError('Please provide a preferred date.')
      return false
    }
    if (!contactMethod.trim()) {
      setError('Please add a contact method.')
      return false
    }
    const parsedPriceOfferPence = Number.parseInt(priceOfferPence, 10)
    if (
      !Number.isFinite(parsedPriceOfferPence) ||
      Number.isNaN(parsedPriceOfferPence) ||
      parsedPriceOfferPence <= 0
    ) {
      setError('Please provide a valid expected price in pence.')
      return false
    }
    return true
  }

  function validateLocation() {
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

    if (!getAuthToken()) {
      setError('Please log in before posting a task.')
      router.push(`/login?next=${encodeURIComponent('/tasks/create')}`)
      return
    }

    try {
      const res = await runCreateTask({
        variables: {
          input: {
            title: title.trim(),
            description: description.trim(),
            location: location.trim(),
            locationLat: Number.parseFloat(locationLat),
            locationLng: Number.parseFloat(locationLng),
            dateTime: isoDateTime,
            category: category.trim(),
            priceOfferPence: Number.parseInt(priceOfferPence, 10),
            paymentMethod,
            contactMethod: contactMethod.trim(),
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
                  category={category}
                  preferredDate={preferredDate}
                  preferredTimeSlot={preferredTimeSlot}
                  priceOfferPence={priceOfferPence}
                  contactMethod={contactMethod}
                  paymentMethod={paymentMethod}
                  categoryOptions={CATEGORY_OPTIONS}
                  timeSlotOptions={TIME_SLOT_OPTIONS}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onCategoryChange={setCategory}
                  onPreferredDateChange={setPreferredDate}
                  onPreferredTimeSlotChange={setPreferredTimeSlot}
                  onPriceOfferPenceChange={setPriceOfferPence}
                  onContactMethodChange={setContactMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
                <Stack gap={6}>
                  <TaskLocationMapPicker
                    accessToken={mapboxAccessToken}
                    location={location}
                    locationLat={locationLat}
                    locationLng={locationLng}
                    onLocationChange={setLocation}
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
                  category={category}
                  preferredDate={preferredDate}
                  preferredTimeSlot={preferredTimeSlot}
                  priceOfferPence={priceOfferPence}
                  contactMethod={contactMethod}
                  paymentMethod={paymentMethod}
                  categoryOptions={CATEGORY_OPTIONS}
                  timeSlotOptions={TIME_SLOT_OPTIONS}
                  onTitleChange={setTitle}
                  onDescriptionChange={setDescription}
                  onCategoryChange={setCategory}
                  onPreferredDateChange={setPreferredDate}
                  onPreferredTimeSlotChange={setPreferredTimeSlot}
                  onPriceOfferPenceChange={setPriceOfferPence}
                  onContactMethodChange={setContactMethod}
                  onPaymentMethodChange={setPaymentMethod}
                />
              ) : null}

              {mobileStep === 2 ? (
                <TaskLocationMapPicker
                  accessToken={mapboxAccessToken}
                  location={location}
                  locationLat={locationLat}
                  locationLng={locationLng}
                  onLocationChange={setLocation}
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
