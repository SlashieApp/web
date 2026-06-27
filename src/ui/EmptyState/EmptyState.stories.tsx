import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { LuShare2 } from 'react-icons/lu'

import { Button } from '../Button/Button'
import { Card } from '../Card/Card'
import { EmptyState } from './EmptyState'

const meta = {
  title: 'Components/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    title: 'No quotes yet',
    description: 'Share your task to reach more nearby workers.',
  },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** As used in the task-detail Quotes card. */
export const QuotesCard: Story = {
  render: () => (
    <Card layout="section" heading="Quotes" maxW="420px">
      <EmptyState
        title="No quotes yet"
        description="Share your task to reach more nearby workers."
      >
        <Button variant="primary" w="full">
          <LuShare2 />
          Share task
        </Button>
        <Button variant="secondary" w="full">
          Edit task
        </Button>
        <Button variant="ghost" w="full" color="status.danger.fg">
          Cancel task
        </Button>
      </EmptyState>
    </Card>
  ),
}
