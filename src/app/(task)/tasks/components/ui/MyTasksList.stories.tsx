import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import type { MyTaskHubSection } from '../../helpers/myTasksHub'
import { buildAchievementPanels } from '../../helpers/taskAchievements'
import { MyTasksAchievements } from './MyTasksAchievements'
import { MyTasksFilters } from './MyTasksFilters'
import { MyTasksList } from './MyTasksList'
import { type MyTasksMobileView, MyTasksViewSwitch } from './MyTasksViewSwitch'

const sections: MyTaskHubSection[] = [
  {
    id: 'open',
    rows: [
      {
        id: 'overdue',
        title: 'Fix a leaking kitchen tap',
        description: 'Tap drips into the cabinet.',
        location: 'Mong Kok',
        priceLabel: '£80',
        categories: ['HANDYMAN'],
        categoryLabel: 'Handyman',
        ownerUserId: 'me',
        ownerName: 'Sam',
        roles: ['hosted'],
        section: 'open',
        timing: { kind: 'overdue' },
        quoteCount: 3,
        acceptedWorkerName: null,
      },
      {
        id: 'dual',
        title: 'Move two boxes across the harbour',
        description: '',
        location: 'Wan Chai',
        priceLabel: '£120',
        categories: ['MOVING'],
        categoryLabel: 'Moving',
        ownerUserId: 'me',
        ownerName: 'Sam',
        roles: ['hosted', 'quoted'],
        section: 'open',
        timing: { kind: 'tomorrow' },
        quoteCount: 1,
        acceptedWorkerName: null,
      },
      {
        id: 'quoted',
        title: 'Assemble a standing desk',
        description: '',
        location: 'Central',
        priceLabel: '£60',
        categories: ['HANDYMAN'],
        categoryLabel: 'Handyman',
        ownerUserId: 'alex',
        ownerName: 'Alex',
        roles: ['quoted'],
        section: 'open',
        timing: { kind: 'flexible' },
        quoteCount: 0,
        acceptedWorkerName: null,
      },
    ],
  },
  {
    id: 'booked',
    rows: [
      {
        id: 'booked',
        title: 'Weekend dog walk',
        description: '',
        location: 'Victoria Park',
        priceLabel: '£40',
        categories: ['GENERAL'],
        categoryLabel: 'General / other',
        ownerUserId: 'me',
        ownerName: 'Sam',
        roles: ['hosted'],
        section: 'booked',
        timing: { kind: 'today' },
        quoteCount: 2,
        acceptedWorkerName: 'Alex',
      },
    ],
  },
  {
    id: 'completed',
    rows: [
      {
        id: 'done',
        title: 'Deep-clean a studio',
        description: '',
        location: 'Sai Ying Pun',
        priceLabel: '£150',
        categories: ['CLEANING'],
        categoryLabel: 'Cleaning',
        ownerUserId: 'alex',
        ownerName: 'Alex',
        roles: ['quoted'],
        section: 'completed',
        timing: { kind: 'scheduled', at: '2026-09-12T09:00:00.000Z' },
        quoteCount: 0,
        acceptedWorkerName: null,
      },
    ],
  },
]

/** The hub's sections (Open, Booked, Completed) with a card per task. */
const meta = {
  title: 'My tasks/MyTasksList',
  component: MyTasksList,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    sections,
    onOpen: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '720px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MyTasksList>

export default meta
type Story = StoryObj<typeof meta>

/** Three sections of tasks you posted or quoted; pressing a card opens it. */
export const Default: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Open (3)' })
    await canvas.findByRole('heading', { name: 'Booked / In progress (1)' })
    await canvas.findByRole('heading', { name: 'Completed (1)' })
    await userEvent.click(
      await canvas.findByRole('button', { name: /Weekend dog walk/ }),
    )
    await expect(args.onOpen).toHaveBeenCalledWith('booked')
  },
}

/** Only one section has tasks: the others are left out. */
export const OneSection: Story = {
  args: { sections: sections.filter((section) => section.id === 'open') },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', { name: 'Open (3)' })
    expect(canvas.queryByRole('heading', { name: /Completed/ })).toBeNull()
  },
}

