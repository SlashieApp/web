import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'

import { expectGaps } from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow } from '@/ui/FormField/formGap.testing'
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

/**
 * Form spacing (FE-481): the notice and the checkbox are field groups, 20 apart.
 * The row is the label's lines (20), its 44px hit area grows into the gaps
 * around it, and the error is 4 under it.
 */
export const Spacing: Story = {
  args: { errorText: createTaskStoryErrors().acceptedProhibitedUse },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const label = canvas.getByText(/I confirm this task is legal/)
    const group = label.closest('label')?.parentElement as HTMLElement
    const notice = group.previousElementSibling as HTMLElement
    await expectGaps([notice, group], formSpace.fieldGap)
    await expect(label.getBoundingClientRect().height).toBe(20)
    const row = label.parentElement as HTMLElement
    await expect(row.getBoundingClientRect().height).toBeGreaterThanOrEqual(44)
    await expect(
      gapBelow(label, canvas.getByText(/Tick the box to confirm/)),
    ).toBe(formSpace.controlToHelper)
  },
}
