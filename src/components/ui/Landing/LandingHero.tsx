'use client'

import { gql } from '@apollo/client/core'
import { useMutation } from '@apollo/client/react'
import { Badge, Grid, Heading, HStack, Stack, Text } from '@chakra-ui/react'
import NextLink from 'next/link'
import { useState } from 'react'

import { UiButton } from '../Button/Button'
import { GlassCard } from '../Card/GlassCard'
import { TextInput } from '../Input/TextInput'

const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
    }
  }
`

export function LandingHero() {
  const [title, setTitle] = useState('Fix a leaky tap')
  const [location, setLocation] = useState('Hackney, London')
  const [budgetMin, setBudgetMin] = useState('3000')
  const [budgetMax, setBudgetMax] = useState('6000')

  const [createTask, { loading: creating }] = useMutation(CREATE_TASK)

  return (
    <Grid
      templateColumns={{ base: '1fr', md: '1.1fr 0.9fr' }}
      gap={8}
      alignItems="center"
    >
      <Stack gap={5}>
        <Badge
          alignSelf="flex-start"
          bg="mustard.200"
          color="black"
          px={3}
          py={1}
          borderRadius="999px"
          fontWeight={600}
        >
          Local trades, sorted
        </Badge>
        <Heading size={{ base: '2xl', md: '3xl' }}>
          Book trusted local handymen in minutes.
        </Heading>
        <Text color="muted" fontSize="lg">
          Post a job, get offers, and book a vetted handyman. HandyBox keeps your
          job details, messages, and updates in one place.
        </Text>
        <HStack gap={3} flexWrap="wrap">
          <UiButton
            as={NextLink}
            href="/register"
            background="linkBlue.600"
            color="white"
          >
            Get started
          </UiButton>
          <UiButton
            as={NextLink}
            href="/tasks"
            variant="outline"
            borderColor="border"
          >
            Browse tasks
          </UiButton>
        </HStack>
      </Stack>

      <GlassCard p={6} id="post-task">
        <Stack gap={4}>
          <Heading size="md">Post a quick task</Heading>
          <TextInput
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextInput
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <HStack gap={3}>
            <TextInput
              placeholder="Min budget (pence)"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
            />
            <TextInput
              placeholder="Max budget (pence)"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
            />
          </HStack>
          <UiButton
            background="mustard.500"
            color="black"
            loading={creating}
            onClick={() =>
              createTask({
                variables: {
                  input: {
                    title,
                    description: 'Tap leaking under the sink',
                    location,
                    category: 'Plumbing',
                    skills: ['Plumbing'],
                    budgetMinPence: Number(budgetMin) || null,
                    budgetMaxPence: Number(budgetMax) || null,
                    photos: [],
                  },
                },
              })
            }
          >
            Submit task
          </UiButton>
        </Stack>
      </GlassCard>
    </Grid>
  )
}
