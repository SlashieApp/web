import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TrustSection } from './TrustSection'

const meta: Meta<typeof TrustSection> = {
  title: 'Marketing/Landing/TrustSection',
  component: TrustSection,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
