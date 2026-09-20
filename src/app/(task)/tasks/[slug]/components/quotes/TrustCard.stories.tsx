import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'

import { TrustCard } from './TrustCard'

const meta: Meta<typeof TrustCard> = {
  title: 'task/tasks/quotes/TrustCard',
  component: TrustCard,
  tags: ['autodocs'],
  decorators: [withTaskDetailStory()],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
