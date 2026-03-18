'use client'

import { useMutation } from '@apollo/client/react'
import { Stack, Text, Textarea } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import { CREATE_TASK } from '@/graphql/jobs'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import type { CreateTaskMutation } from '@codegen/schema'
import { Button, FormField, GlassCard, TextInput } from '@ui'

function parsePhotoUrls(rawValue: string) {
  return rawValue
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function TaskCreationForm() {
  const router = useRouter()
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState('Tap leaking under the sink')
  const [location, setLocation] = useState('Hackney, London')
  const [photoUrls, setPhotoUrls] = useState('')
  const [error, setError] = useState<string | null>(null)

  const [runCreateTask, { loading: creating }] =
    useMutation<CreateTaskMutation>(CREATE_TASK)

  const parsedPhotos = useMemo(() => parsePhotoUrls(photoUrls), [photoUrls])

  async function onCreateTask() {
    setError(null)

    const trimmedTitle = title.trim()
    const trimmedDescription = description.trim()
    const trimmedLocation = location.trim()

    if (!trimmedTitle || !trimmedDescription) {
      setError('Please add both a title and description.')
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
            photos: parsedPhotos.length > 0 ? parsedPhotos : undefined,
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
          label="Photo URLs (optional)"
          helperText="Add one URL per line (or separate URLs with commas)."
        >
          <Textarea
            minH="100px"
            placeholder={
              'https://example.com/photo-1.jpg\nhttps://example.com/photo-2.jpg'
            }
            bg="glassBg"
            borderColor="glassBorder"
            value={photoUrls}
            onChange={(event) => setPhotoUrls(event.target.value)}
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
