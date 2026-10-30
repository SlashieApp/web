import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyAvatarUrl,
  storyMe,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import {
  barOf,
  expectBar,
  expectFieldWith,
  expectFieldsApart,
  expectTitleBlock,
  expectWithinHalfPixel,
  openEditor,
} from '@/app/(dashboard)/profile/profileSpacing.testing'
import {
  desktop1280,
  expectWidth,
  fieldByLabel,
  phone390,
} from '@/app/(stepflow)/stepFlowSpacing.testing'
import { formSpace } from '@/theme/styles'
import { gapBelow, gapBeside, heightOf } from '@/ui/FormField/formGap.testing'
import { scrollToEnd } from '@/ui/Modal/taskDialogSpacing.testing'
import { controlsUnderBar } from '@/ui/focusClearance.testing'

import { ProfileEditDrawer } from './ProfileEditDrawer'

const meta = {
  title: 'Dashboard/Profile/ProfileEditDrawer',
  component: ProfileEditDrawer,
  parameters: { layout: 'padded' },
  args: { section: 'personal', onOpenChange: fn() },
} satisfies Meta<typeof ProfileEditDrawer>

export default meta
type Story = StoryObj<typeof meta>

const drawer = (canvasElement: HTMLElement) =>
  within(canvasElement.ownerDocument.body)

/** Edit details: display name and private date of birth. */
export const Personal: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit details',
      }),
    ).toBeInTheDocument()
    await expect(
      drawer(canvasElement).getByLabelText('Display name'),
    ).toHaveValue('Sam Carter')
  },
}

/** Profile photo: the upload card. */
export const Photo: Story = {
  args: { section: 'photo' },
  decorators: [
    withSession({
      me: storyMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit profile photo',
      }),
    ).toBeInTheDocument()
  },
}

/** Phone: Replace photo opens the camera-or-library sheet over the drawer, Take photo the camera over both; closing it keeps the drawer. */
export const PhotoSourceOnPhone: Story = {
  args: { section: 'photo' },
  parameters: { touchScreen: true },
  globals: { viewport: { value: 'mobile1' } },
  decorators: [
    withSession({
      me: storyMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    const body = drawer(canvasElement)
    const editor = await body.findByRole('dialog', {
      name: 'Edit profile photo',
    })
    const replace = within(editor).getByRole('button', {
      name: 'Replace photo',
    })
    await userEvent.click(replace)
    const sheet = await body.findByRole('dialog', { name: 'Add a photo' })
    await userEvent.click(
      within(sheet).getByRole('button', { name: 'Take photo' }),
    )
    const camera = await body.findByRole('dialog', { name: 'Take a photo' })
    await userEvent.click(
      within(camera).getByRole('button', { name: 'Close camera' }),
    )
    await waitFor(() => expect(camera).not.toBeInTheDocument())
    await waitFor(() => expect(sheet).not.toBeInTheDocument())
    await expect(editor).toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveFocus())
  },
}

/** Worker profile of a published worker: the full editor. */
export const Worker: Story = {
  args: { section: 'worker' },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit worker profile',
      }),
    ).toBeInTheDocument()
  },
}

/** Closed: nothing is rendered. */
export const Closed: Story = {
  args: { section: null },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(drawer(canvasElement).queryByRole('dialog')).toBeNull()
  },
}

/** Phones: the drawer takes the full width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    await expect(
      await drawer(canvasElement).findByRole('dialog', {
        name: 'Edit details',
      }),
    ).toBeInTheDocument()
  },
}

/** The width of a field (its root), for two fields that share a row. */
const widthOf = (element: Element) => element.getBoundingClientRect().width

/**
 * Edit details on the form spacing: the description 8 under the title, the
 * first field 24 under that, the two fields 20 apart (label 8, helper 4), and
 * Cancel and Save, 48 tall and 12 apart, on the right, 20 under the last field.
 */
async function expectPersonal(canvasElement: HTMLElement) {
  const found = await openEditor(canvasElement, 'Edit details')
  const { dialog, title, description, stack } = found
  const name = await expectFieldWith(
    dialog,
    'Display name',
    'Shown publicly on your profile, tasks, and quotes.',
  )
  await expectFieldWith(
    dialog,
    'Date of birth',
    'Private. Used only for age and eligibility checks. You must be 18 or over.',
  )
  await expectTitleBlock(title, description, name)
  await expect(stack.children).toHaveLength(3)
  await expectFieldsApart(stack)
  const { cancel, save } = await expectBar(found)
  // Nothing to save yet; Cancel is always there.
  await expect(save).toBeDisabled()
  await expect(cancel).toBeEnabled()
}

/** Edit details, wide: the editor on the spacing system. */
export const PersonalSpacing: Story = {
  ...desktop1280,
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 1280)
    await expectPersonal(canvasElement)
  },
}

/** Edit details, at 390: the same gaps, the helper wraps onto two lines. */
export const PersonalSpacingPhone: Story = {
  ...phone390,
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    await expectPersonal(canvasElement)
  },
}

/**
 * The worker editor on the form spacing: the first field 24 under the
 * description, every field 20 apart (the years and the radius side by side 12
 * apart from md, one under the other 20 apart on a phone), the last field 20
 * above Cancel and Save, which are 48 tall. The bar is pinned: it does not move
 * between the top of the scroll and the end, and it rests 16 above the bottom
 * edge of the drawer.
 */
