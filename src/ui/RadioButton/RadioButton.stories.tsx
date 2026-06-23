import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { RadioButton } from './RadioButton'

const meta = {
  title: 'ui/RadioButton',
  component: RadioButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    checked: false,
    label: 'Option',
    onChange: () => {},
  },
  argTypes: {
    onChange: { action: 'change' },
  },
} satisfies Meta<typeof RadioButton>

export default meta

type Story = StoryObj<typeof meta>

export const TimingAsap: Story = {
  args: {
    checked: true,
    label: 'ASAP (next 2 hours)',
  },
  render: (args) => <RadioButton {...args} />,
}

export const TimingToday: Story = {
  args: {
    checked: false,
    label: 'Today',
  },
  render: (args) => <RadioButton {...args} />,
}

export const TimingFlexible: Story = {
  args: {
    checked: false,
    label: 'Flexible',
  },
  render: (args) => <RadioButton {...args} />,
}

export const PostTaskTimingGroup: Story = {
  args: {
    checked: true,
    label: 'ASAP (next 2 hours)',
  },
  render: function PostTaskTimingGroup() {
    const [value, setValue] = useState<'asap' | 'today' | 'flexible'>('asap')
    return (
      <Stack gap={2} maxW="360px">
        <RadioButton
          checked={value === 'asap'}
          label="ASAP (next 2 hours)"
          onChange={() => setValue('asap')}
        />
        <RadioButton
          checked={value === 'today'}
          label="Today"
          onChange={() => setValue('today')}
        />
        <RadioButton
          checked={value === 'flexible'}
          label="Flexible"
          onChange={() => setValue('flexible')}
        />
      </Stack>
    )
  },
}
