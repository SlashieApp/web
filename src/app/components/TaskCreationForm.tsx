'use client'

import { useMutation } from '@apollo/client/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { CREATE_TASK } from '@/graphql/jobs'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import { type CreateTaskMutation, TaskPaymentMethod } from '@codegen/schema'
import { PostJobForm } from '@ui'

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
    <PostJobForm
      title={title}
      description={description}
      location={location}
      dateTimeLocal={dateTimeLocal}
      category={category}
      priceOfferPence={priceOfferPence}
      paymentMethod={paymentMethod}
      contactMethod={contactMethod}
      paymentMethodOptions={[
        { value: TaskPaymentMethod.Cash, label: 'Cash' },
        { value: TaskPaymentMethod.BankTransfer, label: 'Bank transfer' },
      ]}
      contactMethodOptions={[
        { value: 'Phone', label: 'Phone' },
        { value: 'WhatsApp', label: 'WhatsApp' },
        { value: 'Email', label: 'Email' },
      ]}
      onTitleChange={setTitle}
      onDescriptionChange={setDescription}
      onLocationChange={setLocation}
      onDateTimeLocalChange={setDateTimeLocal}
      onCategoryChange={setCategory}
      onPriceOfferPenceChange={setPriceOfferPence}
      onPaymentMethodChange={(value) =>
        setPaymentMethod(value as TaskPaymentMethod)
      }
      onContactMethodChange={setContactMethod}
      onSubmit={() => void onCreateTask()}
      isSubmitting={creating}
      error={error}
    />
  )
}