async function expectWorker(
  canvasElement: HTMLElement,
  { wide }: { wide: boolean },
) {
  const found = await openEditor(canvasElement, 'Edit worker profile')
  const { dialog, title, description, body, stack } = found
  const legal = await expectFieldWith(
    dialog,
    'Legal name',
    'Your full legal name on your public worker profile.',
  )
  await expectFieldWith(
    dialog,
    'Professional headline',
    'Shown under your name on your public profile.',
  )
  await expectTitleBlock(title, description, legal)
  await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)

  // The bar is pinned: the same place at the top of the scroll and at the end.
  const { save } = barOf(stack)
  const pinned = save.getBoundingClientRect().bottom
  await expect(dialog.getBoundingClientRect().bottom - pinned).toBe(16)
  await scrollToEnd(body)
  expectWithinHalfPixel(save.getBoundingClientRect().bottom, pinned)

  // Years and radius: a row from md, a stack on a phone.
  const years = fieldByLabel(stack, 'Years of experience')
  const radius = fieldByLabel(stack, 'Travel radius (miles)')
  await expectFieldWith(dialog, 'Years of experience')
  await expectFieldWith(dialog, 'Travel radius (miles)', 'Optional')
  if (wide) {
    await expect(gapBeside(years, radius)).toBe(formSpace.inlineGap)
    await expect(Math.abs(widthOf(years) - widthOf(radius))).toBeLessThan(0.5)
  } else {
    await expect(gapBelow(years, radius)).toBe(formSpace.fieldGap)
  }

  // The service area is a plain field too.
  await expectFieldWith(
    dialog,
    'Service area',
    'City or postcode. Coordinates are refreshed when you save.',
  )

  await expectFieldsApart(stack)
  const { cancel } = await expectBar(found)
  await expect(heightOf(cancel)).toBe(formSpace.controlHeight)
}

/** Edit worker profile, wide. */
export const WorkerSpacing: Story = {
  ...desktop1280,
  args: { section: 'worker' },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 1280)
    await expectWorker(canvasElement, { wide: true })
  },
}

/** Edit worker profile, at 390: the years and the radius stack 20 apart. */
export const WorkerSpacingPhone: Story = {
  ...phone390,
  args: { section: 'worker' },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 390)
    await expectWorker(canvasElement, { wide: false })
  },
}

/**
 * Keyboard focus clears the pinned Cancel and Save bar (WCAG 2.4.11): tabbing
 * down the worker editor scrolls the years, the radius, the links and the
 * certification chips to above the bar, never under it. Wide and on a phone.
 */
export const WorkerFocusClearsBar: Story = {
  ...desktop1280,
  args: { section: 'worker' },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    const { stack, body } = await openEditor(
      canvasElement,
      'Edit worker profile',
    )
    await expect(body.scrollHeight).toBeGreaterThan(body.clientHeight)
    await expect(getComputedStyle(body).scrollPaddingBottom).toBe('84px')
    const { bar } = barOf(stack)
    await expect(await controlsUnderBar(bar)).toEqual([])
  },
}

/** The same at 390, where the fields stack and the body is longer. */
export const WorkerFocusClearsBarPhone: Story = {
  ...phone390,
  args: { section: 'worker' },
  decorators: [withSession({ me: storyWorkerMe() })],
  play: async ({ canvasElement }) => {
    const { stack } = await openEditor(canvasElement, 'Edit worker profile')
    const { bar } = barOf(stack)
    await expect(await controlsUnderBar(bar)).toEqual([])
  },
}

/**
 * A refused save shows its line first: a form-level line is a field group, so
 * it is 24 under the description and the first field is 20 under it.
 */
export const WorkerSaveErrorSpacing: Story = {
  ...desktop1280,
  args: { section: 'worker' },
  decorators: [
    withSession({
      me: storyWorkerMe(),
      responses: {
        UpdateWorkerProfile: {
          kind: 'graphqlError',
          code: 'INTERNAL_SERVER_ERROR',
          message: 'TAGLINE_TOO_LONG',
        },
      },
    }),
  ],
  play: async ({ canvasElement }) => {
    const { dialog, description, stack } = await openEditor(
      canvasElement,
      'Edit worker profile',
    )
    await userEvent.type(within(dialog).getByLabelText('Legal name'), ' Jr')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Save' }))
    const alert = await within(dialog).findByRole('alert')
    await expect(alert).toHaveTextContent(
      'Keep your headline under 80 characters.',
    )
    await expect(alert.parentElement).toBe(stack)
    await expect(stack.firstElementChild).toBe(alert)
    await expect(gapBelow(description, alert)).toBe(formSpace.headerToBody)
    await expect(gapBelow(alert, fieldByLabel(stack, 'Legal name'))).toBe(
      formSpace.fieldGap,
    )
  },
}

/** The photo editor: the card is 24 under the description. */
export const PhotoSpacing: Story = {
  ...desktop1280,
  args: { section: 'photo' },
  decorators: [
    withSession({
      me: storyMe({ profile: { avatarUrl: storyAvatarUrl('SC') } }),
    }),
  ],
  play: async ({ canvasElement }) => {
    expectWidth(canvasElement, 1280)
    const { dialog, title, description, body } = await openEditor(
      canvasElement,
      'Edit profile photo',
    )
    // No bar of its own: the upload saves, and the body keeps its padding.
    await expect(dialog.querySelector('form')).toBeNull()
    await expect(getComputedStyle(body).paddingBottom).toBe('24px')
    await expectTitleBlock(
      title,
      description,
      dialog.querySelector('#profile-photo') as HTMLElement,
    )
  },
}
