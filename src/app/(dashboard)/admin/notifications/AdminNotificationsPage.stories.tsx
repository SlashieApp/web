import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { withSession } from '@/app/(auth)/helpers/authStoryDecorator'
import { storyMe } from '@/app/(auth)/helpers/authStoryFixtures'
import { expectColumnPage } from '@/app/(dashboard)/components/layout/pageRules.testing'
import { viewportAt } from '@/ui/PageContainer/pageLines.testing'

import AdminNotificationsPage from './page'

const operator = withSession({ me: storyMe({ email: 'ops@slashie.app' }) })
const notOperator = withSession({ me: storyMe() })

const meta = {
  title: 'Dashboard/Admin/AdminNotificationsPage',
  component: AdminNotificationsPage,
  parameters: {
    layout: 'padded',
    nextjs: { navigation: { pathname: '/admin/notifications' } },
  },
} satisfies Meta<typeof AdminNotificationsPage>

export default meta
type Story = StoryObj<typeof meta>

/**
 * An operator: the composer in a 720 column (R3), the page header on the logo
 * line and spanning the container (R2).
 */
export const Operator: Story = {
  ...viewportAt(1366),
  decorators: [operator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', {
        level: 1,
        name: 'Send an announcement',
      }),
    ).toBeVisible()
    await expect(
      canvas.getByRole('button', { name: 'Check recipients' }),
    ).toBeVisible()
    expectColumnPage(canvasElement, 1366)
  },
}

/** Wide desktop: the column stays on the logo line, it does not centre. */
export const OperatorWide: Story = {
  ...viewportAt(1920),
  decorators: [operator],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectColumnPage(canvasElement, 1920)
  },
}

export const OperatorTablet: Story = {
  ...viewportAt(1024),
  decorators: [operator],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectColumnPage(canvasElement, 1024)
  },
}

export const OperatorPhone: Story = {
  ...viewportAt(390),
  decorators: [operator],
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('heading', { level: 1 })
    expectColumnPage(canvasElement, 390)
  },
}

/** Anyone else sees that the page is for operators, in the same column. */
export const NotAnOperator: Story = {
  ...viewportAt(1366),
  decorators: [notOperator],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByRole('heading', { level: 1, name: 'Admin only' }),
    ).toBeVisible()
    await expect(
      canvas.queryByRole('button', { name: 'Check recipients' }),
    ).toBeNull()
    expectColumnPage(canvasElement, 1366)
  },
}
