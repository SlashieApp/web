import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HeroSearchCta } from './HeroSearchCta'

const meta: Meta<typeof HeroSearchCta> = {
  title: 'marketing/ui/landing/hero/HeroSearchCta',
  component: HeroSearchCta,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
