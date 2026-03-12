'use client'

import { useMutation } from '@apollo/client/react'
import { Grid, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { CREATE_JOB } from '@/graphql/jobs'
import { Badge } from '@/ui/Badge/Badge'
import { Button } from '@/ui/Button/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { TextInput } from '@/ui/Input/TextInput'
import type { CreateJobMutation } from '@codegen/schema'

export function LandingHero() {
  const [title, setTitle] = useState('Fix a leaky tap')
  const [description, setDescription] = useState('Tap leaking under the sink')
  const [location, setLocation] = useState('Hackney, London')

  const [createJob, { loading: creating }] =
    useMutation<CreateJobMutation>(CREATE_JOB)

  return (
    <Grid
      templateColumns={{ base: '1fr', md: '1.1fr 0.9fr' }}
      gap={8}
      alignItems="center"
    >
      <Stack gap={5}>
        <Badge alignSelf="flex-start" bg="mustard.200" color="black">
          Local trades, sorted
        </Badge>
        <Heading size={{ base: '2xl', md: '3xl' }}>
          Book trusted local handymen in minutes.
        </Heading>
        <Text color="muted" fontSize="lg">
          Post a job, get offers, and book a vetted handyman. HandyBox keeps
          your job details, messages, and updates in one place.
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <Button
            as={NextLink}
            href="/register"
            background="linkBlue.600"
            color="white"
          >
            Get started
          </Button>
          <Button
            as={NextLink}
            href="/tasks"
            variant="outline"
            borderColor="border"
          >
            Browse tasks
          </Button>
        </HStack>
      </Stack>

      <GlassCard p={6}>
        <Stack gap={4}>
          <Heading size="md">Post a quick job</Heading>
          <TextInput
            placeholder="Job title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextInput
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <TextInput
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <Button
            background="mustard.500"
            color="black"
            loading={creating}
            onClick={() =>
              createJob({
                variables: {
                  input: {
                    title,
                    description,
                    location: location || undefined,
                    photos: [],
                  },
                },
              })
            }
          >
            Submit job
          </Button>
        </Stack>
      </GlassCard>
    </Grid>
  )
}
