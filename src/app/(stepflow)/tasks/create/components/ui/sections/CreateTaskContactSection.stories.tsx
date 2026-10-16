import { TaskContactMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'

import {
  CreateTaskContactSection,
  type CreateTaskContactSectionProps,
} from './CreateTaskContactSection'

function options(emailVerified: boolean, phoneVerified: boolean) {
  return getContactOptions({ emailVerified, phoneVerified } as MeSnapshot)
}

type DemoProps = Omit<
  CreateTaskContactSectionProps,
  'onPreferredContactMethodChange'
>

function CreateTaskContactSectionDemo({
  preferredContactMethod,
  ...props
}: DemoProps) {
  const [method, setMethod] = useState(preferredContactMethod)
  return (
    <CreateTaskContactSection
      {...props}
      preferredContactMethod={method}
      onPreferredContactMethodChange={setMethod}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskContactSection',
  component: CreateTaskContactSectionDemo,
  parameters: { layout: 'padded' },
  args: {
    bare: true,
    preferredContactMethod: TaskContactMethod.InApp,
    contactOptions: options(true, true),
  },
} satisfies Meta<typeof CreateTaskContactSectionDemo>

export default meta
type Story = StoryObj<typeof meta>

/** Email and phone both verified: all three can be chosen, as radio buttons. */
export const AllVerified: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('radio', { name: 'Phone' }))
    await expect(canvas.getByRole('radio', { name: 'Phone' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  },
}

/** Phone chosen and verified. */
export const PhoneSelected: Story = {
  args: { preferredContactMethod: TaskContactMethod.Phone },
}

/** Email chosen and verified. */
export const EmailSelected: Story = {
  args: { preferredContactMethod: TaskContactMethod.Email },
}

/** Phone chosen but not verified: disabled, with why and a link to verify. */
export const PhoneNotVerified: Story = {
  args: {
    preferredContactMethod: TaskContactMethod.Phone,
    contactOptions: options(true, false),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getByRole('radio', { name: 'Phone' })).toBeDisabled()
    await expect(
      canvas.getByRole('link', { name: 'Verify phone in Account' }),
    ).toHaveAttribute('href', '/account')
  },
}

/** Email not verified: disabled, with why. */
export const EmailNotVerified: Story = {
  args: { contactOptions: options(false, true) },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        'Verify your email in Account to use this.',
      ),
    ).toBeVisible()
  },
}

/** Nothing verified: only in-app chat can be chosen. */
export const NothingVerified: Story = {
  args: { contactOptions: options(false, false) },
}

/** Card mode (edit page): the fields sit in a titled section. */
export const CardMode: Story = {
  args: { bare: false, sectionHeading: 'Preferred contact' },
}
