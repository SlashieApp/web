'use client'

import { useMutation } from '@apollo/client/react'
import { Box, Grid, Heading, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import { CREATE_QUOTE } from '@/graphql/jobs'
import { Button } from '@/ui/Button/Button'
import type { CreateQuoteMutation } from '@codegen/schema'
import { GlassCard } from '../../ui/Card/GlassCard'
import { TextInput } from '../../ui/Input/TextInput'

export function LandingWorkerActions() {
  const [jobId, setJobId] = useState('')
  const [pricePence, setPricePence] = useState('4500')
  const [message, setMessage] = useState('Can do this tomorrow afternoon')

  const [createQuote, { loading: quoting }] =
    useMutation<CreateQuoteMutation>(CREATE_QUOTE)

  return (
    <GlassCard p={6}>
      <Stack gap={4}>
        <Heading size="md">Handyman: submit a quote</Heading>
        <Text color="muted">
          Enter a job ID from the list above and submit your quote. Requires an
          authenticated session.
        </Text>
        <Grid templateColumns={{ base: '1fr', md: '1fr' }} gap={4}>
          <Stack gap={3}>
            <TextInput
              placeholder="Job ID"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
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
              background="linkBlue.600"
              color="white"
              loading={quoting}
              onClick={() =>
                createQuote({
                  variables: {
                    input: {
                      jobId,
                      pricePence: Number(pricePence) || 0,
                      message: message || undefined,
                    },
                  },
                })
              }
            >
              Submit quote
            </Button>
          </Stack>
        </Grid>
        <Box borderBottomWidth="1px" borderColor="border" />
        <Text color="muted" fontSize="sm">
          Note: these actions require an authenticated user session (JWT in
          cookie).
        </Text>
      </Stack>
    </GlassCard>
  )
}
