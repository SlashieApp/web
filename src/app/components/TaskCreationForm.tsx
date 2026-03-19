'use client'

import { useMutation } from '@apollo/client/react'
import { NativeSelect, Stack, Text, Textarea } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CREATE_TASK } from '@/graphql/jobs'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { type CreateTaskMutation, TaskPaymentMethod } from '@codegen/schema'
import { Button, FormField, GlassCard, TextInput } from '@ui'

function toIsoDateTime(dateTimeLocal: string) {
  if (!dateTimeLocal) return null
  const parsedDate = new Date(dateTimeLocal)
  if (Number.isNaN(parsedDate.getTime())) return null
  return parsedDate.toISOString()
}

export function TaskCreationForm() {
  const router = useRouter()
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState('Tap leaking under the sink')
  const [location, setLocation] = useState('Hackney, London')
  const [dateTimeLocal, setDateTimeLocal] = useState('')
  const [category, setCategory] = useState('Plumbing')
  const [priceOfferPence, setPriceOfferPence] = useState('4500')
  const [paymentMethod, setPaymentMethod] = useState<TaskPaymentMethod>(
    TaskPaymentMethod.Cash,
  )
  const [contactMethod, setContactMethod] = useState('Phone')
  const [error, setError] = useState<string | null>(null)

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)

  async function onCreateTask() {
    setError(null)

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedLocation = location.trim()
    const trimmedCategory = category.trim()
    const trimmedContactMethod = contactMethod.trim()
    const parsedPriceOfferPence = Number.parseInt(priceOfferPence, 10)
    const isoDateTime = toIsoDateTime(dateTimeLocal)

    if (!trimmedTitle || !trimmedDescription) {
      setError('Please add both a title and description.')
      return
    }
    if (!trimmedCategory) {
      setError('Please add a task category.')
      return
    }
    if (!trimmedContactMethod) {
      setError('Please add a contact method.')
      return
    }
    if (!isoDateTime) {
      setError('Please provide a valid date and time.')
      return
    }
    if (!Number.isFinite(parsedPriceOfferPence) || parsedPriceOfferPence <= 0) {
      setError('Please provide a valid expected price in pence.')
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

  return (
    <GlassCard p={6}>
      <Stack gap={4}>
        <Stack gap={1}>
          <Text fontSize="lg" fontWeight={700}>
            Create a new task
          </Text>
          <Text color="muted">
            Share the details and local tradespeople can start sending offers.
          </Text>
        </Stack>

        <FormField label="Task title">
          <TextInput
            placeholder="e.g. Fix a leaky tap"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </FormField>

        <FormField label="Description">
          <Textarea
            minH="120px"
            placeholder="Describe the job, access details, and timing."
            bg="glassBg"
            borderColor="glassBorder"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </FormField>

        <FormField label="Location (optional)">
          <TextInput
            placeholder="e.g. Hackney, London"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          />
        </FormField>

        <FormField
          label="When should the job happen?"
          helperText="Pick the preferred date and time for this job."
        >
          <TextInput
            type="datetime-local"
            value={dateTimeLocal}
            onChange={(event) => setDateTimeLocal(event.target.value)}
          />
        </FormField>

        <FormField label="Category">
          <TextInput
            placeholder="e.g. Plumbing"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          />
        </FormField>

        <FormField label="Expected price (pence)">
          <TextInput
            type="number"
            min={1}
            placeholder="e.g. 4500"
            value={priceOfferPence}
            onChange={(event) => setPriceOfferPence(event.target.value)}
          />
        </FormField>

        <FormField label="Payment method">
          <NativeSelect.Root>
            <NativeSelect.Field
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(event.target.value as TaskPaymentMethod)
              }
              bg="glassBg"
              borderColor="glassBorder"
            >
              <option value={TaskPaymentMethod.Cash}>Cash</option>
              <option value={TaskPaymentMethod.BankTransfer}>
                Bank transfer
              </option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        </FormField>

        <FormField label="Preferred contact method">
          <TextInput
            placeholder="e.g. Phone, WhatsApp, Email"
            value={contactMethod}
            onChange={(event) => setContactMethod(event.target.value)}
          />
        </FormField>

        <Button
          background="mustard.500"
          color="black"
          loading={creating}
          onClick={() => void onCreateTask()}
        >
          Create task
        </Button>

        {error ? (
          <Text color="red.400" fontSize="sm">
            {error}
          </Text>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
