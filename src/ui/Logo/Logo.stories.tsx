import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { ColorModeProvider } from '../color-mode'
import { Logo, type UiLogoSize, type UiLogoVariant } from './Logo'

const VARIANTS: UiLogoVariant[] = ['wordmark', 'mark']
const SIZES: UiLogoSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'Components/Logo',
  component: Logo,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story, context) => (
      <ColorModeProvider forcedTheme={context.globals.theme}>
        <Box p={4} bg="bg.canvas" color="text.default">
          <Story />
        </Box>
      </ColorModeProvider>
    ),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: VARIANTS },
    size: { control: 'inline-radio', options: SIZES },
    interactive: { control: 'boolean' },
    label: { control: 'text' },
  },
  args: { variant: 'wordmark', size: 'md', interactive: false },
} satisfies Meta<typeof Logo>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Both artwork variants at the default size. */
export const AllVariants: Story = {
  render: () => (
    <HStack gap={8} flexWrap="wrap" alignItems="center">
      {VARIANTS.map((variant) => (
        <Stack key={variant} gap={2} alignItems="flex-start">
          <Logo variant={variant} />
          <Text fontSize="xs" color="text.muted">
            {variant}
          </Text>
        </Stack>
      ))}
    </HStack>
  ),
}

/** Named height presets sm / md / lg. */
export const Sizes: Story = {
  render: () => (
    <HStack gap={8} alignItems="flex-end" flexWrap="wrap">
      {SIZES.map((size) => (
        <Stack key={size} gap={2} alignItems="flex-start">
          <Logo size={size} />
          <Text fontSize="xs" color="text.muted">
            {size}
          </Text>
        </Stack>
      ))}
    </HStack>
  ),
}

/** Default presentational logo — no focus ring (a wrapping Link owns focus). */
export const Default: Story = {
  args: { variant: 'wordmark' },
}

/** Compact mark for tight/mobile layouts. */
export const Mark: Story = {
  args: { variant: 'mark' },
}

/**
 * Interactive logo control. Tab to it to see the SDL visible focus ring; the
 * touch target is >=44px and it carries an accessible label.
 */
export const Interactive: Story = {
  args: {
    interactive: true,
    label: 'Slashie home',
    onClick: () => undefined,
  },
}

/** Focus state — rendered interactive so the SDL focus ring is reachable by keyboard. */
export const Focus: Story = {
  args: {
    interactive: true,
    label: 'Slashie home',
  },
  parameters: { pseudo: { focusVisible: true } },
}

/**
 * Legacy `mobile` boolean still works as an alias for `variant="mark"` so existing
 * call sites keep rendering.
 */
export const LegacyMobileAlias: Story = {
  args: { mobile: true },
}
