import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, waitFor, within } from 'storybook/test'

import { StorySeed, withSession } from '@/app/(auth)/helpers/authStoryDecorator'

import { WebPushControl } from './WebPushControl'
import { STORY_VAPID_KEY, seedVapidKey } from './accountStoryFixtures'

const meta = {
  title: 'Dashboard/Account/WebPushControl',
  component: WebPushControl,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof WebPushControl>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Stands in for a browser's push support: either no Notifications API at all,
 * or notifications already allowed with a live subscription.
 */
function withBrowserPush(mode: 'unsupported' | 'subscribed'): Decorator {
  let restore = () => {}
  const apply = () => {
    restore()
    if (mode === 'unsupported') {
      const original = window.Notification
      Reflect.deleteProperty(window, 'Notification')
      restore = () => {
        window.Notification = original
      }
      return
    }
    const permission = Object.getOwnPropertyDescriptor(
      Notification,
      'permission',
    )
    Object.defineProperty(Notification, 'permission', {
      configurable: true,
      get: () => 'granted',
    })
    const registration = {
      pushManager: {
        getSubscription: async () => ({
          endpoint: 'https://push.example/story',
        }),
      },
    }
    Object.defineProperty(navigator.serviceWorker, 'getRegistration', {
      configurable: true,
      value: async () => registration,
    })
    restore = () => {
      if (permission)
        Object.defineProperty(Notification, 'permission', permission)
      Reflect.deleteProperty(navigator.serviceWorker, 'getRegistration')
    }
  }
  return (Story) => (
    <StorySeed apply={apply} reset={() => restore()}>
      <Story />
    </StorySeed>
  )
}

const toggle = (canvas: ReturnType<typeof within>) =>
  canvas.findByRole('checkbox', { name: 'Browser notifications' })

/** Server and browser both support push, notifications off: the switch is ready. */
export const Available: Story = {
  decorators: [withSession({ seed: seedVapidKey(STORY_VAPID_KEY) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await toggle(canvas)).toBeEnabled())
    await expect(await toggle(canvas)).not.toBeChecked()
  },
}

/** Notifications already allowed and subscribed: the switch is on. */
export const Subscribed: Story = {
  decorators: [
    withBrowserPush('subscribed'),
    withSession({ seed: seedVapidKey(STORY_VAPID_KEY) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await waitFor(async () => expect(await toggle(canvas)).toBeChecked())
  },
}

/** Waiting for the server's push key: the switch is disabled. */
export const LoadingServerKey: Story = {
  decorators: [withSession()],
  play: async ({ canvasElement }) => {
    await expect(await toggle(within(canvasElement))).toBeDisabled()
  },
}

/** The server has no push key configured: explains why and stays off. */
export const ServerNotConfigured: Story = {
  decorators: [withSession({ seed: seedVapidKey(null) })],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText(
        'Browser notifications are not available until the server is configured.',
      ),
    ).toBeVisible()
    await expect(await toggle(canvas)).toBeDisabled()
  },
}

/** The browser has no Notifications API: explains why and stays off. */
export const BrowserUnsupported: Story = {
  decorators: [
    withBrowserPush('unsupported'),
    withSession({ seed: seedVapidKey(STORY_VAPID_KEY) }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(
      await canvas.findByText('This browser does not support notifications.'),
    ).toBeVisible()
    await expect(await toggle(canvas)).toBeDisabled()
  },
}
