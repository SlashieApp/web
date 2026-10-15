import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AppStatusBanners } from './AppStatusBanners'

const meta: Meta<typeof AppStatusBanners> = {
  title: 'Auth/AppStatusBanners',
  component: AppStatusBanners,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
