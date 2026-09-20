import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Reveal } from './Reveal'

const meta: Meta<typeof Reveal> = {
  title: 'marketing/ui/landing/Reveal',
  component: Reveal,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
