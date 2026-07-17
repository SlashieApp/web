import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Button } from '@ui'

import { Header } from './Header'
import {
  headerMeCustomer,
  headerMeWorker,
  headerMeWorkerFree,
  seedHeaderMeStore,
} from './headerStoryFixtures'

/**
 * SDL app `Header`. One public API (`children` + `BoxProps`); the default body
 * renders the full app navigation, which adapts to four states:
 *
 * - **guest** — logged-out toolbar (Post a task, Log in / Sign up, mobile menu)
 * - **browse** — logged-in marketing/browse toolbar (Post a task, notifications, account)
 * - **dashboard** — logged-in account-hub toolbar (section nav + context label)
 * - **custom** — caller-provided `children` replace the default body
 *
 * Stories seed Zustand auth state and the Next pathname; the global theme toolbar
 * renders each under light and dark — no mode is hardcoded here.
 */

type HeaderMode = 'guest' | 'browse' | 'dashboard'

function seedForMode(mode: HeaderMode) {
  seedHeaderMeStore(mode === 'guest' ? null : headerMeWorker)
}

const meta = {
  title: 'shell/Header',
  component: Header,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    children: { control: false },
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

/** Interactive playground. Switch the `mode` control to seed each header state. */
export const Playground: Story = {
  argTypes: {
    // `mode` is a story-only control, not a Header prop.
    // @ts-expect-error story-only arg
    mode: {
      control: 'inline-radio',
      options: ['guest', 'browse', 'dashboard'] satisfies HeaderMode[],
    },
  },
  // @ts-expect-error story-only arg
  args: { mode: 'browse' },
  render: (args) => {
    const mode = (args as { mode?: HeaderMode }).mode ?? 'browse'
    seedForMode(mode)
    return <Header />
  },
  parameters: { nextjs: { navigation: { pathname: '/' } } },
}

/** Logged-out toolbar: Post a task, Log in / Sign up, and the mobile menu trigger. */
export const Guest: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedHeaderMeStore(null)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Logged-in browse toolbar: Post a task, notifications bell, and account menu. */
export const BrowseLoggedIn: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Account-hub toolbar: section menu trigger + dashboard context label. */
export const Dashboard: Story = {
  parameters: { nextjs: { navigation: { pathname: '/dashboard' } } },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeWorker)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Customer (no worker profile) — account menu surfaces the upsell card. */
export const CustomerAccount: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeCustomer)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Worker on the free plan — account menu shows the quote-usage meter. */
export const WorkerFreePlan: Story = {
  parameters: { nextjs: { navigation: { pathname: '/dashboard' } } },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeWorkerFree)
      return <Story />
    },
  ],
  render: () => <Header />,
}

/** Caller-supplied children replace the default navigation body. */
export const CustomChildren: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  render: () => (
    <Header>
      <HStack justify="space-between" w="full">
        <Heading size="md">Custom header</Heading>
        <Button size="sm">Action</Button>
      </HStack>
    </Header>
  ),
}

/**
 * Overview of the header shell + toolbar slots, rendered with custom children so
 * every row is deterministic (auth/pathname state is global, so a single render
 * tree can only resolve one default-navigation state — see the dedicated Guest /
 * BrowseLoggedIn / Dashboard stories for those). Renders under light and dark.
 */
export const AllVariants: Story = {
  parameters: { nextjs: { navigation: { pathname: '/' } } },
  render: () => {
    const rows: { label: string; node: React.ReactNode }[] = [
      {
        label: 'Brand + primary action',
        node: (
          <HStack justify="space-between" w="full">
            <Heading size="md">Slashie</Heading>
            <Button size="sm">Post a task</Button>
          </HStack>
        ),
      },
      {
        label: 'Title + secondary / primary actions',
        node: (
          <HStack justify="space-between" w="full">
            <Heading size="md">Dashboard</Heading>
            <HStack gap={2}>
              <Button size="sm" variant="secondary">
                Get app
              </Button>
              <Button size="sm">Post a task</Button>
            </HStack>
          </HStack>
        ),
      },
      {
        label: 'Single centered title',
        node: (
          <HStack justify="center" w="full">
            <Heading size="md">Checkout</Heading>
          </HStack>
        ),
      },
    ]
    return (
      <Stack gap={8} p={4}>
        {rows.map((row) => (
          <Stack key={row.label} gap={2}>
            <Text fontSize="xs" fontWeight={700} color="text.muted">
              {row.label}
            </Text>
            <Box
              borderWidth="1px"
              borderColor="border.default"
              borderRadius="lg"
              overflow="hidden"
            >
              <Header position="static">{row.node}</Header>
            </Box>
          </Stack>
        ))}
      </Stack>
    )
  },
}
