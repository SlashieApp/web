import { ApolloClient, ApolloLink, InMemoryCache } from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { NEVER } from 'rxjs'
import { expect, within } from 'storybook/test'

import { useUserStore } from '@/app/(auth)/store/user'

import { FeedbackDialogProvider } from '../FeedbackDialog/FeedbackDialogProvider'
import { AppShellBody } from './AppShellBody'

/** The live `getUser` calls the API; the Header runs it when a session cookie exists. */
const realGetUser = useUserStore.getState().getUser

/** Story-only Apollo client: operations never resolve, so nothing reaches the live API. */
const neverClient = new ApolloClient({
  link: new ApolloLink(() => NEVER),
  cache: new InMemoryCache(),
})

const pageContent = (
  <Stack gap={3} px={4} py={6}>
    <Heading size="md">Page title</Heading>
    <Text color="text.muted" fontSize="sm">
      Header slot, scrolling main pane and mobile bottom nav.
    </Text>
    <Box h="80vh" borderRadius="lg" bg="bg.subtle" />
  </Stack>
)

const meta = {
  title: 'Shell/AppShell/AppShellBody',
  component: AppShellBody,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    nextjs: { navigation: { pathname: '/search' } },
  },
  args: { children: pageContent },
  // The body is a fragment (header slot, main, dock) that expects a flex column
  // parent: this is the wrapper `AppShell` adds around it.
  decorators: [
    (Story) => (
      <ApolloProvider client={neverClient}>
        <FeedbackDialogProvider onSubmit={async () => true}>
          <Box
            display="flex"
            flexDirection="column"
            height="100dvh"
            isolation="isolate"
          >
            <Story />
          </Box>
        </FeedbackDialogProvider>
      </ApolloProvider>
    ),
  ],
  // Signed out, with the live `getUser` swapped for a stub.
  beforeEach: () => {
    useUserStore.setState({ user: null, me: null, getUser: async () => null })
    return () => useUserStore.setState({ getUser: realGetUser })
  },
} satisfies Meta<typeof AppShellBody>

export default meta
type Story = StoryObj<typeof meta>

/** Desktop on a normal route: header above a scrolling main pane, no bottom nav above lg. */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('main')).not.toBeNull()
    await expect(
      within(canvasElement).queryByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeNull()
  },
}

/** Phone on a normal route: the bottom nav floats over the main pane, which clears it. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeVisible()
  },
}

/** Phone on task detail: the bottom nav is left out so the page can own its CTA. */
export const TaskDetailRoute: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  parameters: {
    nextjs: { navigation: { pathname: '/tasks/fix-a-leaking-tap' } },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).queryByRole('navigation', {
        name: 'Primary navigation',
      }),
    ).toBeNull()
  },
}

/** Custom main pane: `mainProps` restyles the scrolling pane (tint and padding here). */
export const CustomMainProps: Story = {
  args: {
    mainProps: { bg: 'bg.subtle', px: 4, py: 6 },
    children: (
      <Text color="text.muted" fontSize="sm">
        The main pane is tinted and padded through `mainProps`.
      </Text>
    ),
  },
}
