import { Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Footer, type UiFooterVariant } from './Footer'

const SDL_VARIANTS: UiFooterVariant[] = ['default', 'minimal']

const meta = {
  title: 'Components/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    variant: { control: 'inline-radio', options: SDL_VARIANTS },
    tagline: { control: 'text' },
    copyright: { control: 'text' },
  },
  args: { variant: 'default' },
} satisfies Meta<typeof Footer>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Full footer: brand block, primary nav, and legal row. */
export const Default: Story = { args: { variant: 'default' } }

/** Compact single-row footer (meta + legal only). */
export const Minimal: Story = { args: { variant: 'minimal' } }

/** Both variants stacked. Renders under light and dark via the theme toolbar. */
export const AllVariants: Story = {
  render: () => (
    <Stack gap={8}>
      {SDL_VARIANTS.map((variant) => (
        <Stack key={variant} gap={2}>
          <Text
            px={6}
            fontSize="xs"
            color="text.subtle"
            textTransform="uppercase"
          >
            {variant}
          </Text>
          <Footer variant={variant} />
        </Stack>
      ))}
    </Stack>
  ),
}

/** Custom tagline + copyright via the public props. */
export const CustomContent: Story = {
  args: {
    variant: 'default',
    tagline: 'Find local help, fast.',
    copyright: '© Slashie 2026 — All rights reserved',
  },
}

/**
 * Focus state. Tab through the links to see the SDL focus treatment inherited
 * from the Link atom.
 */
export const Focus: Story = {
  args: { variant: 'default' },
  parameters: {
    pseudo: { focusVisible: true },
  },
}
