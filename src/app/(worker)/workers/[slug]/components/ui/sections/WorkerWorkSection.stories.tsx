import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerWorkSection } from './WorkerWorkSection'

const meta = {
  title: 'Worker profile/WorkerWorkSection',
  component: WorkerWorkSection,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: (args) => (
    <Box maxW="720px">
      <WorkerWorkSection {...args} />
    </Box>
  ),
} satisfies Meta<typeof WorkerWorkSection>

export default meta

type Story = StoryObj<typeof meta>

/** The two example rows from the approved v2 mockup: one rated, one not yet reviewed. */
export const JobsCompleted: Story = {
  args: {
    jobs: [
      {
        id: 'job-1',
        title: 'IKEA wardrobe assembly',
        category: 'Handyman',
        areaLabel: 'Camden',
        completedLabel: 'March 2026',
        rating: 5,
      },
      {
        id: 'job-2',
        title: 'Kitchen tap repair',
        category: 'Plumbing',
        areaLabel: 'Islington',
        completedLabel: 'January 2026',
        rating: null,
      },
    ],
  },
}

/** A long title clamps to one line, and a job without an area drops that part of the meta line. */
export const LongTitleNoArea: Story = {
  args: {
    jobs: [
      {
        id: 'job-3',
        title:
          'Assemble and wall-mount a six-door wardrobe, two bedside tables and a chest of drawers in a second-floor flat',
        category: 'Handyman',
        areaLabel: null,
        completedLabel: 'February 2026',
        rating: 4,
      },
    ],
  },
}

/** Phone: long titles truncate to one line and the chips and meta line wrap beneath. */
export const Phone: Story = {
  ...JobsCompleted,
  globals: { viewport: { value: 'mobile1' } },
}

/** E14 empty state: no completed jobs on Slashie yet. */
export const Empty: Story = {
  args: { jobs: [] },
}
