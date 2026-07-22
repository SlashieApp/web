import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import {
  Currency,
  LoginMethod,
  UserLanguage,
  WorkerSubscriptionStatus,
} from '@codegen/schema'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { type MeSnapshot, useUserStore } from '@/app/(auth)/store/user'
import { AccountMenu } from '@/ui/Header/account/AccountMenu'

import { Button } from '../Button'
import { Link } from '../Link'

import { Dropdown, useDropdownClose } from './Dropdown'

const accountMenuMe: MeSnapshot = {
  id: 'user-1',
  email: 'ryan@example.com',
  emailVerified: true,
  phoneVerified: true,
  phoneVerifiedAt: '2024-06-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  enabledLoginMethods: [LoginMethod.Password],
  profile: {
    name: 'Ryan Kwan',
    contactNumber: '+447878154432',
    avatarUrl: null,
    bio: 'Handyman covering North London.',
    dateOfBirth: '1990-04-12T00:00:00.000Z',
    defaultPreferredContactMethod: null,
    emailVerified: true,
    phoneVerified: true,
  },
  settings: {
    isProfilePrivate: false,
    language: UserLanguage.En,
    marketingEmails: false,
  },
  workerEligibility: true,
  worker: {
    id: 'worker-1',
    legalName: 'Ryan Kwan',
    bio: 'Handyman covering North London.',
    tagline: 'Reliable local help',
    yearsExperience: 8,
    skills: ['Plumbing', 'Assembly'],
    qualifications: [],
    portfolioUrls: [],
    location: {
      address: 'London',
      lat: 51.5074,
      lng: -0.1278,
      name: 'London',
    },
    setupProgress: {
      currentSubStep: 'review.submit',
      completedSubSteps: ['review.submit'],
      isComplete: true,
    },
    isVerified: true,
    tasksCompletedCount: 12,
    locationAddress: 'London',
    locationLat: 51.5074,
    locationLng: -0.1278,
    membership: {
      planName: 'Slashie Unlimited',
      statusLabel: 'Trial',
      statusDescription: 'Unlimited quotes until 9 Dec 2026',
      subscriptionStatus: WorkerSubscriptionStatus.Trialing,
      hasUnlimitedQuotes: true,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      freeQuotesPerMonth: 3,
      quotesUsedThisMonth: 0,
      quotesRemainingThisMonth: 3,
      trialEndsAt: '2026-12-09T00:00:00.000Z',
      currentPeriodEnd: '2026-12-09T00:00:00.000Z',
      canStartTrial: false,
      canManageBilling: true,
      canUpgrade: false,
    },
    earnings: { pending: { amount: 120, currency: Currency.Gbp } },
  },
}

function ChevronDown() {
  return (
    <Text as="span" fontSize="xs" aria-hidden>
      ▾
    </Text>
  )
}

const navItem = {
  display: 'block',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'text.default',
  cursor: 'pointer',
  _hover: { bg: 'bg.subtle' },
} as const

const linkItem = {
  display: 'block',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'text.default',
  _hover: { bg: 'bg.subtle', textDecoration: 'none' },
} as const

function DropdownMenuItem({ children }: { children: React.ReactNode }) {
  const close = useDropdownClose()
  return (
    <Text {...navItem} role="menuitem" tabIndex={0} onClick={close}>
      {children}
    </Text>
  )
}

/**
 * `Dropdown` is a discriminated union (click vs `hoverExpand`), so stories drive
 * it through `render` rather than top-level `args`; `argTypes` document the
 * shared controls.
 */
