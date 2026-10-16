import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import {
  RadioButtonGroup,
  type RadioButtonGroupOption,
} from './RadioButtonGroup'

type Pay = 'cash' | 'bank' | 'card'

const options: RadioButtonGroupOption<Pay>[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank transfer' },
  {
    value: 'card',
    label: 'Card',
    disabled: true,
    disabledHint: 'Card payments are coming soon.',
  },
]

function Demo(props: { errorText?: string; columns?: number }) {
  const [value, setValue] = useState<Pay>('cash')
  return (
    <RadioButtonGroup
      label="How you'll pay"
      helperText="You pay your worker directly."
      value={value}
      options={options}
      onChange={setValue}
      {...props}
    />
  )
}

/**
 * A labelled single choice of RadioButton rows: the selected row has the
 * dot and the tint, and screen readers hear "radio, checked".
 */
const meta = {
  title: 'UI/RadioButtonGroup',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Picking a row checks it and unchecks the others; a disabled row says why. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('radiogroup', { name: "How you'll pay" })
    await expect(group).toBeVisible()
    await userEvent.click(canvas.getByRole('radio', { name: 'Bank transfer' }))
    await expect(
      canvas.getByRole('radio', { name: 'Bank transfer' }),
    ).toHaveAttribute('aria-checked', 'true')
    await expect(canvas.getByRole('radio', { name: 'Cash' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    await expect(canvas.getByRole('radio', { name: 'Card' })).toBeDisabled()
    await expect(
      canvas.getByText('Card payments are coming soon.'),
    ).toBeVisible()
  },
}

/** An error under the rows, linked to the group. */
export const WithError: Story = {
  args: { errorText: 'Choose how you will pay.' },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('radiogroup', { name: "How you'll pay" }),
    ).toHaveAttribute('aria-invalid', 'true')
  },
}

/** One option per row. */
export const Stacked: Story = { args: { columns: 1 } }

/** Phones stack the rows whatever the column count. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}