/** First load: skeleton cards. */
export const Loading: Story = {
  args: { sections: [], loading: true },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Loading your tasks…')
  },
}

/** No tasks at all: Post a task or Browse tasks. */
export const Empty: Story = {
  args: { sections: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('link', { name: 'Post a task' })
    await canvas.findByRole('link', { name: 'Browse tasks' })
  },
}

/** The load failed and there is nothing to show: message and Try again. */
export const LoadError: Story = {
  args: {
    sections: [],
    errorMessage: 'Could not load your tasks.',
    onRetry: fn(),
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Try again' }),
    )
    await expect(args.onRetry).toHaveBeenCalledOnce()
  },
}

/** A refresh failed but earlier tasks are still shown: an inline notice above them. */
export const RefreshFailed: Story = {
  args: {
    errorMessage: 'Could not refresh your tasks.',
    onRetry: fn(),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('alert')
    await canvas.findByRole('button', { name: 'Try again' })
    await canvas.findByRole('heading', { name: 'Open (3)' })
  },
}

const activity = buildAchievementPanels({
  showWorker: true,
  showCustomer: true,
  quoteAllowance: { used: 3, cap: 5, unlimited: false },
  worker: {
    completedJobsCount: 0,
    categoryMix: [
      { category: 'CLEANING', count: 1 },
      { category: 'HANDYMAN', count: 1 },
    ],
    quotesThisMonth: 3,
    freeQuotesPerMonth: 5,
    agreedTotalsOnCompletedJobs: [{ amount: 0, currency: 'GBP' }],
  },
  customer: {
    hostedCompletedCount: 0,
    mostUsedLocation: { label: 'Westminster', count: 1 },
    quotesReceived: 0,
    agreedTotalsOnCompletedJobs: [],
  },
})

/** Desktop hub chrome: list column plus the sticky Your activity rail. */
function HubPreview() {
  const [view, setView] = useState<MyTasksMobileView>('tasks')
  const showTasks = view === 'tasks'
  return (
    <Box bg="bg.canvas" px={{ base: 4, lg: 8 }} py={6}>
      <Stack gap={4} maxW="1120px" mx="auto">
        <HStack justify="space-between" align="flex-start" gap={3}>
          <Stack gap={1} minW={0}>
            <Heading as="h1" size="lg" color="text.default">
              My tasks
            </Heading>
            <Text fontSize="sm" color="text.muted">
              View and manage the tasks you've posted and quoted, along with
              their progress and status.
            </Text>
          </Stack>
          <MyTasksViewSwitch view={view} onChange={setView} />
        </HStack>
        <Box
          display={{ base: showTasks ? 'grid' : 'none', lg: 'grid' }}
          gridTemplateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 22rem' }}
          gap={6}
          alignItems="start"
        >
          <Stack gap={4} minW={0}>
            <MyTasksFilters
              search=""
              onSearchChange={() => undefined}
              ownerUserId=""
              onOwnerChange={() => undefined}
              owners={[{ ownerUserId: 'me', label: 'You' }]}
              category=""
              onCategoryChange={() => undefined}
              categories={[
                { category: 'CLEANING', label: 'Cleaning' },
                { category: 'HANDYMAN', label: 'Handyman' },
              ]}
              hubSection=""
              onHubSectionChange={() => undefined}
              active={false}
              onClear={() => undefined}
            />
            <MyTasksList sections={sections} onOpen={() => undefined} />
          </Stack>
          <Box display={{ base: 'none', lg: 'block' }}>
            <MyTasksAchievements panels={activity} />
          </Box>
        </Box>
        <Box display={{ base: showTasks ? 'none' : 'block', lg: 'none' }}>
          <MyTasksAchievements panels={activity} />
        </Box>
      </Stack>
    </Box>
  )
}

/** The whole hub on desktop: header, filters, list column and the activity rail. */
export const Hub: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <HubPreview />,
}
