import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { RadioButton } from './RadioButton'

const meta = {
  title: 'ui/RadioButton',
  component: RadioButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    checked: false,
    label: 'Flexible',
  },
} satisfies Meta<typeof RadioButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Checked: Story = {
  args: {
    checked: true,
    label: 'ASAP (Next 2 hours)',
  },
}

export const GroupExample: Story = {
  render: () => {
    const [value, setValue] = useState<'emergency' | 'today' | 'week'>(
      'emergency',
    )
    return (
      <Stack gap={2} maxW="360px">
        <RadioButton
          checked={value === 'emergency'}
          label="ASAP (Next 2 hours)"
          onChange={() => setValue('emergency')}
        />
        <RadioButton
          checked={value === 'today'}
          label="Today"
          onChange={() => setValue('today')}
        />
        <RadioButton
          checked={value === 'week'}
          label="Flexible"
          onChange={() => setValue('week')}
        />
      </Stack>
    )
  },
}
