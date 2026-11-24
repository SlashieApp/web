import { Wrap } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { ChoiceChip } from './ChoiceChip'

const meta = {
  title: 'UI/ChoiceChip',
  component: ChoiceChip,
  parameters: { layout: 'padded' },
  args: { selected: false, children: 'Cleaning', onSelect: () => {} },
} satisfies Meta<typeof ChoiceChip>

export default meta
type Story = StoryObj<typeof meta>

/** Resting: a thin outline pin. */
export const Off: Story = {
  play: async ({ canvasElement }) => {
    const chip = within(canvasElement).getByRole('checkbox', {
      name: 'Cleaning',
    })
    await expect(chip).not.toBeChecked()
    await expect(chip.parentElement).toHaveStyle({ height: '32px' })
  },
}

/** Chosen: the same pin, filled green. */
export const On: Story = {
  args: { selected: true },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('checkbox', { name: 'Cleaning' }),
    ).toBeChecked()
  },
}

/** One of a group: radios, and the last pin opens a field rather than a value. */
export const Group: Story = {
  render: () => {
    const [value, setValue] = useState('whole')
    return (
      <Wrap gap={2}>
        <ChoiceChip
          name="unit"
          selected={value === 'whole'}
          onSelect={() => setValue('whole')}
        >
          Whole job
        </ChoiceChip>
        <ChoiceChip
          name="unit"
          selected={value === 'hour'}
          onSelect={() => setValue('hour')}
        >
          Per hour
        </ChoiceChip>
        <ChoiceChip
          name="unit"
          selected={value === 'other'}
          onSelect={() => setValue('other')}
        >
          Other
        </ChoiceChip>
      </Wrap>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('radio', { name: 'Other' }))
    await expect(canvas.getByRole('radio', { name: 'Other' })).toBeChecked()
  },
}
