import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import {
  FieldIconMail,
  IconArrowRight,
  IconLockReset,
} from './ForgotPasswordIcons'

const meta = {
  title: 'Auth/ForgotPasswordIcons',
  component: FieldIconMail,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof FieldIconMail>

export default meta
type Story = StoryObj<typeof meta>

/** Mail glyph at the start of the email field. */
export const FieldMail: Story = {}

/** Padlock with a reset arrow, above the form title. */
export const LockReset: Story = {
  render: () => <IconLockReset />,
}

/** Arrow after the submit label. */
export const ArrowRight: Story = {
  render: () => <IconArrowRight />,
}
