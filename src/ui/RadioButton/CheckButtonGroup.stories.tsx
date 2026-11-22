import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import {
  desktop1280,
  expectChoiceGroup,
  phone390,
} from '@/app/(stepflow)/stepFlowSpacing.testing'

import {
  CheckButtonGroup,
  type CheckButtonGroupOption,
} from './CheckButtonGroup'

type Pay = 'cash' | 'bank' | 'card'

const options: CheckButtonGroupOption<Pay>[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank transfer' },
  { value: 'card', label: 'Pay by card' },
]

const LABEL = 'Your accepted payment method'

function Demo(props: {
  errorText?: string
  columns?: number
  start?: Pay[]
}) {
  const { start = ['cash'], ...rest } = props
  const [values, setValues] = useState<Pay[]>(start)
  return (
    <CheckButtonGroup
      label={LABEL}
      helperText="Choose every way you are happy to pay."
      values={values}
      options={options}
      onChange={setValues}
      {...rest}
    />
  )
}

/**
 * A labelled choice of several: the rows of a RadioButtonGroup with a box that
 * is ticked when chosen. Screen readers hear "checkbox, checked".
 */
const meta = {
  title: 'UI/CheckButtonGroup',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Tapping a row adds it; tapping it again takes it off. The others stay. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('group', { name: LABEL })).toBeVisible()
    const cash = canvas.getByRole('checkbox', { name: 'Cash' })
    const card = canvas.getByRole('checkbox', { name: 'Pay by card' })
    await expect(cash).toHaveAttribute('aria-checked', 'true')
    await expect(card).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(card)
    await expect(card).toHaveAttribute('aria-checked', 'true')
    await expect(cash).toHaveAttribute('aria-checked', 'true')

    await userEvent.click(cash)
    await expect(cash).toHaveAttribute('aria-checked', 'false')
    await expect(card).toHaveAttribute('aria-checked', 'true')
  },
}

/** Every row chosen. */
export const AllChosen: Story = { args: { start: ['cash', 'bank', 'card'] } }

/** None chosen, with the error under the rows, linked to the group. */
export const WithError: Story = {
  args: { start: [], errorText: 'Choose at least one payment method.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const group = canvas.getByRole('group', { name: LABEL })
    const alert = canvas.getByRole('alert')
    await expect(alert).toHaveTextContent('Choose at least one payment method.')
    await expect(group).toHaveAccessibleDescription(
      /Choose at least one payment method\./,
    )
    for (const row of canvas.getAllByRole('checkbox')) {
      await expect(row).toHaveAttribute('aria-invalid', 'true')
    }
  },
}

/** Phones stack the rows whatever the column count. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
}

/**
 * Form spacing (FE-481), as RadioButtonGroup: the label is 8 above the rows,
 * the rows are 8 apart, the helper and the error 4 under them and 4 apart.
 */
export const Spacing: Story = {
  ...phone390,
  args: { start: [], errorText: 'Choose at least one payment method.' },
  play: async ({ canvasElement }) => {
    await expectChoiceGroup(
      canvasElement,
      LABEL,
      [
        'Choose every way you are happy to pay.',
        'Choose at least one payment method.',
      ],
      'group',
    )
  },
}

/** From `sm` the rows sit side by side, still 8 apart. */
export const SpacingWide: Story = {
  ...desktop1280,
  play: async ({ canvasElement }) => {
    await expectChoiceGroup(
      canvasElement,
      LABEL,
      ['Choose every way you are happy to pay.'],
      'group',
    )
  },
}
