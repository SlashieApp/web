import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import NextLink from 'next/link'
import { expect, within } from 'storybook/test'

import { Button } from '@ui'

import { StatusScreen } from './StatusScreen'
import messages from './i11n.json'

const t = messages.en
const zh = messages.zh_hk

const meta = {
  title: 'Shell/StatusScreen',
  component: StatusScreen,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    title: t.notFoundTitle,
    body: t.notFoundBody,
    // Actions are JSX, which does not belong in serialisable args: each story
    // renders its own through `render`.
    actions: null,
  },
  argTypes: { actions: { control: false } },
} satisfies Meta<typeof StatusScreen>

export default meta
type Story = StoryObj<typeof meta>

/** Unknown URL: large 404 code, message, a primary search action and a ghost home link. */
export const NotFound: Story = {
  args: { code: t.notFoundCode },
  render: (args) => (
    <StatusScreen
      {...args}
      actions={
        <>
          <Button asChild variant="primary">
            <NextLink href="/search">{t.search}</NextLink>
          </Button>
          <Button asChild variant="ghost">
            <NextLink href="/home">{t.home}</NextLink>
          </Button>
        </>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByText('404')).toBeVisible()
  },
}

/** Page error: no code, a primary retry button and a ghost link back to search. */
export const ErrorScreen: Story = {
  args: { title: t.errorTitle, body: t.errorBody },
  render: (args) => (
    <StatusScreen
      {...args}
      actions={
        <>
          <Button variant="primary">{t.retry}</Button>
          <Button asChild variant="ghost">
            <NextLink href="/search">{t.search}</NextLink>
          </Button>
        </>
      }
    />
  ),
}

/** A single secondary action under the message. */
export const SingleAction: Story = {
  args: {
    title: "You're unsubscribed",
    body: 'You can turn this back on any time.',
  },
  render: (args) => (
    <StatusScreen
      {...args}
      actions={
        <Button asChild variant="secondary">
          <NextLink href="/account">Go to Account settings</NextLink>
        </Button>
      }
    />
  ),
}

/** Waiting state: no actions, only the logo, title and body. */
export const NoActions: Story = {
  args: { title: 'Unsubscribing…', body: 'One moment.' },
  render: (args) => <StatusScreen {...args} actions={null} />,
}

/** Long title and body wrap inside the card without stretching it. */
export const LongText: Story = {
  args: {
    code: t.notFoundCode,
    title:
      'We could not find the page you were looking for, or it may have been removed',
    body: 'The link may be broken, the page may have moved, or the task it pointed to may have been closed by the person who posted it. Try searching again, or head back to the home page to start over.',
  },
  render: (args) => (
    <StatusScreen
      {...args}
      actions={
        <Button asChild variant="primary">
          <NextLink href="/search">{t.search}</NextLink>
        </Button>
      }
    />
  ),
}

/** Phone width: the card keeps its 1rem page gutters. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  args: { code: t.notFoundCode },
  render: NotFound.render,
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    code: zh.notFoundCode,
    title: zh.notFoundTitle,
    body: zh.notFoundBody,
  },
  render: (args) => (
    <StatusScreen
      {...args}
      actions={
        <>
          <Button asChild variant="primary">
            <NextLink href="/zh-hk/search">{zh.search}</NextLink>
          </Button>
          <Button asChild variant="ghost">
            <NextLink href="/zh-hk/home">{zh.home}</NextLink>
          </Button>
        </>
      }
    />
  ),
}
