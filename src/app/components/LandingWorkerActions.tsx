'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Grid, Stack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { ADD_OFFER } from '@/graphql/jobs'
import { getAuthToken } from '@/utils/auth'
import { getFriendlyErrorMessage } from '@/utils/graphqlErrors'
import type { AddOfferMutation } from '@codegen/schema'
import { Button, GlassCard, Heading, Text, TextInput } from '@ui'

export function LandingWorkerActions() {
  const router = useRouter()
  const [taskId, setTaskId] = useState('')
  const [pricePence, setPricePence] = useState('4500')
  const [message, setMessage] = useState('Can do this tomorrow afternoon')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [addOffer, { loading: quoting }] =
    useMutation<AddOfferMutation>(ADD_OFFER)

  async function onAddOffer() {
    setError(null)
    setSuccess(null)

    if (!getAuthToken()) {
      setError('Please log in before submitting an offer.')
      router.push(`/login?next=${encodeURIComponent('/#worker-actions')}`)
      return
    }

    if (!taskId.trim()) {
      setError('Task ID is required.')
      return
    }

    try {
      const res = await addOffer({
        variables: {
          input: {
            taskId: taskId.trim(),
            pricePence: Number(pricePence) || 0,
            message: message || undefined,
          },
        },
      })

      if (!res.data?.addOffer?.id) {
        throw new Error('Offer submission failed. Please try again.')
      }

      setSuccess('Offer submitted successfully.')
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err, 'Offer submission failed.'))
    }
  }

  return (
    <GlassCard p={6} bg="surfaceContainerLowest">
      <Stack gap={4}>
        <Heading size="md">Handyman: submit an offer</Heading>
        <Text color="muted">
          Enter a task ID from the list above and submit your offer. Requires an
          authenticated session.
        </Text>
        <Grid templateColumns={{ base: '1fr', md: '1fr' }} gap={4}>
          <Stack gap={3}>
            <TextInput
              placeholder="Task ID"
              value={taskId}
              onChange={(e) => setTaskId(e.target.value)}
            />
            <TextInput
              placeholder="Price (pence)"
              value={pricePence}
              onChange={(e) => setPricePence(e.target.value)}
            />
            <TextInput
              placeholder="Message to the client"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              size="sm"
              loading={quoting}
              onClick={() => void onAddOffer()}
            >
              Submit offer
            </Button>
            {error ? (
              <Text color="red.400" fontSize="sm">
                {error}
              </Text>
            ) : null}
            {success ? (
              <Text color="green.400" fontSize="sm">
                {success}
              </Text>
            ) : null}
          </Stack>
        </Grid>
        <Box h="8px" />
        <Text color="muted" fontSize="sm">
          Note: these actions require an authenticated user session (JWT in
          cookie).
        </Text>
      </Stack>
    </GlassCard>
  )
}
