import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { CreateTaskVerifyEmailGate } from './CreateTaskVerifyEmailGate'

/**
 * create.verifyEmail (FE-447): before the first step, an account with an
 * unverified email is asked to verify it, as in the app. Verify email goes to
 * the sent screen and `next` brings it back to Post a task.
 */
const meta = {
  title: 'Create task/CreateTaskVerifyEmailGate',
  component: CreateTaskVerifyEmailGate,
  parameters: { layout: 'fullscreen' },
  args: {
    email: 'alex@example.com',
    verifyHref: '/verify-email/sent?next=%2Ftasks%2Fcreate',
    onShown: fn(),
  },
} satisfies Meta<typeof CreateTaskVerifyEmailGate>

export default meta
type Story = StoryObj<typeof meta>

const zhHk: Decorator = (Story) => (
  <LocaleProvider>
    <Story />
  </LocaleProvider>
)

/** The title, the reason with the email, and Verify email on the sent screen. */
export const Default: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'Verify your email to post',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByText('Verify your email before you post.'),
    ).toBeVisible()
    await expect(
      canvas.getByText('Confirm alex@example.com before posting a task.'),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Verify email' }),
    ).toHaveAttribute('href', '/verify-email/sent?next=%2Ftasks%2Fcreate')
    await expect(
      canvas.getByRole('link', { name: 'Close task creation' }),
    ).toBeVisible()
    await expect(args.onShown).toHaveBeenCalledTimes(1)
  },
}

/** Phone: the same screen, full width. */
export const Phone: Story = {
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: 'Verify your email to post' }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('link', { name: 'Verify email' }),
    ).toBeVisible()
  },
}

/** zh-HK: the app's copy. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/tasks/create' } } },
  decorators: [zhHk],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { name: '請先驗證電郵才可發佈' }),
    ).toBeVisible()
    await expect(canvas.getByText('發佈前請先驗證電郵。')).toBeVisible()
    await expect(
      canvas.getByText('發佈任務前請先確認 alex@example.com。'),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: '驗證電郵' })).toBeVisible()
  },
}
