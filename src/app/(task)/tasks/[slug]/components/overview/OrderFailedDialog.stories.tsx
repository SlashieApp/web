import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import {
  barButton,
  bodyColumn,
  expectNoHorizontalOverflow,
  expectPhoneWidth,
  gapsBetweenChildren,
  openDialog,
  phone390,
} from '@/app/(dashboard)/components/ui/dialogSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'

import { scrollToEnd } from '@/ui/Modal/taskDialogSpacing.testing'
import { withTaskDetailStory } from '../../helpers/taskDetailStoryDecorator'
import { storyTaskOrder } from '../../helpers/taskDetailStoryFixtures'
import { OrderFailedDialog } from './OrderFailedDialog'

const meta = {
  title: 'Task detail/Overview/OrderFailedDialog',
  component: OrderFailedDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    withTaskDetailStory({ viewer: 'worker', order: storyTaskOrder() }),
  ],
  args: { open: true, onOpenChange: fn() },
} satisfies Meta<typeof OrderFailedDialog>

export default meta
type Story = StoryObj<typeof meta>

/** The dialog portals to the page, outside the story canvas. */
const dialog = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body).findByRole('dialog', {
    name: 'What went wrong?',
  })

/** Open with no reason picked: the submit button is disabled. */
export const Open: Story = {
  play: async ({ canvasElement }) => {
    const panel = within(await dialog(canvasElement))
    await panel.findByText(/Only you can see the reason/)
    expect(panel.getByRole('button', { name: 'Mark as Failed' })).toBeDisabled()
  },
}

/** A reason picked: the submit button is enabled. */
export const ReasonSelected: Story = {
  play: async ({ canvasElement }) => {
    const panel = within(await dialog(canvasElement))
    await userEvent.click(panel.getByText("The work wasn't done"))
    await waitFor(() =>
      expect(
        panel.getByRole('button', { name: 'Mark as Failed' }),
      ).toBeEnabled(),
    )
  },
}

/** Closed: nothing is on screen. */
export const Closed: Story = {
  args: { open: false },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('dialog'),
    ).toBeNull()
  },
}

/**
 * Form spacing (FE-481, wiki Foundations-Form-Spacing), read between visible
 * edges. The title names the group, so the reasons are the first block, 24 under
 * it; they sit 8 apart (a stack of bordered tap boxes), the private note is
 * their helper line 4 under the last, and the body ends 20 above the buttons.
 */
async function expectFailedSpacing(canvasElement: HTMLElement) {
  const { dialog, title, description, body } = await openDialog(
    canvasElement,
    'What went wrong?',
  )
  const group = bodyColumn(body).firstElementChild as HTMLElement
  const [reasons, note] = [...group.children] as HTMLElement[]
  const rows = [...reasons.children] as HTMLElement[]

  await expect(description).toBeNull()
  await expect(rows).toHaveLength(4)
  await expect(gapBelow(title, rows[0])).toBe(formSpace.headerToBody)
  await expect(gapsBetweenChildren(reasons)).toEqual(Array(3).fill(8))
  for (const row of rows) {
    await expect(heightOf(row)).toBeGreaterThanOrEqual(44)
  }
  await expect(gapBelow(reasons, note)).toBe(formSpace.controlToHelper)
  await expect(note).toHaveTextContent(/Only you can see the reason/)
  await expect(reasons).toHaveAccessibleDescription(
    /Only you can see the reason/,
  )
  await scrollToEnd(body)
  await expect(gapBelow(note, barButton(dialog, 'Mark as Failed'))).toBeCloseTo(
    formSpace.bodyToAction,
    0,
  )
  expectNoHorizontalOverflow(body)
}

/** Desktop: the gaps above. */
export const Spacing: Story = {
  play: ({ canvasElement }) => expectFailedSpacing(canvasElement),
}

/** The same gaps at phone width. */
export const SpacingPhone: Story = {
  ...phone390,
  play: async ({ canvasElement }) => {
    expectPhoneWidth(canvasElement)
    await expectFailedSpacing(canvasElement)
  },
}
