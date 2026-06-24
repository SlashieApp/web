import { HStack, Text, VStack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { Thumbnail } from './Thumbnail'

const PHOTO =
  'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=600&h=600&fit=crop'

const meta = {
  title: 'Components/Thumbnail',
  component: Thumbnail,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
      description: 'Square min-width preset.',
    },
    fit: {
      control: 'inline-radio',
      options: ['cover', 'contain'],
      description: 'Object-fit of the image.',
    },
    src: { control: 'text' },
    alt: { control: 'text' },
    priority: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    alt: 'Task thumbnail',
    size: 'md',
    fit: 'cover',
    src: PHOTO,
  },
} satisfies Meta<typeof Thumbnail>

export default meta

type Story = StoryObj<typeof meta>

/** Default thumbnail with a photo. */
export const Default: Story = {}

/** No source supplied — renders the muted placeholder glyph. */
export const Placeholder: Story = {
  args: { alt: 'Task without photo', src: undefined },
}

/**
 * Broken/unreachable image. The component shows an icon + label fallback
 * (status is never signalled by color alone).
 */
export const ErrorState: Story = {
  args: {
    alt: 'Unreachable image',
    src: 'https://example.invalid/this-image-does-not-exist.jpg',
  },
}

/**
 * Interactive thumbnail: renders as a button with a visible focus ring,
 * >=44px touch target and sdlMotion hover/press. Tab to it to see the ring.
 */
export const Interactive: Story = {
  args: { alt: 'Open garden tidy-up task', onClick: () => {} },
}

/** Size presets. */
export const Sizes: Story = {
  render: (args) => (
    <HStack gap={4} align="flex-end">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <VStack key={size} gap={2}>
          <Thumbnail {...args} size={size} />
          <Text fontSize="xs" color="text.muted">
            {size}
          </Text>
        </VStack>
      ))}
    </HStack>
  ),
}

/** A horizontal browse list row of thumbnails. */
export const BrowseListRow: Story = {
  render: (args) => (
    <HStack gap={3}>
      <Thumbnail
        {...args}
        alt="Handyman job"
        src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=600&fit=crop"
      />
      <Thumbnail
        {...args}
        alt="Cleaning job"
        src="https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&h=600&fit=crop"
      />
      <Thumbnail {...args} alt="Task without photo" src={undefined} />
    </HStack>
  ),
}

/** Overview of every state side by side (renders under light + dark via the toolbar). */
export const AllVariants: Story = {
  render: (args) => (
    <HStack gap={6} align="flex-start" wrap="wrap">
      <VStack gap={2}>
        <Thumbnail {...args} src={PHOTO} />
        <Text fontSize="xs" color="text.muted">
          With photo
        </Text>
      </VStack>
      <VStack gap={2}>
        <Thumbnail {...args} alt="No photo" src={undefined} />
        <Text fontSize="xs" color="text.muted">
          Placeholder
        </Text>
      </VStack>
      <VStack gap={2}>
        <Thumbnail
          {...args}
          alt="Broken image"
          src="https://example.invalid/missing.jpg"
        />
        <Text fontSize="xs" color="text.muted">
          Error
        </Text>
      </VStack>
      <VStack gap={2}>
        <Thumbnail {...args} alt="Open task" src={PHOTO} onClick={() => {}} />
        <Text fontSize="xs" color="text.muted">
          Interactive
        </Text>
      </VStack>
    </HStack>
  ),
}
