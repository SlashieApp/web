import { TaskContactMethod } from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'

import type { MeSnapshot } from '@/app/(auth)/store/user'
import { getContactOptions } from '@/app/(dashboard)/profile/profileEligibility'

import { createTaskStoryErrors } from '../../createTaskStoryFixtures'
import {
  CreateTaskContactSection,
  type CreateTaskContactSectionProps,
} from './CreateTaskContactSection'

function options(emailVerified: boolean, phoneVerified: boolean) {
  return getContactOptions({ emailVerified, phoneVerified } as MeSnapshot)
}

type DemoProps = Omit<
  CreateTaskContactSectionProps,
  'onPreferredContactMethodChange' | 'onAcceptedProhibitedUseChange'
> & { withProhibitedNotice?: boolean }

function CreateTaskContactSectionDemo({
  preferredContactMethod,
  acceptedProhibitedUse = false,
  withProhibitedNotice = true,
  ...props
}: DemoProps) {
  const [method, setMethod] = useState(preferredContactMethod)
  const [accepted, setAccepted] = useState(acceptedProhibitedUse)
  return (
    <CreateTaskContactSection
      {...props}
      preferredContactMethod={method}
      onPreferredContactMethodChange={setMethod}
      acceptedProhibitedUse={accepted}
      onAcceptedProhibitedUseChange={
        withProhibitedNotice ? setAccepted : undefined
      }
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

/** Email and phone both verified: all three methods can be chosen. */
export const AllVerified: Story = {}

/** Phone chosen and verified: its button is the highlighted one. */
export const PhoneSelected: Story = {
  args: { preferredContactMethod: TaskContactMethod.Phone },
}

/** Email chosen and verified: its button is the highlighted one. */
export const EmailSelected: Story = {
  args: { preferredContactMethod: TaskContactMethod.Email },
}

/** Phone chosen but not verified: it is disabled and links to verify it. */
export const PhoneNotVerified: Story = {
  args: {
    preferredContactMethod: TaskContactMethod.Phone,
    contactOptions: options(true, false),
  },
}

/** Email not verified: it is disabled with a hint. */
export const EmailNotVerified: Story = {
  args: { contactOptions: options(false, true) },
}

/** Nothing verified: only in-app chat can be chosen. */
export const NothingVerified: Story = {
  args: { contactOptions: options(false, false) },
}

/** The allowed-tasks confirmation is ticked. */
export const ProhibitedAccepted: Story = {
  args: { acceptedProhibitedUse: true },
}

/** Publish pressed without the confirmation: the real message shows. */
export const ProhibitedRequired: Story = {
  args: {
    prohibitedError: createTaskStoryErrors().acceptedProhibitedUse,
  },
}

/** Edit flow: no allowed-tasks notice or confirmation. */
export const WithoutProhibitedNotice: Story = {
  args: { withProhibitedNotice: false },
}

/** Card mode (edit page): the fields sit in a titled section card. */
export const CardMode: Story = {
  args: { bare: false, withProhibitedNotice: false },
}
