import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import { Slider, type UiSliderTone } from './Slider'

const TONES: UiSliderTone[] = ['primary', 'danger']

const meta = {
  title: 'ui/Slider',
  component: Slider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    disabled: { control: 'boolean' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
  },
  args: {
    tone: 'primary',
    min: 1,
    max: 80,
    step: 1,
    defaultValue: [15],
    disabled: false,
  },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
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

/** Every tone, plus single + range thumbs. Tab to a thumb to see the focus ring. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6} maxW="420px">
      {TONES.map((tone) => (
        <Stack key={tone} gap={2}>
          <Text fontSize="sm" color="text.muted" textTransform="capitalize">
            {tone}
          </Text>
          <Slider tone={tone} min={0} max={100} step={1} defaultValue={[40]} />
        </Stack>
      ))}
    </Stack>
  ),
}

/** Single-value and dual-thumb range selection. */
export const SingleAndRange: Story = {
  render: () => (
    <Stack gap={6} maxW="420px">
      <SingleSliderDemo />
      <RangeSliderDemo />
    </Stack>
  ),
}

export const Disabled: Story = {
  args: { disabled: true, defaultValue: [30] },
}

/** Danger tone (uses `status.danger.solid` fill). */
export const DangerTone: Story = {
  args: { tone: 'danger', defaultValue: [60], min: 0, max: 100 },
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
