import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { OtpInput } from './OtpInput'

const meta = {
  title: 'form/OtpInput',
  component: OtpInput,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    value: '',
    length: 6,
  },
} satisfies Meta<typeof OtpInput>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    value: '',
    length: 6,
    onChange: () => {},
  },
  render: function OtpInputStory(args) {
    const [value, setValue] = useState('')
    return (
      <Stack gap={3} maxW="400px">
        <Text fontSize="sm" color="formLabelMuted">
          Enter the 6-digit code from your SMS.
        </Text>
        <OtpInput {...args} value={value} onChange={setValue} />
      </Stack>
    )
  },
}
