import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Reveal } from './Reveal'

const meta: Meta<typeof Reveal> = {
  title: 'task/tasks/layout/Reveal',
  component: Reveal,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
