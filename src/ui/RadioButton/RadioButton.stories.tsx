import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import {
  RadioButton,
  type UiRadioButtonSize,
  type UiRadioButtonVariant,
} from './RadioButton'

const SDL_VARIANTS: UiRadioButtonVariant[] = ['primary', 'subtle']
const SDL_SIZES: UiRadioButtonSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'UI/RadioButton',
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

/** Playground driven by the Controls panel (variant, size, checked). */
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

/** Default: an unselected primary row at the md size. */
export const Default: Story = {
  args: { checked: false, label: 'Today' },
  render: (args) => (
    <Box maxW="360px">
      <RadioButton {...args} />
    </Box>
  ),
}

/** Selected: success tint, green ink and the filled indicator dot. */
export const Selected: Story = {
  args: { checked: true },
  render: (args) => (
    <Box maxW="360px">
      <RadioButton {...args} />
    </Box>
  ),
}

/** Disabled: dimmed and not clickable, shown unselected and selected. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Stack gap={2} maxW="360px">
      <RadioButton {...args} checked={false} label="Disabled (unselected)" />
      <RadioButton {...args} checked label="Disabled (selected)" />
    </Stack>
  ),
}

/** Focus: the first row starts focused, showing the SDL focus ring. */
export const Focus: Story = {
  render: () => (
    <Stack gap={2} maxW="360px">
      <RadioButton checked label="Tab to me" />
      <RadioButton checked={false} label="…then to me" />
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const row = within(canvasElement).getByRole('button', { name: 'Tab to me' })
    row.focus()
    await expect(row).toHaveFocus()
  },
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

const singleRow: Story['render'] = (args) => (
  <Box maxW="360px">
    <RadioButton {...args} />
  </Box>
)

/** Subtle variant, unselected: transparent row on a neutral surface. */
export const Subtle: Story = {
  args: { variant: 'subtle', checked: false, label: 'Flexible' },
  render: singleRow,
}

/** Subtle variant, selected: neutral tint with a dark indicator dot. */
export const SubtleSelected: Story = {
  args: { variant: 'subtle', checked: true, label: 'Flexible' },
  render: singleRow,
}

/** Small size: 40px row for dense desktop lists. */
export const SizeSmall: Story = {
  args: { size: 'sm', checked: true, label: 'Today' },
  render: singleRow,
}

/** Large size: 52px row with a bigger indicator and label. */
export const SizeLarge: Story = {
  args: { size: 'lg', checked: true, label: 'Today' },
  render: singleRow,
}

/** Long label: wraps onto extra lines and the row grows with it. */
export const LongLabel: Story = {
  args: {
    checked: false,
    label:
      'Any time that suits the worker over the next two weeks, as long as they message me an hour before arriving',
  },
  render: singleRow,
}
