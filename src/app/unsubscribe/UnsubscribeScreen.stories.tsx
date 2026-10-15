import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'
import type { GraphQLFormattedError } from 'graphql'
import { NEVER, of, throwError } from 'rxjs'
import { expect, userEvent, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'
import { LocaleProvider } from '@/i18n/LocaleProvider'

import { UnsubscribeScreen } from './UnsubscribeScreen'

/** The live `getUser` calls the API; a successful unsubscribe may refresh `me`. */
const realGetUser = useUserStore.getState().getUser

const invalidTokenError: GraphQLFormattedError = {
  message: 'INVALID_UNSUBSCRIBE_TOKEN',
  extensions: { code: 'INVALID_UNSUBSCRIBE_TOKEN' },
}

/**
 * Story-only Apollo client. The app client points at the live API (`.env` is
 * production), so these stories answer the mutation themselves.
 */
function withApi(link: ApolloLink): Decorator {
  const client = new ApolloClient({ link, cache: new InMemoryCache() })
  return (Story) => (
    <ApolloProvider client={client}>
      <Story />
    </ApolloProvider>
  )
}

const succeeds = new ApolloLink(() =>
  of({ data: { unsubscribeMarketingEmails: true } }),
)
const neverAnswers = new ApolloLink(() => NEVER)
const rejectsToken = new ApolloLink(() => of({ errors: [invalidTokenError] }))
const networkDown = new ApolloLink(() =>
  throwError(() => new Error('Failed to fetch')),
)

let attempts = 0
/** Fails once (offline), then succeeds: shows the retry path end to end. */
const failsOnce = new ApolloLink(() => {
  attempts += 1
  return attempts === 1
    ? throwError(() => new Error('Failed to fetch'))
    : of({ data: { unsubscribeMarketingEmails: true } })
})

const meta = {
  title: 'Shell/UnsubscribeScreen',
  component: UnsubscribeScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    token: 'storybook-unsubscribe-token',
  },
  decorators: [withApi(succeeds)],
  // Keep a stray session cookie from triggering a real `getUser` call.
  beforeEach: () => {
    useUserStore.setState({ getUser: async () => null })
    attempts = 0
    return () => useUserStore.setState({ getUser: realGetUser })
  },
} satisfies Meta<typeof UnsubscribeScreen>

export default meta
type Story = StoryObj<typeof meta>

/** The request is in flight: the title says Unsubscribing and there are no actions. */
export const Loading: Story = {
  decorators: [withApi(neverAnswers)],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: /Unsubscribing/,
      }),
    ).toBeVisible()
  },
}

/** The token worked: confirmation plus a link to turn emails back on in Account settings. */
export const Unsubscribed: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: "You're unsubscribed",
      }),
    ).toBeVisible()
  },
}

/** No token in the URL: the invalid-link message with no request made. */
export const MissingToken: Story = {
  args: { token: null },
  decorators: [withApi(neverAnswers)],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: "This link doesn't work",
      }),
    ).toBeVisible()
  },
}

/** The API rejects the token (expired or tampered): the same invalid-link message. */
export const InvalidToken: Story = {
  decorators: [withApi(rejectsToken)],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('heading', {
        name: "This link doesn't work",
      }),
    ).toBeVisible()
  },
}

/** The request failed (offline): an error message with a primary Try again button. */
export const NetworkError: Story = {
  decorators: [withApi(networkDown)],
  play: async ({ canvasElement }) => {
    await expect(
      await within(canvasElement).findByRole('button', { name: 'Try again' }),
    ).toBeVisible()
  },
}

/** Try again after a failure: the second attempt succeeds and the confirmation appears. */
export const RetrySucceeds: Story = {
  decorators: [withApi(failsOnce)],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole('button', { name: 'Try again' }),
    )
    await expect(
      await canvas.findByRole('heading', { name: "You're unsubscribed" }),
    ).toBeVisible()
  },
}

/** Phone width: confirmation card on a small screen. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy, picked from the `/zh-hk` URL prefix. */
export const TraditionalChinese: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/unsubscribe' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
}
