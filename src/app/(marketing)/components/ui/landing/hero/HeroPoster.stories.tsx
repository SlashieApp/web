import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HeroPoster } from './HeroPoster'

const meta: Meta<typeof HeroPoster> = {
  title: 'marketing/ui/landing/hero/HeroPoster',
  component: HeroPoster,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
