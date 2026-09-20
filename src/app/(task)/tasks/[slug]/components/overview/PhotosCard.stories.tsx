import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { PhotosCard } from './PhotosCard'

const meta: Meta<typeof PhotosCard> = {
  title: 'task/tasks/overview/PhotosCard',
  component: PhotosCard,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
