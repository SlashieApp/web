import { Box, Button, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { AccountMenu } from '../Header/AccountMenu'
import {
  headerMeWorker,
  seedHeaderMeStore,
} from '../Header/headerStoryFixtures'
import { Link } from '../Link'

import { Dropdown, useDropdownClose } from './Dropdown'

function ChevronDown() {
  return (
    <Text as="span" fontSize="xs" aria-hidden>
      ▾
    </Text>
  )
}

const meta = {
  title: 'ui/Dropdown',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Click-triggered menu by default. Pass `hoverExpand` for nav-style hover/focus menus.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

const navItem = {
  display: 'block',
  px: 3,
  py: 2,
  borderRadius: 'md',
  fontSize: 'sm',
  fontWeight: 600,
  color: 'cardFg',
  cursor: 'pointer',
  _hover: { bg: 'badgeBg' },
} as const

export const ClickWithJsxSlots: Story = {
  render: () => (
    <Box display="flex" justifyContent="flex-end" py={6}>
      <Dropdown
        contentLabel="Account menu"
        trigger={
          <Button size="sm" type="button">
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

function DropdownMenuItem({ children }: { children: React.ReactNode }) {
  const close = useDropdownClose()
  return (
    <Text {...navItem} onClick={close}>
      {children}
    </Text>
  )
}

export const HoverDefault: Story = {
  render: () => (
    <HStack gap={10} align="flex-start" py={4}>
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
            color="cardFg"
            onClick={(e) => e.preventDefault()}
          >
            Browse tasks
            <ChevronDown />
          </Link>
        }
      >
        <Stack gap={0}>
          <Link
            href="#"
            display="block"
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
            fontWeight={600}
            color="cardFg"
            _hover={{ bg: 'neutral.100', textDecoration: 'none' }}
            onClick={(e) => e.preventDefault()}
          >
            Map view
          </Link>
          <Link
            href="#"
            display="block"
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
            fontWeight={600}
            color="cardFg"
            _hover={{ bg: 'neutral.100', textDecoration: 'none' }}
            onClick={(e) => e.preventDefault()}
          >
            List view
          </Link>
        </Stack>
      </Dropdown>
      <Text fontSize="sm" color="formLabelMuted">
        Hover the label to open the menu.
      </Text>
    </HStack>
  ),
}

export const HoverAlignEnd: Story = {
  render: () => (
    <HStack w="full" justify="flex-end" py={4}>
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
            color="cardFg"
            onClick={(e) => e.preventDefault()}
          >
            Account
            <ChevronDown />
          </Link>
        }
      >
        <Stack gap={0}>
          <Link
            href="#"
            display="block"
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
            color="cardFg"
            _hover={{ bg: 'neutral.100', textDecoration: 'none' }}
            onClick={(e) => e.preventDefault()}
          >
            Profile
          </Link>
          <Link
            href="#"
            display="block"
            px={3}
            py={2}
            borderRadius="md"
            fontSize="sm"
            color="cardFg"
            _hover={{ bg: 'neutral.100', textDecoration: 'none' }}
            onClick={(e) => e.preventDefault()}
          >
            Sign out
          </Link>
        </Stack>
      </Dropdown>
    </HStack>
  ),
}

/** Real product composition: `AccountMenu` on `Dropdown` with auth store seeded. */
export const AccountMenuOpen: Story = {
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'desktop' },
  },
  decorators: [
    (Story) => {
      seedHeaderMeStore(headerMeWorker)
      return <Story />
    },
  ],
  render: () => (
    <Box display="flex" justifyContent="flex-end" p={6}>
      <AccountMenu initialOpen />
    </Box>
  ),
}
