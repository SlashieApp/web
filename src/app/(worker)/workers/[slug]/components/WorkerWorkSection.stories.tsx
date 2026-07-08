import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { WorkerWorkSection } from './WorkerWorkSection'

const meta = {
  title: 'worker/WorkerWorkSection',
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

/** The two example rows from the approved v2 mockup. */
export const JobsCompleted: Story = {
  args: {
    jobs: [
      {
        id: 'job-1',
        title: 'IKEA wardrobe assembly',
        category: 'Handyman',
        areaLabel: 'Camden, London',
        completedLabel: 'March 2026',
        rating: 5,
      },
      {
        id: 'job-2',
        title: 'Kitchen tap repair',
        category: 'Plumbing',
        areaLabel: 'Islington, London',
        completedLabel: 'January 2026',
        rating: null,
      },
    ],
  },
}

/** E14 empty state — what production shows until BE-36 lands. */
export const Empty: Story = {
  args: { jobs: [] },
}
