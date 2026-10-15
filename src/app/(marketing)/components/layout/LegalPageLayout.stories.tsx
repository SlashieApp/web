import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { LegalPageLayout } from './LegalPageLayout'

const meta: Meta<typeof LegalPageLayout> = {
  title: 'Marketing/Layout/LegalPageLayout',
  component: LegalPageLayout,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
