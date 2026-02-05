'use client'

import {
  Badge,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
} from '@chakra-ui/react'
import NextLink from 'next/link'

import { UiButton } from '../Button/Button'
import { GlassCard } from '../Card/GlassCard'
import { TextInput } from '../Input/TextInput'

export type TaskSummary = {
  slug: string
  title: string
  summary: string
  budget: string
  tags: string[]
}

export const sampleTasks: TaskSummary[] = [
  {
    slug: 'mount-55-inch-tv',
    title: 'Mount a 55" TV',
    summary: 'Need a wall mount installed with cable tidy. Prefer weekend.',
    budget: '£45–£75',
    tags: ['Assembly', 'Mounting', 'Hackney'],
  },
  {
    slug: 'flat-pack-wardrobe',
    title: 'Flat-pack wardrobe build',
    summary: 'Two-door wardrobe build and disposal of packaging.',
    budget: '£60–£90',
    tags: ['Assembly', 'Furniture', 'Islington'],
  },
  {
    slug: 'regrout-shower',
    title: 'Regrout shower tiles',
    summary: 'Small bathroom shower needs regrouting and resealing.',
    budget: '£80–£120',
    tags: ['Plumbing', 'Bathroom', 'Camden'],
  },
  {
    slug: 'replace-door-handle',
    title: 'Replace internal door handle',
    summary: 'Handle is loose and needs a new latch fitted.',
    budget: '£30–£45',
    tags: ['Carpentry', 'Repairs', 'Hackney'],
  },
]

export type TaskBoardProps = {
  title?: string
  tasks?: TaskSummary[]
  showFilters?: boolean
}

export function TaskBoard({
  title = 'Task board',
  tasks = sampleTasks,
  showFilters = true,
}: TaskBoardProps) {
  return (
    <GlassCard p={6}>
      <Stack gap={6}>
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <Heading size="md">{title}</Heading>
          <HStack gap={2} flexWrap="wrap">
            <Badge
              bg="mustard.200"
              color="black"
              px={2}
              py={1}
              borderRadius="999px"
            >
              New
            </Badge>
            <Badge variant="outline">Plumbing</Badge>
            <Badge variant="outline">Electrical</Badge>
            <Badge variant="outline">Assembly</Badge>
          </HStack>
        </HStack>

        {showFilters ? (
          <HStack gap={3} flexWrap="wrap">
            <TextInput placeholder="Category" />
            <TextInput placeholder="Skill needed" />
            <TextInput placeholder="Min £" />
            <TextInput placeholder="Max £" />
            <UiButton variant="outline" borderColor="border">
              Filter
            </UiButton>
          </HStack>
        ) : null}

        <SimpleGrid columns={{ base: 1, md: 2 }} gap={5}>
          {tasks.map((task) => (
            <GlassCard key={task.slug} p={5}>
              <Stack gap={3}>
                <HStack justify="space-between">
                  <Heading size="sm">{task.title}</Heading>
                  <Badge
                    bg="mustard.200"
                    color="black"
                    px={2}
                    py={1}
                    borderRadius="999px"
                  >
                    {task.budget}
                  </Badge>
                </HStack>
                <Text color="muted">{task.summary}</Text>
                <HStack gap={2} flexWrap="wrap">
                  {task.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </HStack>
                <HStack gap={3}>
                  <UiButton
                    as={NextLink}
                    href={`/task/${task.slug}#offer`}
                    size="sm"
                    background="linkBlue.600"
                    color="white"
                  >
                    Make offer
                  </UiButton>
                  <UiButton
                    as={NextLink}
                    href={`/task/${task.slug}`}
                    size="sm"
                    variant="outline"
                    borderColor="border"
                  >
                    View
                  </UiButton>
                </HStack>
              </Stack>
            </GlassCard>
          ))}
        </SimpleGrid>
      </Stack>
    </GlassCard>
  )
}
