import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyMe,
  storyWorkerDraft,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { ProfileScreen } from './ProfileScreen'

const screenFor = (me: MeSnapshot): Story => ({
  decorators: [withSession({ me })],
})

const meta = {
  title: 'Dashboard/Profile/ProfileScreen',
  component: ProfileScreen,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/profile' } },
  },
} satisfies Meta<typeof ProfileScreen>

export default meta
type Story = StoryObj<typeof meta>

/** `customer`: hero with the public link, the worker invitation, Visibility. */
export const Customer: Story = {
  ...screenFor(storyMe()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Profile' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: /View public profile/ }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Become a worker' }),
    ).toBeVisible()
    // Contact lives on Account now.
    await expect(canvas.queryByText('sam.carter@example.com')).toBeNull()
  },
}

/** `customerHidden`: private; only you can open the preview ("See what others see"). */
export const CustomerHidden: Story = {
  ...screenFor(storyMe({ settings: { isProfilePrivate: true } })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Hidden')).toBeVisible()
    await expect(
      canvas.queryByRole('link', { name: /View public profile/ }),
    ).toBeNull()
    await expect(
      canvas.getByRole('link', { name: /See what others see/ }),
    ).toHaveAttribute('href', '/profile/user-story')
  },
}

/** `workerSetup`: the draft, and Continue setup as the next step. */
export const WorkerSetup: Story = {
  ...screenFor(storyWorkerMe({ worker: storyWorkerDraft() })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Setup in progress')).toBeVisible()
    await expect(
      canvas.getAllByRole('link', { name: 'Continue setup' }).length,
    ).toBeGreaterThan(0)
    await expect(
      canvas.queryByRole('link', { name: /View public profile/ }),
    ).toBeNull()
  },
}

/** `workerHidden`: the API says HIDDEN; editable, with the owner preview link. */
export const WorkerHidden: Story = {
  ...screenFor(storyWorkerMe({ settings: { isProfilePrivate: true } })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    // The hero badge and the worker card's badge.
    await expect(await canvas.findAllByText('Hidden')).toHaveLength(2)
    await expect(canvas.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: /See what others see/ }),
    ).toHaveAttribute('href', '/profile/user-story')
  },
}

/** `workerVerifyPhone`: Verify phone as the next step, to Account. */
export const WorkerVerifyPhone: Story = {
  ...screenFor(storyWorkerMe({ phoneVerified: false })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Action required')).toBeVisible()
    const [verify] = canvas.getAllByRole('link', { name: 'Verify phone' })
    await expect(verify).toHaveAttribute('href', '/account#contact')
  },
}

/** `workerReady`: nothing pending; to-dos sit in the worker card. */
export const WorkerReady: Story = {
  ...screenFor(storyWorkerMe()),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Worker active')).toBeVisible()
    await expect(canvas.queryByText('Your next step')).toBeNull()
    await expect(canvas.getByText('To do')).toBeVisible()
  },
}

/** Suspended: read only, no next step, the switch disabled. */
export const Suspended: Story = {
  ...screenFor(storyWorkerMe({ disabled: true, phoneVerified: false })),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText('Action required')).toBeVisible()
    await expect(canvas.queryByText('Your next step')).toBeNull()
    await expect(canvas.queryByRole('button', { name: 'Edit' })).toBeNull()
    await expect(
      canvas.getByRole('checkbox', { name: 'Private profile' }),
    ).toBeDisabled()
  },
}

/** zh-HK: views, hero and cards in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/profile' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
    withSession({ me: storyWorkerMe() }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: '個人檔案' }),
    ).toBeVisible()
    await expect(canvas.getByText('工作者已啟用')).toBeVisible()
    await expect(canvas.getByText('可見度')).toBeVisible()
  },
}

/** Phones: the next step comes first, above the hero. */
export const Phone: Story = {
  ...screenFor(storyWorkerMe({ phoneVerified: false })),
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('button', { name: 'Back' }),
    ).toBeVisible()
    const steps = canvas.getAllByText('Your next step')
    await expect(steps.some((step) => step.checkVisibility())).toBe(true)
  },
}

/** Editing: Edit on the worker card opens the drawer. */
export const EditWorker: Story = {
  ...screenFor(storyWorkerMe()),
  args: { initialEditSection: 'worker' },
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('dialog', {
        name: 'Edit worker profile',
      }),
    ).toBeInTheDocument()
  },
}
