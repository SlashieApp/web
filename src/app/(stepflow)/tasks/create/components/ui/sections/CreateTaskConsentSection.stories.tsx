import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { createTaskStoryErrors } from '../../createTaskStoryFixtures'
import { CreateTaskConsentSection } from './CreateTaskConsentSection'

function Demo({
  accepted: initial = false,
  errorText,
}: {
  accepted?: boolean
  errorText?: string
}) {
  const [accepted, setAccepted] = useState(initial)
  return (
    <CreateTaskConsentSection
      accepted={accepted}
      onChange={setAccepted}
      errorText={errorText}
    />
  )
}

const meta = {
  title: 'Create task/CreateTaskConsentSection',
  component: Demo,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The allowed-tasks notice and the box to tick before posting. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole('checkbox')
    await userEvent.click(box)
    await expect(box).toBeChecked()
  },
}

/** Ticked. */
export const Accepted: Story = { args: { accepted: true } }

/** Post task pressed without the tick: the real message shows. */
export const Required: Story = {
  args: { errorText: createTaskStoryErrors().acceptedProhibitedUse },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText(
        'Tick the box to confirm this task is allowed.',
      ),
    ).toBeVisible()
  },
}
