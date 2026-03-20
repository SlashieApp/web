import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Input } from './Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input/Base Input',
  component: Input,
}

export default meta

type Story = StoryObj<typeof Input>

export const Default: Story = {
  render: (args) => (
    <Stack maxW="420px">
      <Input {...args} placeholder="Base input field" />
    </Stack>
  ),
}
