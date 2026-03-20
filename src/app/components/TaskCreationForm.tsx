'use client'

import { useMutation } from '@apollo/client/react'
import {
  Box,
  HStack,
  NativeSelect,
  SimpleGrid,
  Stack,
  Textarea,
} from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CREATE_TASK } from '@/graphql/jobs'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { type CreateTaskMutation, TaskPaymentMethod } from '@codegen/schema'
import { Button, FormField, GlassCard, Heading, Text, TextInput } from '@ui'

const TOTAL_STEPS = 3

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

type TimeSlot = (typeof TIME_SLOT_OPTIONS)[number]['value']

function toIsoDateTime(preferredDate: string, preferredTimeSlot: TimeSlot) {
  if (!preferredDate) return null
  const timeConfig = TIME_SLOT_OPTIONS.find(
    (slot) => slot.value === preferredTimeSlot,
  )
  if (!timeConfig) return null
  const parsedDate = new Date(`${preferredDate}T${timeConfig.hour}`)
  if (Number.isNaN(parsedDate.getTime())) return null
  return parsedDate.toISOString()
}

export function TaskCreationForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState('Tap leaking under the sink')
  const [location, setLocation] = useState('Hackney, London')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTimeSlot, setPreferredTimeSlot] =
    useState<TimeSlot>('MORNING')
  const [category, setCategory] = useState('Plumbing')
  const [priceOfferPence, setPriceOfferPence] = useState('4500')
  const [paymentMethod, setPaymentMethod] = useState<TaskPaymentMethod>(
    TaskPaymentMethod.Cash,
  )
  const [contactMethod, setContactMethod] = useState('Phone')
  const [error, setError] = useState<string | null>(null)

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)

  function validateStep(targetStep: number) {
    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedCategory = category.trim()
    const trimmedContactMethod = contactMethod.trim()
    const parsedPriceOfferPence = Number.parseInt(priceOfferPence, 10)

    if (targetStep === 1) {
      if (!trimmedTitle) {
        setError('Please add a task title.')
        return false
      }
      if (!trimmedCategory) {
        setError('Please choose a category.')
        return false
      }
    }

    if (targetStep === 2) {
      if (!trimmedDescription) {
        setError('Please describe what needs to be done.')
        return false
      }
      if (!preferredDate) {
        setError('Please provide a preferred date.')
        return false
      }
    }

    if (targetStep === 3) {
      if (!trimmedContactMethod) {
        setError('Please add a contact method.')
        return false
      }
      if (
        !Number.isFinite(parsedPriceOfferPence) ||
        Number.isNaN(parsedPriceOfferPence) ||
        parsedPriceOfferPence <= 0
      ) {
        setError('Please provide a valid expected price in pence.')
        return false
      }
    }

    setError(null)
    return true
  }

  function onNextStep() {
    if (!validateStep(step)) return
    setStep((currentStep) => Math.min(currentStep + 1, TOTAL_STEPS))
  }

  function onPreviousStep() {
    setError(null)
    setStep((currentStep) => Math.max(currentStep - 1, 1))
  }

  async function onSubmitTask() {
    setError(null)

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedLocation = location.trim()
    const trimmedCategory = category.trim()
    const trimmedContactMethod = contactMethod.trim()
    const parsedPriceOfferPence = Number.parseInt(priceOfferPence, 10)
    const isoDateTime = toIsoDateTime(preferredDate, preferredTimeSlot)

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setStep(1)
      return
    }

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
            title: trimmedTitle,
            description: trimmedDescription,
            location: trimmedLocation || undefined,
            dateTime: isoDateTime,
            category: trimmedCategory,
            priceOfferPence: parsedPriceOfferPence,
            paymentMethod,
            contactMethod: trimmedContactMethod,
          },
        },
      })
      const createdTaskId = res.data?.createTask?.id
      if (!createdTaskId) {
        throw new Error('Task creation failed. Please try again.')
      }
      router.push(`/task/${createdTaskId}`)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Task creation failed.'))
    }
  }

  const progressPercentage = Math.round((step / TOTAL_STEPS) * 100)

  return (
    <Stack gap={8}>
      <GlassCard p={{ base: 5, md: 8 }} bg="surfaceContainerLowest">
        <Stack gap={8}>
          <Stack gap={2}>
            <HStack justify="space-between" align="center">
              <Text fontSize="sm" fontWeight={800} color="primary.700">
                STEP {step} OF {TOTAL_STEPS}
              </Text>
              <Text fontSize="sm" color="muted" fontWeight={700}>
                {progressPercentage}% Complete
              </Text>
            </HStack>
            <Box h="8px" borderRadius="full" bg="surfaceContainerLow">
              <Box
                h="100%"
                borderRadius="full"
                bg="linear-gradient(95deg, #1A56DB 0%, #003FB1 100%)"
                width={`${progressPercentage}%`}
                transition="width 220ms ease"
              />
            </Box>
          </Stack>

          {step === 1 ? (
            <Stack gap={6}>
              <Stack gap={1}>
                <Heading size="2xl">Step 1: Task basics</Heading>
                <Text color="muted">
                  Start with the essentials so we can match you with the right
                  professionals.
                </Text>
              </Stack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                <FormField label="Task title">
                  <TextInput
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Fix a leaky tap"
                  />
                </FormField>
                <FormField label="Location (optional)">
                  <TextInput
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="e.g. Hackney, London"
                  />
                </FormField>
              </SimpleGrid>

              <FormField label="Category">
                <HStack gap={2} flexWrap="wrap">
                  {CATEGORY_OPTIONS.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      size="sm"
                      variant="subtle"
                      bg={
                        category === option
                          ? 'secondaryFixed'
                          : 'surfaceContainerLow'
                      }
                      color={category === option ? 'onSecondaryFixed' : 'fg'}
                      boxShadow="none"
                      onClick={() => setCategory(option)}
                    >
                      {option}
                    </Button>
                  ))}
                </HStack>
              </FormField>
            </Stack>
          ) : null}

          {step === 2 ? (
            <Stack gap={6}>
              <Stack gap={1}>
                <Heading size="2xl">Job Details &amp; Scope</Heading>
                <Text color="muted">
                  Help professionals understand exactly what you need by
                  providing clear details and visuals of the task.
                </Text>
              </Stack>

              <GlassCard p={{ base: 4, md: 6 }} bg="surfaceContainerLow">
                <Stack gap={6}>
                  <FormField label="What needs to be done?">
                    <Textarea
                      value={description}
                      onChange={(event) => setDescription(event.target.value)}
                      placeholder="E.g. My kitchen faucet has a persistent drip and the handle is loose..."
                      minH="120px"
                      bg="surfaceContainerLowest"
                      borderWidth="1px"
                      borderColor="border"
                      borderRadius="lg"
                    />
                  </FormField>

                  <SimpleGrid columns={{ base: 1, md: 4 }} gap={3}>
                    <Stack gap={1} gridColumn={{ base: 'auto', md: 'span 1' }}>
                      <Heading size="sm">Add Photos</Heading>
                      <Text fontSize="sm" color="muted">
                        Visuals help pros provide more accurate quotes. Up to 5
                        photos.
                      </Text>
                    </Stack>
                    <Box
                      borderRadius="lg"
                      borderWidth="1px"
                      borderStyle="dashed"
                      borderColor="outlineVariant"
                      bg="surfaceContainerLowest"
                      minH="90px"
                      display="grid"
                      placeItems="center"
                    >
                      <Text fontSize="sm" color="muted">
                        Upload
                      </Text>
                    </Box>
                    <Box
                      borderRadius="lg"
                      bg="linear-gradient(135deg, #1A56DB 0%, #0f3f9f 100%)"
                      minH="90px"
                    />
                    <Box
                      borderRadius="lg"
                      bg="linear-gradient(135deg, #F2994A 0%, #855300 100%)"
                      minH="90px"
                    />
                  </SimpleGrid>

                  <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                    <FormField label="Preferred Date">
                      <TextInput
                        type="date"
                        value={preferredDate}
                        onChange={(event) =>
                          setPreferredDate(event.target.value)
                        }
                      />
                    </FormField>
                    <FormField label="Preferred Time">
                      <NativeSelect.Root>
                        <NativeSelect.Field
                          bg="surfaceContainerLowest"
                          borderWidth="1px"
                          borderColor="border"
                          borderRadius="lg"
                          value={preferredTimeSlot}
                          onChange={(event) =>
                            setPreferredTimeSlot(event.target.value as TimeSlot)
                          }
                        >
                          {TIME_SLOT_OPTIONS.map((slot) => (
                            <option key={slot.value} value={slot.value}>
                              {slot.label}
                            </option>
                          ))}
                        </NativeSelect.Field>
                      </NativeSelect.Root>
                    </FormField>
                  </SimpleGrid>
                </Stack>
              </GlassCard>

              <GlassCard p={4} bg="surfaceContainerLow">
                <HStack justify="space-between" align="center">
                  <HStack gap={3}>
                    <Box
                      w="36px"
                      h="36px"
                      borderRadius="md"
                      bg="secondaryContainer"
                      display="grid"
                      placeItems="center"
                      color="onSecondaryFixed"
                      fontWeight={800}
                    >
                      ⚒
                    </Box>
                    <Stack gap={0}>
                      <Text fontSize="xs" color="muted" fontWeight={700}>
                        SELECTED CATEGORY
                      </Text>
                      <Heading size="sm">
                        {category || 'Choose category'}
                      </Heading>
                    </Stack>
                  </HStack>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStep(1)}
                  >
                    Change
                  </Button>
                </HStack>
              </GlassCard>
            </Stack>
          ) : null}

          {step === 3 ? (
            <Stack gap={6}>
              <Stack gap={1}>
                <Heading size="2xl">Step 3: Budget &amp; contact</Heading>
                <Text color="muted">
                  Finalise budget and payment preferences before posting your
                  task.
                </Text>
              </Stack>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
                <FormField label="Expected budget (pence)">
                  <TextInput
                    type="number"
                    min={1}
                    value={priceOfferPence}
                    onChange={(event) => setPriceOfferPence(event.target.value)}
                    placeholder="e.g. 4500"
                  />
                </FormField>
                <FormField label="Preferred contact method">
                  <TextInput
                    value={contactMethod}
                    onChange={(event) => setContactMethod(event.target.value)}
                    placeholder="Phone, WhatsApp, Email"
                  />
                </FormField>
              </SimpleGrid>

              <FormField label="Payment method">
                <HStack gap={2} flexWrap="wrap">
                  <Button
                    type="button"
                    size="sm"
                    variant="subtle"
                    bg={
                      paymentMethod === TaskPaymentMethod.Cash
                        ? 'secondaryFixed'
                        : 'surfaceContainerLow'
                    }
                    color={
                      paymentMethod === TaskPaymentMethod.Cash
                        ? 'onSecondaryFixed'
                        : 'fg'
                    }
                    boxShadow="none"
                    onClick={() => setPaymentMethod(TaskPaymentMethod.Cash)}
                  >
                    Cash
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="subtle"
                    bg={
                      paymentMethod === TaskPaymentMethod.BankTransfer
                        ? 'secondaryFixed'
                        : 'surfaceContainerLow'
                    }
                    color={
                      paymentMethod === TaskPaymentMethod.BankTransfer
                        ? 'onSecondaryFixed'
                        : 'fg'
                    }
                    boxShadow="none"
                    onClick={() =>
                      setPaymentMethod(TaskPaymentMethod.BankTransfer)
                    }
                  >
                    Bank transfer
                  </Button>
                </HStack>
              </FormField>
            </Stack>
          ) : null}

          {error ? (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          ) : null}

          <HStack justify="space-between" pt={2}>
            <Button
              type="button"
              variant="ghost"
              onClick={onPreviousStep}
              disabled={step === 1}
            >
              ← Back
            </Button>

            {step < TOTAL_STEPS ? (
              <Button type="button" onClick={onNextStep}>
                {step === 1 ? 'Next: Details →' : 'Next: Budget →'}
              </Button>
            ) : (
              <Button
                type="button"
                loading={creating}
                onClick={() => void onSubmitTask()}
              >
                Post task
              </Button>
            )}
          </HStack>
        </Stack>
      </GlassCard>
    </Stack>
  )
}
