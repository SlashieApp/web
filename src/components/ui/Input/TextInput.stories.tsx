import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { TextInput } from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'UI/Atoms/TextInput',
  component: TextInput,
  args: {
    placeholder: 'Email address',
  },
}

export default meta

type Story = StoryObj<typeof TextInput>

export const Default: Story = {}

export const Password: Story = {
  args: { type: 'password', placeholder: 'Password' },
}
