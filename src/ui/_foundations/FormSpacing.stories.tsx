import { Box, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'

import { Button } from '../Button/Button'
import { FormAlternatives } from '../FormAlternatives/FormAlternatives'
import { FormDivider } from '../FormDivider/FormDivider'
import { FormField } from '../FormField/FormField'
import { gapBelow, heightOf } from '../FormField/formGap.testing'
import { FormHeader } from '../FormHeader/FormHeader'
import { FormStack } from '../FormStack/FormStack'
import { Input } from '../Input/Input'
import { Link } from '../Link/Link'

/**
 * SDL form spacing (FE-481): one set of gaps for every form, in both apps. The
 * table below is read from `formSpace` in `src/theme/styles.ts`, and the log-in
 * card is built from the shared pieces (`FormHeader`, `FormField`, `FormStack`,
 * `FormDivider`, `FormAlternatives`), so the numbers it measures are the ones
 * the code ships. The spec is the wiki note Foundations-Form-Spacing.
 */
const meta = {
  title: 'Foundations/Form spacing',
  parameters: { layout: 'padded' },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every `formSpace` token, in px. */
export const Tokens: Story = {
  render: () => (
    <Stack gap={2} maxW="420px">
      {Object.entries(formSpace).map(([key, px]) => (
        <Box key={key} display="flex" justifyContent="space-between" gap={4}>
          <Text fontFamily="mono" fontSize="sm" color="text.default">
            {key}
          </Text>
          <Text fontFamily="mono" fontSize="sm" color="text.muted">
            {px}px
          </Text>
        </Box>
      ))}
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const [key, px] of Object.entries(formSpace)) {
      await expect(canvas.getByText(key)).toBeInTheDocument()
      await expect(canvas.getAllByText(`${px}px`).length).toBeGreaterThan(0)
    }
  },
}

/**
 * The log-in card, top to bottom: title 8 subtitle, 24, Email 20 Password
 * (with "Forgot password?" in its helper slot, 4 below) 20 the main button, 24,
 * the divider, 24, Google 8 Apple. Fields and buttons are 48 tall.
 */
export const LogIn: Story = {
  render: () => (
    <Box
      maxW="440px"
      p={8}
      bg="bg.surface"
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
    >
      <FormHeader title="Log in" description="Welcome back to Slashie." />
      <FormStack>
        <FormField label="Email">
          <Input placeholder="you@example.com" type="email" />
        </FormField>
        <FormField
          label="Password"
          helperAction={<Link href="/forgot-password">Forgot password?</Link>}
        >
          <Input placeholder="Password" type="password" />
        </FormField>
        <Button size="form" w="full">
          Log in
        </Button>
      </FormStack>
      <FormDivider />
      <FormAlternatives>
        <Button size="form" variant="secondary" w="full">
          Continue with Google
        </Button>
        <Button size="form" variant="secondary" w="full">
          Continue with Apple
        </Button>
      </FormAlternatives>
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { name: 'Log in' })
    const subtitle = canvas.getByText('Welcome back to Slashie.')
    const email = canvas.getByText('Email', { selector: 'label' })
      .parentElement as HTMLElement
    const password = canvas.getByText('Password', { selector: 'label' })
      .parentElement as HTMLElement
    const main = canvas.getByRole('button', { name: 'Log in' })
    const divider = canvas.getByText('Or continue with')
      .parentElement as HTMLElement
    const google = canvas.getByRole('button', { name: 'Continue with Google' })
    const apple = canvas.getByRole('button', { name: 'Continue with Apple' })

    await expect(gapBelow(title, subtitle)).toBe(formSpace.titleToSubtitle)
    await expect(gapBelow(subtitle, email)).toBe(formSpace.headerToBody)
    await expect(gapBelow(email, password)).toBe(formSpace.fieldGap)
    await expect(gapBelow(password, main)).toBe(formSpace.bodyToAction)
    await expect(gapBelow(main, divider)).toBe(formSpace.actionToDivider)
    await expect(gapBelow(divider, google)).toBe(
      formSpace.dividerToAlternatives,
    )
    await expect(gapBelow(google, apple)).toBe(formSpace.alternativesGap)

    // Label to control, and the link 4 under the control.
    for (const field of [email, password]) {
      const label = field.querySelector('label') as HTMLElement
      const shell = (field.querySelector('input') as HTMLElement)
        .parentElement as HTMLElement
      await expect(gapBelow(label, shell)).toBe(formSpace.labelToControl)
      await expect(heightOf(shell)).toBe(formSpace.controlHeight)
    }
    const passwordShell = (password.querySelector('input') as HTMLElement)
      .parentElement as HTMLElement
    await expect(
      gapBelow(
        passwordShell,
        canvas.getByText('Forgot password?').parentElement as Element,
      ),
    ).toBe(formSpace.controlToHelper)

    // 48 tall: the main button and Google and Apple.
    for (const button of [main, google, apple]) {
      await expect(heightOf(button)).toBe(formSpace.controlHeight)
    }
  },
}
