import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Slider } from './Slider'

const meta = {
  title: 'ui/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    min: 1,
    max: 80,
    step: 1,
    defaultValue: [15],
  },
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const SingleValue: Story = {
  render: (args) => {
    const [value, setValue] = useState([15])
    return (
      <Stack gap={3} maxW="420px">
        <Slider
          {...args}
          value={value}
          onValueChange={(d) => setValue(d.value)}
        />
      </Stack>
    )
  },
}

export const RangeValue: Story = {
  render: () => (
    <Stack gap={6} maxW="420px">
      <RangeSliderDemo />
      <SingleSliderDemo />
    </Stack>
  ),
}

function RangeSliderDemo() {
  const [value, setValue] = useState([20, 120])
  return (
    <Slider
      min={0}
      max={150}
      step={1}
      value={value}
      onValueChange={(d) => setValue(d.value)}
    />
  )
}

function SingleSliderDemo() {
  const [value, setValue] = useState([15])
  return (
    <Slider
      min={1}
      max={80}
      step={1}
      value={value}
      onValueChange={(d) => setValue(d.value)}
    />
  )
}
