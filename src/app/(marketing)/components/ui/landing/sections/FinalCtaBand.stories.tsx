import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { FinalCtaBand } from './FinalCtaBand'

const meta: Meta<typeof FinalCtaBand> = {
  title: 'marketing/ui/landing/sections/FinalCtaBand',
  component: FinalCtaBand,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
