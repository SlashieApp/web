'use client'

import { useState } from 'react'

import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import type { WorkerQuoteListFilter } from '../../helpers/workerQuoteJobs'

import { WorkerQuoteFilters } from './WorkerQuoteFilters'
import { storyQuoteRow, storyQuoteRowsMixed } from './workerQuoteStoryFixtures'

function WorkerQuoteFiltersPlayground({
  rows,
  initialFilter = 'all',
}: {
  rows: ReturnType<typeof storyQuoteRowsMixed>
  initialFilter?: WorkerQuoteListFilter
}) {
  const [filter, setFilter] = useState<WorkerQuoteListFilter>(initialFilter)
  return (
    <WorkerQuoteFilters
      rows={rows}
      filter={filter}
      onFilterChange={setFilter}
    />
  )
}

const mixedRows = storyQuoteRowsMixed()

const meta = {
  title: 'quotes/WorkerQuoteFilters',
  component: WorkerQuoteFilters,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground rows={mixedRows} />
    </Box>
  ),
} satisfies Meta<typeof WorkerQuoteFilters>

export default meta

type Story = StoryObj<typeof meta>

export const AllSelected: Story = {
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground rows={mixedRows} initialFilter="all" />
    </Box>
  ),
}

export const PendingSelected: Story = {
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground rows={mixedRows} initialFilter="pending" />
    </Box>
  ),
}

export const BookedSelected: Story = {
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground rows={mixedRows} initialFilter="booked" />
    </Box>
  ),
}

export const DoneSelected: Story = {
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground rows={mixedRows} initialFilter="done" />
    </Box>
  ),
}

export const OnlyPendingQuotes: Story = {
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground
        rows={[storyQuoteRow({ workerOrder: null })]}
        initialFilter="all"
      />
    </Box>
  ),
}

export const EmptyList: Story = {
  render: () => (
    <Box maxW="640px" w="full">
      <WorkerQuoteFiltersPlayground rows={[]} initialFilter="all" />
    </Box>
  ),
}
