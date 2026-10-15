import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Link } from '../Link/Link'
import { ColorModeProvider } from '../color-mode'
import { Logo, type UiLogoSize, type UiLogoVariant } from './Logo'

const VARIANTS: UiLogoVariant[] = ['wordmark', 'mark']
const SIZES: UiLogoSize[] = ['sm', 'md', 'lg']

const meta = {
  title: 'UI/Logo',
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

/** Playground: drive variant, size and interactive mode from Controls. */
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

/** Small (`sm`): 20px tall on phones, 24px from `md` up. */
export const Small: Story = { args: { size: 'sm' } }

/** Large (`lg`): 32px tall on phones, 40px from `md` up. */
export const Large: Story = { args: { size: 'lg' } }

/** Default: presentational wordmark at `md`, no focus ring (a wrapping Link owns focus). */
export const Default: Story = {
  args: { variant: 'wordmark' },
}

/** Mark: the compact symbol for tight and mobile layouts. */
export const Mark: Story = {
  args: { variant: 'mark' },
}

/** Interactive: Tab to see the focus ring; 44px touch target and an accessible label. */
export const Interactive: Story = {
  args: {
    interactive: true,
    label: 'Slashie home',
    onClick: () => undefined,
  },
}

/** Focus: rendered interactive so the SDL focus ring is reachable by keyboard. */
export const Focus: Story = {
  args: {
    interactive: true,
    label: 'Slashie home',
  },
  parameters: { pseudo: { focusVisible: true } },
}

/** Legacy alias: `mobile` still maps to `variant="mark"` so old call sites render. */
export const LegacyMobileAlias: Story = {
  args: { mobile: true },
}

/** Inside a link: the usual header usage, where the Link owns focus and navigation. */
export const InsideLink: Story = {
  render: (args) => (
    <Link href="/" aria-label="Slashie home">
      <Logo {...args} />
    </Link>
  ),
}
