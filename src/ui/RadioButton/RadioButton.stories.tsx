import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { RadioButton } from './RadioButton'

const meta = {
  title: 'ui/RadioButton',
  component: RadioButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RadioButton>

export default meta

type Story = StoryObj<typeof meta>

export const TimingAsap: Story = {
  render: () => (
    <RadioButton checked label="ASAP (next 2 hours)" onChange={() => {}} />
  ),
}

export const TimingToday: Story = {
  render: () => (
    <RadioButton checked={false} label="Today" onChange={() => {}} />
  ),
}

export const TimingFlexible: Story = {
  render: () => (
    <RadioButton checked={false} label="Flexible" onChange={() => {}} />
  ),
}

export const PostTaskTimingGroup: Story = {
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
