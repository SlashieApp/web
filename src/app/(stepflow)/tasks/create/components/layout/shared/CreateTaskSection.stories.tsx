import { Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { CreateTaskSection } from './CreateTaskSection'

const meta = {
  title: 'Create task/CreateTaskSection',
  component: CreateTaskSection,
  parameters: {
    layout: 'padded',
  },
  args: {
    heading: '1. Task basics',
    children: (
      <Text fontSize="sm" color="text.muted">
        Section body: the fields for this part of the form.
      </Text>
    ),
  },
} satisfies Meta<typeof CreateTaskSection>

export default meta
type Story = StoryObj<typeof meta>

/** Card mode (edit page): a titled section card around the body. */
export const Card: Story = {}

/** Card mode with supporting copy under the heading. */
export const CardWithSubtext: Story = {
  args: {
    headingSubtext: (
      <Text fontSize="sm" color="text.muted">
        Tell workers when you need the work done.
      </Text>
    ),
  },
}

/** Bare mode (stepped create flow): only the body, no card or heading. */
export const Bare: Story = {
  args: { bare: true },
}
