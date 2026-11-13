import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { LocaleProvider } from '@/i18n/LocaleProvider'

import { withSession } from '../../helpers/authStoryDecorator'
import { storyMe } from '../../helpers/authStoryFixtures'
import { AppStatusBanners } from './AppStatusBanners'

const meta = {
  title: 'Auth/AppStatusBanners',
  component: AppStatusBanners,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof AppStatusBanners>

export default meta
type Story = StoryObj<typeof meta>

/** Verified, active account: no banner is shown. */
export const Clear: Story = {
  decorators: [withSession({ me: storyMe() })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.queryByRole('alert')).toBeNull()
    await expect(canvas.queryByText(/Verify your email/)).toBeNull()
  },
}

/** Unverified email: the verify notice with Check inbox and Resend email. */
export const EmailUnverified: Story = {
  decorators: [withSession({ me: storyMe({ emailVerified: false }) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByText(/Verify your email/)).toBeVisible()
  },
}

/** Suspended account: only the suspension notice. */
export const Suspended: Story = {
  decorators: [withSession({ me: storyMe({ disabled: true }) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(await canvas.findByRole('alert')).toBeVisible()
    await expect(canvas.queryByText(/Verify your email/)).toBeNull()
  },
}

/** Suspended and unverified: suspension first, then the email notice. */
export const SuspendedAndUnverified: Story = {
  decorators: [
    withSession({ me: storyMe({ disabled: true, emailVerified: false }) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const suspension = await canvas.findByRole('alert')
    const verify = await canvas.findByText(/Verify your email/)
    await expect(
      suspension.compareDocumentPosition(verify) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
    // FE-541: one look. Both texts start on the same left edge, 16px in,
    // left-aligned, in the same colours; the verify actions sit under the text.
    const notices = [
      canvasElement.querySelector<HTMLElement>('[data-suspended-banner]'),
      canvasElement.querySelector<HTMLElement>('[data-verify-banner]'),
    ]
    const texts = notices.map((notice) => {
      const text = notice?.querySelector<HTMLElement>(':scope > div > div')
      if (!notice || !text) throw new Error('Notice missing')
      return { notice, text }
    })
    const [a, b] = texts as [(typeof texts)[0], (typeof texts)[0]]
    await expect(a.text.getBoundingClientRect().left).toBe(
      b.text.getBoundingClientRect().left,
    )
    await expect(
      a.text.getBoundingClientRect().left -
        a.notice.getBoundingClientRect().left,
    ).toBe(16)
    for (const { notice, text } of texts) {
      await expect(getComputedStyle(text).textAlign).toBe('left')
      await expect(getComputedStyle(notice).backgroundColor).toBe(
        getComputedStyle(a.notice).backgroundColor,
      )
    }
    const actions = b.notice.querySelector('[data-notice-actions]')
    if (!actions) throw new Error('No actions')
    await expect(actions.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      b.text.getBoundingClientRect().bottom,
    )
  },
}

/** Traditional Chinese (FE-477, FE-541): the verify notice and its actions read in Chinese. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
    withSession({ me: storyMe({ emailVerified: false }) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('請驗證你的電郵，以便發佈任務和發送報價。'),
    ).toBeVisible()
    await expect(canvas.getByRole('link', { name: '查看收件匣' })).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: '重新傳送電郵' }),
    ).toBeVisible()
    await expect(canvasElement.textContent).not.toMatch(/Verify|Check inbox/)
  },
}
