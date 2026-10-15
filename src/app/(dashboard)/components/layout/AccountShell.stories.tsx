import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountShell } from './AccountShell'

const meta: Meta<typeof AccountShell> = {
  title: 'Dashboard/Shared/AccountShell',
  component: AccountShell,
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
