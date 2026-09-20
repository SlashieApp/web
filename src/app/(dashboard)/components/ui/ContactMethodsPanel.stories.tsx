import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ContactMethodsPanel } from './ContactMethodsPanel'

const meta: Meta<typeof ContactMethodsPanel> = {
  title: 'dashboard/ui/ContactMethodsPanel',
  component: ContactMethodsPanel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
