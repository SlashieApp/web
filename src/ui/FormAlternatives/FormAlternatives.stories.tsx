import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { Button } from '../Button/Button'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import { FormAlternatives } from './FormAlternatives'

/**
 * SDL FormAlternatives: stacked alternative or secondary buttons 8 apart
 * (`alternativesGap`): Google and Apple under the "Or continue with" divider,
 * or Continue and Resend on a status page. Each button is `size="form"`, 48 tall.
 */
const meta = {
  title: 'UI/FormAlternatives',
  component: FormAlternatives,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <Box maxW="420px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof FormAlternatives>

export default meta
type Story = StoryObj<typeof meta>

/** Two 48px buttons, 8 apart. */
export const Default: Story = {
  render: (args) => (
    <FormAlternatives {...args}>
      <Button size="form" variant="secondary" w="full">
        Continue with Google
      </Button>
      <Button size="form" variant="secondary" w="full">
        Continue with Apple
      </Button>
    </FormAlternatives>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const google = canvas.getByRole('button', { name: 'Continue with Google' })
    const apple = canvas.getByRole('button', { name: 'Continue with Apple' })
    await expect(gapBelow(google, apple)).toBe(8)
    await expect(heightOf(google)).toBe(48)
    await expect(heightOf(apple)).toBe(48)
  },
}

/** Status pages: Continue and Resend, 8 apart. */
export const StatusPage: Story = {
  render: (args) => (
    <FormAlternatives {...args}>
      <Button size="form" w="full">
        Continue
      </Button>
      <Button size="form" variant="secondary" w="full">
        Resend email
      </Button>
    </FormAlternatives>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      gapBelow(
        canvas.getByRole('button', { name: 'Continue' }),
        canvas.getByRole('button', { name: 'Resend email' }),
      ),
    ).toBe(8)
  },
}
