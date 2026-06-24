import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import {
  RadioButton,
  type UiRadioButtonSize,
  type UiRadioButtonVariant,
} from './RadioButton'

const SDL_VARIANTS: UiRadioButtonVariant[] = ['primary', 'subtle']
const SDL_SIZES: UiRadioButtonSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'Components/RadioButton',
  component: RadioButton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    variant: { control: 'inline-radio', options: SDL_VARIANTS },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    label: { control: 'text' },
    onChange: { action: 'change' },
  },
  args: {
    variant: 'primary',
    size: 'md',
    checked: false,
    disabled: false,
    label: 'ASAP (next 2 hours)',
  },
} satisfies Meta<typeof RadioButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Box maxW="360px">
      <RadioButton {...args} />
    </Box>
  ),
}

/** Both variants, unselected and selected. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={6} maxW="360px">
      {SDL_VARIANTS.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text fontSize="xs" fontWeight={600} color="text.muted">
            {variant}
          </Text>
          <RadioButton variant={variant} checked={false} label="Unselected" />
          <RadioButton variant={variant} checked label="Selected" />
        </Stack>
      ))}
    </Stack>
  ),
}

/** Sizes sm / md / lg (md and lg meet the 44px touch target). */
export const Sizes: Story = {
  render: () => (
    <Stack gap={2} maxW="360px">
      {SDL_SIZES.map((size) => (
        <RadioButton key={size} size={size} checked label={`Size ${size}`} />
      ))}
    </Stack>
  ),
}

export const Default: Story = {
  args: { checked: false, label: 'Today' },
  render: (args) => (
    <Box maxW="360px">
      <RadioButton {...args} />
    </Box>
  ),
}

export const Selected: Story = {
  args: { checked: true },
  render: (args) => (
    <Box maxW="360px">
      <RadioButton {...args} />
    </Box>
  ),
}

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Stack gap={2} maxW="360px">
      <RadioButton {...args} checked={false} label="Disabled (unselected)" />
      <RadioButton {...args} checked label="Disabled (selected)" />
    </Stack>
  ),
}

/** Tab into the group to see the SDL focus ring on the focused row. */
export const Focus: Story = {
  render: () => (
    <Stack gap={2} maxW="360px">
      <RadioButton checked label="Tab to me" />
      <RadioButton checked={false} label="…then to me" />
    </Stack>
  ),
}

/** A controlled exclusive group wrapped in a labelled radiogroup container. */
export const Group: Story = {
  render: function Group() {
    const [value, setValue] = useState<'asap' | 'today' | 'flexible'>('asap')
    return (
      <Stack
        gap={2}
        maxW="360px"
        role="radiogroup"
        aria-label="When do you need this done?"
      >
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
