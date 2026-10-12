import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { HeroSection } from './HeroSection'

const meta: Meta<typeof HeroSection> = {
  title: 'marketing/ui/landing/hero/HeroSection',
  component: HeroSection,
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: messages.en.landing.hero,
    ctas: { seeHowItWorks: messages.en.common.ctas.seeHowItWorks },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
