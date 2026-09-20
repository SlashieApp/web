import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HowItWorks } from './HowItWorks'

const meta: Meta<typeof HowItWorks> = {
  title: 'marketing/ui/landing/sections/HowItWorks',
  component: HowItWorks,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
