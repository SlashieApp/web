import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyMe,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'

import { ProfileWorkerForm } from './ProfileWorkerForm'

const meta = {
  title: 'Dashboard/Profile/ProfileWorkerForm',
  component: ProfileWorkerForm,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProfileWorkerForm>

export default meta
type Story = StoryObj<typeof meta>

/** Customer with no worker profile: a card that starts worker setup. */
export const NotAWorker: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('link', {
        name: 'Start worker setup',
      }),
    ).toBeVisible()
  },
}

/** Setup unfinished: only a summary of what is saved so far, and Continue setup. */
export const SetupInProgress: Story = {
  decorators: [
    withSession({
      me: storyMe({
        profile: { contactNumber: '+447700900123' },
        worker: storyWorkerDraft(),
      }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('Worker profile (in progress)'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Continue setup' }),
    ).toBeVisible()
  },
}

/** Published worker: the full editor, Save disabled until something changes. */
export const Published: Story = {
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByLabelText('Legal name')).toHaveValue(
      'Sam Carter',
    )
    await expect(
      canvas.getByRole('button', { name: 'Save worker profile' }),
    ).toBeDisabled()
  },
}

/** A required field cleared: Save is enabled and shows the validation error instead of sending. */
export const ValidationError: Story = {
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.clear(await canvas.findByLabelText('Legal name'))
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save worker profile' }),
    )
    await expect(
      await canvas.findByText(/Please enter your legal name/),
    ).toBeVisible()
  },
}

/** Inside the edit drawer: no card chrome, with Cancel and Save in a sticky footer. */
export const Embedded: Story = {
  args: { embedded: true },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Save' }),
    ).toBeDisabled()
    await expect(canvas.getByRole('button', { name: 'Cancel' })).toBeEnabled()
  },
}
