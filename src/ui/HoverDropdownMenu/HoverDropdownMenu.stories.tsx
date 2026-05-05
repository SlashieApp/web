import { HStack, Link, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { HoverDropdownMenu } from './HoverDropdownMenu'

function ChevronDown() {
  return (
    <Text as="span" fontSize="xs" aria-hidden>
      ▾
    </Text>
  )
}

/** Hover/focus dropdown for nav rows; see source for `HoverDropdownMenu` props. */
const meta = {
  title: 'ui/HoverDropdownMenu',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wraps a trigger and panel: opens on pointer hover and stays open while focus moves inside (keyboard-friendly). Merge `aria-*` on the trigger when it is a single React element.',
      },
    },
  },
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <HStack gap={10} align="flex-start" py={4}>
      <HoverDropdownMenu
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
      </HoverDropdownMenu>
      <Text fontSize="sm" color="formLabelMuted">
        Hover the label to open the menu.
      </Text>
    </HStack>
  ),
}

export const AlignEnd: Story = {
  render: () => (
    <HStack w="full" justify="flex-end" py={4}>
      <HoverDropdownMenu
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
      </HoverDropdownMenu>
    </HStack>
  ),
}
