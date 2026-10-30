import { HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'

import { formSpace, minHitArea } from '@/theme/styles'

import { FormField } from '../FormField/FormField'
import { gapBeside, heightOf } from '../FormField/formGap.testing'
import { starTargetsOf, starTilesOf } from '../Modal/taskDialogSpacing.testing'
import { STAR_TILE, StarRatingInput } from './StarRatingInput'

const meta = {
  title: 'UI/FeedbackDialog/StarRatingInput',
  component: StarRatingInput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    value: { control: { type: 'number', min: 1, max: 5, step: 1 } },
    disabled: { control: 'boolean' },
    onChange: { control: false },
  },
  args: { onChange: fn(), disabled: false },
  // Controlled by local state so every story can be clicked through.
  render: function Render(args) {
    const [value, setValue] = useState<number | undefined>(args.value)
    return (
      <StarRatingInput
        {...args}
        value={value}
        onChange={(next) => {
          setValue(next)
          args.onChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof StarRatingInput>

export default meta
type Story = StoryObj<typeof meta>

/** Unrated: five empty stars, nothing selected yet. */
export const Unrated: Story = {}

/** One star: the lowest rating, a single filled star. */
export const OneStar: Story = { args: { value: 1 } }

/** Two stars: two filled, the second highlighted as the selected one. */
export const TwoStars: Story = { args: { value: 2 } }

/** Three stars: the middle rating. */
export const ThreeStars: Story = { args: { value: 3 } }

/** Four stars: four filled, the fourth highlighted. */
export const FourStars: Story = { args: { value: 4 } }

/** Five stars: every star filled, the fifth highlighted. */
export const FiveStars: Story = { args: { value: 5 } }

/** Disabled: keeps the chosen rating but cannot be changed (not-allowed cursor, no hover). */
export const Disabled: Story = { args: { value: 4, disabled: true } }

/** Invalid: how a form shows a missing required rating (error text under the stars). */
export const RequiredWithError: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<number | undefined>(args.value)
    return (
      <FormField
        label="Rating"
        required
        errorText={value ? undefined : 'Choose a rating from 1 to 5.'}
      >
        <StarRatingInput {...args} value={value} onChange={setValue} />
      </FormField>
    )
  },
}

/** Keyboard focus: Tab lands on the first star and shows the focus ring. */
export const Focused: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.tab()
    await expect(
      within(canvasElement).getByRole('radio', { name: '1 out of 5 stars' }),
    ).toHaveFocus()
  },
}

/** Picking a rating: clicking the fourth star selects it and fills four stars. */
export const PicksRating: Story = {
  play: async ({ args, canvasElement }) => {
    const fourth = within(canvasElement).getByRole('radio', {
      name: '4 out of 5 stars',
    })
    await userEvent.click(fourth)
    await expect(fourth).toBeChecked()
    await expect(args.onChange).toHaveBeenCalledWith(4)
  },
}

/** Every level side by side: unrated, one to five stars, and disabled. */
export const AllLevels: Story = {
  render: () => (
    <Stack gap={4}>
      {[undefined, 1, 2, 3, 4, 5].map((value) => (
        <HStack key={value ?? 'none'} gap={4}>
          <Text w="20" fontSize="xs" color="text.muted">
            {value ? `${value} of 5` : 'Unrated'}
          </Text>
          <StarRatingInput value={value} onChange={() => undefined} />
        </HStack>
      ))}
      <HStack gap={4}>
        <Text w="20" fontSize="xs" color="text.muted">
          Disabled
        </Text>
        <StarRatingInput value={3} disabled onChange={() => undefined} />
      </HStack>
    </Stack>
  ),
}

/**
 * Form spacing (FE-481): the visible star tile is 32 square and the house 44
 * target grows into the gaps around it, so a gap is measured from the tile (a
 * rating is not a text field, so it does not take the 48 of inputs). A form puts
 * its label 8 above the tile and its helper or error 4 below it. The target
 * reaches 8 up (to the label), 4 down (to the helper) and 6 to each side, so two
 * neighbouring targets stay 4 apart and never overlap.
 */
export const TileSize: Story = {
  args: { value: 3 },
  play: async ({ canvasElement }) => {
    const tiles = starTilesOf(canvasElement)
    const targets = starTargetsOf(canvasElement)

    await expect(tiles).toHaveLength(5)
    await expect(targets).toHaveLength(5)
    for (const [index, tile] of tiles.entries()) {
      const box = tile.getBoundingClientRect()
      await expect(heightOf(tile)).toBe(STAR_TILE)
      await expect(box.width).toBe(STAR_TILE)
      // The target is the 44, and the tile is centred sideways in it.
      const target = (targets[index] as HTMLElement).getBoundingClientRect()
      await expect(target.width).toBe(minHitArea)
      await expect(target.height).toBe(minHitArea)
      await expect(box.left - target.left).toBe((minHitArea - STAR_TILE) / 2)
      // 8 up, 4 down: the gaps of a label above and a helper below.
      await expect(box.top - target.top).toBe(formSpace.labelToControl)
      await expect(target.bottom - box.bottom).toBe(formSpace.controlToHelper)
    }
    // The targets do not overlap: the next one starts 4 after this one ends.
    for (let i = 1; i < targets.length; i++) {
      await expect(
        gapBeside(targets[i - 1] as Element, targets[i] as Element),
      ).toBe(4)
    }
  },
}

/**
 * A named radio group: its name, its description (the field's helper and
 * error) and its invalid mark come from the field it sits in, and each star is
 * one of five.
 */
export const GroupSemantics: Story = {
  render: function GroupSemanticsStory() {
    const [value, setValue] = useState<number | undefined>()
    return (
      <FormField
        label="Rating"
        helperText="Optional, but required if you chose Rating."
        errorText="Choose a rating from 1 to 5."
      >
        <StarRatingInput
          aria-label="Rating"
          value={value}
          onChange={setValue}
        />
      </FormField>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('radiogroup', { name: 'Rating' })
    await expect(group).toHaveAccessibleDescription(
      /Optional, but required if you chose Rating\..*Choose a rating from 1 to 5\./,
    )
    await expect(group).toHaveAttribute('aria-invalid', 'true')
    await expect(within(group).getAllByRole('radio')).toHaveLength(5)
    await userEvent.click(
      within(group).getByRole('radio', { name: '4 out of 5 stars' }),
    )
    await expect(
      within(group).getByRole('radio', { name: '4 out of 5 stars' }),
    ).toBeChecked()
  },
}
