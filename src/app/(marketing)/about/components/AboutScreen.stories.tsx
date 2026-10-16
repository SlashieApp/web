import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import marketingMessages from '@/app/(marketing)/i11n.json'

import messages from '../i11n.json'
import { AboutScreen } from './AboutScreen'

const meta = {
  title: 'Marketing/About/AboutScreen',
  component: AboutScreen,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    copy: messages.en,
    ctas: marketingMessages.en.common.ctas,
    view: 'guest',
    locale: 'en',
  },
} satisfies Meta<typeof AboutScreen>

export default meta
type Story = StoryObj<typeof meta>

function closingLink(canvasElement: HTMLElement, name: string) {
  return within(canvasElement).getByRole('link', { name })
}

/** Signed out: the closing buttons go through sign-up first. */
export const Guest: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      canvas.getByRole('heading', { level: 1, name: 'About Slashie' }),
    ).toBeVisible()
    await expect(closingLink(canvasElement, 'Post a task')).toHaveAttribute(
      'href',
      '/register?next=%2Ftasks%2Fcreate',
    )
    await expect(closingLink(canvasElement, 'Become a worker')).toHaveAttribute(
      'href',
      '/register?next=%2Fworker%2Fsetup',
    )
    const github = canvas.getByRole('link', {
      name: 'View the code on GitHub (opens in a new tab)',
    })
    await expect(github).toHaveAttribute('target', '_blank')
  },
}

/** Has a session: post straight away, or browse tasks nearby. */
export const SignedIn: Story = {
  args: { view: 'signedIn' },
  play: async ({ canvasElement }) => {
    await expect(closingLink(canvasElement, 'Post a task')).toHaveAttribute(
      'href',
      '/tasks/create',
    )
    await expect(closingLink(canvasElement, 'Browse tasks')).toHaveAttribute(
      'href',
      '/search',
    )
  },
}

/** Phone width: the step cards, cost points and buttons stack. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy; closing links keep the zh-hk prefix. */
export const TraditionalChinese: Story = {
  args: {
    copy: messages.zh_hk,
    ctas: marketingMessages.zh_hk.common.ctas,
    locale: 'zh-hk',
  },
  play: async ({ canvasElement }) => {
    await expect(closingLink(canvasElement, '發布任務')).toHaveAttribute(
      'href',
      '/zh-hk/register?next=%2Ftasks%2Fcreate',
    )
  },
}
