import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { Button } from '../Button/Button'
import { gapBelow } from '../FormField/formGap.testing'
import { FormDivider } from './FormDivider'

/**
 * SDL FormDivider, "Or continue with": 24 under the main button
 * (`actionToDivider`) and 24 above the first alternative button
 * (`dividerToAlternatives`). The divider owns both gaps, so it sits in a plain
 * container, not a stack with its own gap.
 */
const meta = {
  title: 'UI/FormDivider',
  component: FormDivider,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FormDivider>

export default meta
type Story = StoryObj<typeof meta>

/** Main button, 24, the divider, 24, the first alternative. */
export const Default: Story = {
  render: () => (
    <>
      <Button size="form" w="full">
        Log in
      </Button>
      <FormDivider />
      <Button size="form" w="full" variant="secondary">
        Continue with Google
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const main = canvas.getByRole('button', { name: 'Log in' })
    const label = canvas.getByText('Or continue with')
    const divider = label.parentElement as HTMLElement
    const alternative = canvas.getByRole('button', {
      name: 'Continue with Google',
    })
    await expect(gapBelow(main, divider)).toBe(24)
    await expect(gapBelow(divider, alternative)).toBe(24)
  },
}

/** A caller can set the label. */
export const CustomLabel: Story = {
  args: { children: 'Or sign up with' },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Or sign up with')
  },
}