const meta = {
  title: 'ui/Dropdown',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'SDL popover. Click to open by default (click-outside + Escape + return focus); pass `hoverExpand` for nav-style hover/focus menus. Surfaces use `bg.surface` + `border.default` + elevation, and animate transform/opacity only (reduced-motion safe).',
      },
    },
  },
  argTypes: {
    align: {
      control: 'inline-radio',
      options: ['start', 'center', 'end'],
      description: 'Horizontal alignment of the panel relative to the trigger.',
    },
    hoverExpand: {
      control: 'boolean',
      description: 'Open on hover/focus instead of click (nav menus).',
    },
    defaultOpen: {
      control: 'boolean',
      description: 'Render the panel open initially.',
    },
    contentLabel: {
      control: 'text',
      description: 'Accessible label for the popover region.',
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

/** Default click-triggered menu with JSX slot items that self-close. */
export const Default: Story = {
  render: () => (
    <Box display="flex" justifyContent="flex-end" py={6}>
      <Dropdown
        contentLabel="Account menu"
        align="end"
        trigger={
          <Button size="sm" variant="secondary">
            Open menu
          </Button>
        }
      >
        <Stack gap={0} p={1}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </Stack>
      </Dropdown>
    </Box>
  ),
}

/** Opened on mount (focus moves to the first item; press Escape to dismiss). */
export const OpenState: Story = {
  render: () => (
    <Box display="flex" justifyContent="flex-end" py={6} minH="180px">
      <Dropdown
        contentLabel="Account menu"
        align="end"
        defaultOpen
        trigger={
          <Button size="sm" variant="secondary">
            Open menu
          </Button>
        }
      >
        <Stack gap={0} p={1}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </Stack>
      </Dropdown>
    </Box>
  ),
}

/** Disabled trigger: the menu cannot be opened. */
export const DisabledTrigger: Story = {
  render: () => (
    <Box display="flex" justifyContent="flex-end" py={6}>
      <Dropdown
        contentLabel="Account menu"
        align="end"
        trigger={
          <Button size="sm" variant="secondary" disabled>
            Open menu
          </Button>
        }
      >
        <Stack gap={0} p={1}>
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Sign out</DropdownMenuItem>
        </Stack>
      </Dropdown>
    </Box>
  ),
}

/** All three panel alignments side by side. */
export const Alignments: Story = {
  render: () => (
    <HStack gap={12} align="flex-start" py={6} minH="200px">
      {(['start', 'center', 'end'] as const).map((align) => (
        <Stack key={align} gap={2} align="center">
          <Text fontSize="xs" color="text.muted">
            align="{align}"
          </Text>
          <Dropdown
            align={align}
            defaultOpen
            contentLabel={`${align} menu`}
            trigger={
              <Button size="sm" variant="secondary">
                {align}
              </Button>
            }
          >
            <Stack gap={0} p={1}>
              <DropdownMenuItem>First</DropdownMenuItem>
              <DropdownMenuItem>Second</DropdownMenuItem>
            </Stack>
          </Dropdown>
        </Stack>
      ))}
    </HStack>
  ),
}

/** Hover/focus nav menu (`hoverExpand`). Hover or tab to the label to open. */
export const HoverDefault: Story = {
  render: () => (
    <HStack gap={10} align="flex-start" py={4} minH="160px">
      <Dropdown
        hoverExpand
        contentLabel="Browse tasks"
        trigger={
          <Link
            href="#"
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontWeight={600}
            color="text.default"
            onClick={(e) => e.preventDefault()}
          >
            Browse tasks
            <ChevronDown />
          </Link>
        }
      >
        <Stack gap={0}>
          <Link {...linkItem} href="#" onClick={(e) => e.preventDefault()}>
            Map view
          </Link>
          <Link {...linkItem} href="#" onClick={(e) => e.preventDefault()}>
            List view
          </Link>
        </Stack>
      </Dropdown>
      <Text fontSize="sm" color="text.muted">
        Hover the label to open the menu.
      </Text>
    </HStack>
  ),
}

/** Hover menu aligned to the end (right) edge of the trigger. */
export const HoverAlignEnd: Story = {
  render: () => (
    <HStack w="full" justify="flex-end" py={4} minH="160px">
      <Dropdown
        hoverExpand
        align="end"
        contentLabel="Account"
        trigger={
          <Link
            href="#"
            display="inline-flex"
            alignItems="center"
            gap={1}
            fontWeight={600}
            color="text.default"
            onClick={(e) => e.preventDefault()}
          >
            Account
            <ChevronDown />
          </Link>
        }
      >
        <Stack gap={0}>
          <Link {...linkItem} href="#" onClick={(e) => e.preventDefault()}>
            Profile
          </Link>
          <Link {...linkItem} href="#" onClick={(e) => e.preventDefault()}>
            Sign out
          </Link>
        </Stack>
      </Dropdown>
    </HStack>
  ),
}

/** Overview: click and hover modes plus every alignment in one frame. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={10} py={6}>
      <Stack gap={3}>
        <Text fontSize="sm" fontWeight={700} color="text.default">
          Click mode
        </Text>
        <HStack gap={12} align="flex-start" minH="180px">
          {(['start', 'center', 'end'] as const).map((align) => (
            <Dropdown
              key={align}
              align={align}
              defaultOpen
              contentLabel={`${align} menu`}
              trigger={
                <Button size="sm" variant="secondary">
                  {align}
                </Button>
              }
            >
              <Stack gap={0} p={1}>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </Stack>
            </Dropdown>
          ))}
        </HStack>
      </Stack>

      <Stack gap={3}>
        <Text fontSize="sm" fontWeight={700} color="text.default">
          Hover mode
        </Text>
        <HStack gap={12} align="flex-start" minH="160px">
          <Dropdown
            hoverExpand
            contentLabel="Browse tasks"
            trigger={
              <Link
                href="#"
                display="inline-flex"
                alignItems="center"
                gap={1}
                fontWeight={600}
                color="text.default"
                onClick={(e) => e.preventDefault()}
              >
                Browse tasks
                <ChevronDown />
              </Link>
            }
          >
            <Stack gap={0}>
              <Link {...linkItem} href="#" onClick={(e) => e.preventDefault()}>
                Map view
              </Link>
              <Link {...linkItem} href="#" onClick={(e) => e.preventDefault()}>
                List view
              </Link>
            </Stack>
          </Dropdown>
        </HStack>
      </Stack>
    </Stack>
  ),
}

/** Real product composition: `AccountMenu` on `Dropdown` with the auth store seeded. */
export const AccountMenuOpen: Story = {
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'desktop' },
  },
  decorators: [
    (Story) => {
      useUserStore.setState({
        user: {
          id: accountMenuMe.id,
          email: accountMenuMe.email,
          createdAt: accountMenuMe.createdAt,
        },
        me: accountMenuMe,
      })
      return <Story />
    },
  ],
  render: () => (
    <Box display="flex" justifyContent="flex-end" p={6}>
      <AccountMenu initialOpen />
    </Box>
  ),
}
