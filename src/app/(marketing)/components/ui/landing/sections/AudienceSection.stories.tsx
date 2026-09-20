import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AudienceSection } from './AudienceSection'

const meta: Meta<typeof AudienceSection> = {
  title: 'marketing/ui/landing/sections/AudienceSection',
  component: AudienceSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
