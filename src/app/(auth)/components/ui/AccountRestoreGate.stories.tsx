import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { formSpace } from '@/theme/styles'
import { gapBelow, heightOf } from '@/ui/FormField/formGap.testing'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  viewportAt,
} from '@/ui/PageContainer/pageLines.testing'
import { expectCentredCardBox } from '@/ui/StatusCard/statusCard.testing'

import { withSession } from '../../helpers/authStoryDecorator'
import { storyMe } from '../../helpers/authStoryFixtures'
import { AccountRestoreGate, AccountRestoreScreen } from './AccountRestoreGate'

const DELETION_DATE = '2026-11-12T12:00:00.000Z'
const scheduledMe = storyMe({ deletionScheduledFor: DELETION_DATE })

const meta = {
  title: 'Auth/Parts/AccountRestoreGate',
  component: AccountRestoreScreen,
  parameters: { layout: 'fullscreen' },
  args: { scheduledFor: DELETION_DATE },
} satisfies Meta<typeof AccountRestoreScreen>

export default meta
type Story = StoryObj<typeof meta>

type Canvas = ReturnType<typeof within>

/**
 * A status page (wiki: Foundations-Form-Spacing), measured between visible
 * edges: the title 8 above its text, the header block 24 above the buttons,
 * which are 48 tall and 8 apart.
 */
async function expectStatusSpacing(canvas: Canvas) {
  const title = await canvas.findByRole('heading', {
    name: 'Your account is scheduled for deletion',
  })
  const note = canvas.getByText(/Restoring brings your profile back/)
  const restore = canvas.getByRole('button', { name: 'Restore my account' })
  const signOut = canvas.getByRole('button', { name: 'Sign out' })
  // The card's text block: the title (in its own wrapper) and the note under it.
  const text = title.parentElement?.parentElement as HTMLElement
  const header = text.parentElement as HTMLElement

  await expect(gapBelow(title, text.children[1])).toBe(
    formSpace.titleToSubtitle,
  )
  await expect(gapBelow(header, restore)).toBe(formSpace.headerToBody)
  await expect(gapBelow(restore, signOut)).toBe(formSpace.alternativesGap)
  await expect(heightOf(restore)).toBe(formSpace.controlHeight)
  await expect(heightOf(signOut)).toBe(formSpace.controlHeight)
  // The note is the last line of the header block.
  await expect(text.lastElementChild).toBe(note)
}

const CARD_NAME = 'Your account is scheduled for deletion'

/** R6: the shared status card, centred, 448 wide (the container on a phone). */
const expectStatusCard = (canvasElement: HTMLElement) =>
  expectCentredCardBox(
    canvasElement,
    within(canvasElement).getByRole('region', { name: CARD_NAME }),
  )

/** Signed in while the account is waiting for deletion. */
export const Default: Story = {
  ...viewportAt(1366),
  decorators: [withSession({ me: scheduledMe })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        name: 'Your account is scheduled for deletion',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Restore my account' }),
    ).toBeEnabled()
    await expectStatusSpacing(canvas)
    expectWindowWidth(canvasElement, 1366)
    expectStatusCard(canvasElement)
    expectPx(boxOf(canvas.getByRole('region', { name: CARD_NAME })).width, 448)
  },
}

/** Opened from an error before `me` had the date. */
export const WithoutDate: Story = {
  args: { scheduledFor: null },
  decorators: [withSession({ me: scheduledMe })],
}

/** Restore pressed and the API has not answered yet: the button is busy. */
export const Restoring: Story = {
  decorators: [withSession({ me: scheduledMe })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Restore my account' }),
    )
    await waitFor(() =>
      expect(
        canvasElement.querySelector('button[data-loading]'),
      ).toBeDisabled(),
    )
  },
}

/** Phones: the card is the container (358 at 390), with the same gaps. */
export const Phone: Story = {
  ...viewportAt(390),
  decorators: [withSession({ me: scheduledMe })],
  play: async ({ canvasElement }) => {
    await expectStatusSpacing(within(canvasElement))
    expectWindowWidth(canvasElement, 390)
    expectStatusCard(canvasElement)
    expectPx(
      boxOf(within(canvasElement).getByRole('region', { name: CARD_NAME }))
        .width,
      358,
    )
  },
}

/** The gate for an account waiting for deletion: the restore screen replaces the app. */
export const GateScheduledForDeletion: Story = {
  decorators: [withSession({ me: scheduledMe })],
  render: () => (
    <AccountRestoreGate>
      <p>The app</p>
    </AccountRestoreGate>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Restore my account' }),
    ).toBeVisible()
    await expect(canvas.queryByText('The app')).toBeNull()
  },
}

/** The gate for a normal account: the app shows through. */
export const GateActiveAccount: Story = {
  decorators: [withSession({ me: storyMe() })],
  render: () => (
    <AccountRestoreGate>
      <p>The app</p>
    </AccountRestoreGate>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('The app')).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Restore my account' }),
    ).toBeNull()
  },
}
