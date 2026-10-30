import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { formSpace, minHitArea } from '@/theme/styles'

import { FormField } from '../FormField/FormField'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import { FormStack } from '../FormStack/FormStack'
import { Input } from '../Input/Input'
import { FormCheckbox } from './FormCheckbox'

/**
 * SDL form checkbox: one field group of a form. The visible row is the label's
 * lines (20 each), its error 4 under it, and the 44px tap target grows into the
 * gaps around the row, so it adds no space.
 */
const meta = {
  title: 'UI/FormCheckbox',
  component: FormCheckbox,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    label: 'I confirm I am 18 or over.',
    checked: false,
    onCheckedChange: () => {},
  },
  render: function Render(args) {
    const [checked, setChecked] = useState(args.checked)
    return (
      <FormCheckbox
        {...args}
        checked={checked}
        onCheckedChange={(next) => {
          setChecked(next)
          args.onCheckedChange(next)
        }}
      />
    )
  },
} satisfies Meta<typeof FormCheckbox>

export default meta
type Story = StoryObj<typeof meta>

/** The label toggles it too. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByText('I confirm I am 18 or over.'))
    await expect(canvas.getByRole('checkbox')).toBeChecked()
  },
}

/** Ticked. */
export const Checked: Story = { args: { checked: true } }

/**
 * The error is the field error line, 4 under the row, announced when it
 * appears; the box is invalid and described by it.
 */
export const WithError: Story = {
  args: { errorText: 'You must confirm you are 18 or over.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole('checkbox')
    const alert = canvas.getByRole('alert')
    await expect(alert).toHaveTextContent(
      'You must confirm you are 18 or over.',
    )
    await expect(getComputedStyle(alert).fontSize).toBe('12px')
    await expect(box).toBeInvalid()
    await expect(box).toHaveAccessibleDescription(
      'You must confirm you are 18 or over.',
    )
    const control = box
      .closest('label')
      ?.querySelector('[data-part="control"]') as HTMLElement
    await expect(gapBelow(control, alert)).toBe(formSpace.controlToHelper)
  },
}

/**
 * Between two fields of a form: the row is one 20px line, 20 under the field
 * above and 20 above the next, and its tap target is 44 and takes no room.
 */
export const FieldGroup: Story = {
  render: () => (
    <FormStack maxW="360px">
      <FormField label="Email">
        <Input />
      </FormField>
      <FormCheckbox
        checked={false}
        onCheckedChange={() => {}}
        label="Keep me signed in"
      />
      <FormField label="Password">
        <Input />
      </FormField>
    </FormStack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const root = canvas.getByRole('checkbox').closest('label') as HTMLElement
    const control = root.querySelector('[data-part="control"]') as HTMLElement
    const row = canvas.getByText('Keep me signed in')
      .parentElement as HTMLElement
    const email = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    const password = canvas.getByText('Password', { selector: 'label' })
      .parentElement as HTMLElement
    const emailShell = (email.querySelector('input') as HTMLElement)
      .parentElement as HTMLElement

    await expect(heightOf(control)).toBe(20)
    await expect(gapBelow(emailShell, control)).toBe(formSpace.fieldGap)
    await expect(gapBelow(control, password)).toBe(formSpace.fieldGap)
    await expect(heightOf(row)).toBe(minHitArea)
  },
}

/** A long label wraps; the box stays level with the first line, the row is the lines. */
export const WrappedLabel: Story = {
  args: {
    label:
      'Send me Slashie news and tips (optional). You can turn this off any time in Account settings.',
  },
  decorators: [
    (Story) => (
      <Stack maxW="260px">
        <Story />
      </Stack>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const control = canvas
      .getByRole('checkbox')
      .closest('label')
      ?.querySelector('[data-part="control"]') as HTMLElement
    const label = canvas.getByText(/Send me Slashie news/)
    // Whole 20px lines, and the box is on the first one.
    await expect(heightOf(label) % 20).toBe(0)
    await expect(heightOf(label)).toBeGreaterThan(20)
    await expect(control.getBoundingClientRect().top).toBe(
      label.getBoundingClientRect().top,
    )
  },
}

/**
 * Rows closer than the field gap (a group of choices 8 apart) pass half the gap
 * as their reach: the targets touch and never overlap (28 tall), so a click is
 * never given to the next row.
 */
export const RowsShareAGap: Story = {
  render: () => (
    <Stack gap="form.alternativesGap" maxW="320px">
      {['One', 'Two', 'Three'].map((name) => (
        <FormCheckbox
          key={name}
          checked={false}
          onCheckedChange={() => {}}
          label={name}
          reachAbove={formSpace.alternativesGap / 2}
          reachBelow={formSpace.alternativesGap / 2}
        />
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const targets = ['One', 'Two', 'Three'].map(
      (name) => canvas.getByText(name).parentElement as HTMLElement,
    )
    for (const target of targets) await expect(heightOf(target)).toBe(28)
    await expect(gapBelow(targets[0] as Element, targets[1] as Element)).toBe(0)
    await expect(gapBelow(targets[1] as Element, targets[2] as Element)).toBe(0)
  },
}
