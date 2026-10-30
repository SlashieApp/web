import { Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { Input } from '../Input/Input'
import { FormErrorText } from './FormErrorText'
import { FormField } from './FormField'

const meta = {
  title: 'UI/FormField/FormErrorText',
  component: FormErrorText,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { children: 'The minimum is above the maximum.' },
} satisfies Meta<typeof FormErrorText>

export default meta
type Story = StoryObj<typeof meta>

/** An error under a group that is not a field control: the field's error line. */
export const Default: Story = {}

/**
 * One error style: a choice group's or a pair's error reads exactly like the
 * error a `FormField` draws under its control (12 on a 16 line, 500, danger),
 * and is announced when it appears.
 */
export const MatchesFormFieldError: Story = {
  render: () => (
    <Stack gap={5} maxW="360px">
      <FormField label="Email" errorText="Enter a valid email address.">
        <Input defaultValue="not-an-email" />
      </FormField>
      <FormErrorText>Choose one of these.</FormErrorText>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const fieldError = canvasElement.querySelector(
      '[data-part="error-text"]',
    ) as HTMLElement
    const groupError = canvas.getByRole('alert')
    await expect(groupError).toHaveTextContent('Choose one of these.')
    const read = (element: HTMLElement) => {
      const style = getComputedStyle(element)
      return {
        fontSize: style.fontSize,
        lineHeight: style.lineHeight,
        fontWeight: style.fontWeight,
        color: style.color,
        display: style.display,
        paddingLeft: style.paddingLeft,
        height: element.getBoundingClientRect().height,
      }
    }
    await expect(read(groupError)).toEqual(read(fieldError))
    await expect(read(groupError)).toMatchObject({
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: '500',
    })
  },
}
