import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HeroHowItWorksLink } from './HeroHowItWorksLink'

const meta: Meta<typeof HeroHowItWorksLink> = {
  title: 'Marketing/Landing/HeroHowItWorksLink',
  component: HeroHowItWorksLink,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
