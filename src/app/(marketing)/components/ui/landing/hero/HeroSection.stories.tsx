import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HeroSection } from './HeroSection'

const meta: Meta<typeof HeroSection> = {
  title: 'marketing/ui/landing/hero/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
