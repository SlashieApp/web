import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { MobileTaskCarousel } from './MobileTaskCarousel'

const meta: Meta<typeof MobileTaskCarousel> = {
  title: 'task/layout/MobileTaskCarousel',
  component: MobileTaskCarousel,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
