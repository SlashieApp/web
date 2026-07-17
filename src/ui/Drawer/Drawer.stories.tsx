import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { Button } from '../Button'
import { Drawer, type DrawerPlacement, type DrawerSize } from './Drawer'

/**
 * SDL Drawer (Foundations). A scrim-backed panel that slides in from an edge.
 * Chakra's `DrawerRoot` provides the focus trap, ESC-to-close, and click-scrim
 * close; SDL layers in semantic surfaces, a 44px close target, reduced-motion
 * awareness, and `sdlMotion` transitions. Renders under light + dark via the
 * global theme toolbar (do not hardcode a mode).
 */
const meta = {
  title: 'ui/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['start', 'end', 'top', 'bottom'],
      description: 'Edge the panel slides in from.',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'full'],
      description: 'Panel size along its placement axis.',
    },
    title: { control: 'text' },
    description: { control: 'text' },
    primaryActionLabel: {
      control: 'text',
      description: 'When set, renders a full-width footer action that closes.',
    },
    open: { table: { disable: true } },
    onOpenChange: { table: { disable: true } },
    onPrimaryAction: { table: { disable: true } },
    children: { table: { disable: true } },
  },
  args: {
    title: 'Filters',
    description: 'Refine results by category and budget.',
    placement: 'start',
    size: 'md',
    primaryActionLabel: 'Apply',
  },
} satisfies Meta<typeof Drawer>

export default meta

type Story = StoryObj<typeof meta>

function BodyCopy() {
  return (
    <Text fontSize="sm" color="text.muted">
      Drawer body content goes here.
    </Text>
  )
}

/** Reusable trigger + controlled-open wrapper so each story is self-contained. */
function DrawerDemo({
  label = 'Open drawer',
  children = <BodyCopy />,
  ...args
}: Partial<ComponentProps<typeof Drawer>> & { label?: string }) {
  const [open, setOpen] = useState(false)
  return (
    <Box p={6}>
      <Button type="button" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Drawer title="Filters" {...args} open={open} onOpenChange={setOpen}>
        {children}
      </Drawer>
    </Box>
  )
}

export const Default: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: (args) => <DrawerDemo {...args} />,
}

/** No description and no footer action — the minimal header-only drawer. */
export const TitleOnly: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: (args) => (
    <DrawerDemo
      {...args}
      description={undefined}
      primaryActionLabel={undefined}
    />
  ),
}

/** Footer primary action present; closes the drawer on click. */
export const WithFooterAction: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: (args) => <DrawerDemo {...args} primaryActionLabel="Apply filters" />,
}

/** Long content scrolls inside the body while header + footer stay pinned. */
export const ScrollingBody: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: (args) => (
    <DrawerDemo {...args} label="Open long drawer">
      <Stack gap={4}>
        {Array.from({ length: 24 }, (_, i) => `row-${i + 1}`).map(
          (rowKey, i) => (
            <Text key={rowKey} fontSize="sm" color="text.default">
              Row {i + 1} — scrollable drawer body content.
            </Text>
          ),
        )}
      </Stack>
    </DrawerDemo>
  ),
}

/** Every placement, each with its own trigger. */
export const Placements: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => {
    const placements: DrawerPlacement[] = ['start', 'end', 'top', 'bottom']
    return (
      <Box p={6}>
        <SimpleGrid columns={{ base: 2, md: 4 }} gap={3}>
          {placements.map((placement) => (
            <DrawerDemo
              key={placement}
              label={placement}
              placement={placement}
              title={`Placement: ${placement}`}
              description={`Slides in from "${placement}".`}
            />
          ))}
        </SimpleGrid>
      </Box>
    )
  },
}

/** Every size option at a fixed placement. */
export const Sizes: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => {
    const sizes: DrawerSize[] = ['xs', 'sm', 'md', 'lg', 'xl', 'full']
    return (
      <Box p={6}>
        <SimpleGrid columns={{ base: 3, md: 6 }} gap={3}>
          {sizes.map((size) => (
            <DrawerDemo
              key={size}
              label={size}
              size={size}
              placement="end"
              title={`Size: ${size}`}
              description={`Panel size "${size}".`}
            />
          ))}
        </SimpleGrid>
      </Box>
    )
  },
}

/** Overview: representative drawers covering the key configurations. */
export const AllVariants: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: () => (
    <Box p={6}>
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={3} maxW="2xl">
        <DrawerDemo
          label="Default (start, md)"
          title="Filters"
          description="Refine results by category and budget."
          primaryActionLabel="Apply"
        />
        <DrawerDemo
          label="Title only"
          title="Quick view"
          description={undefined}
          primaryActionLabel={undefined}
        />
        <DrawerDemo
          label="Bottom sheet (full)"
          placement="bottom"
          size="full"
          title="Filters"
          primaryActionLabel="Apply filters"
        />
        <DrawerDemo
          label="End, large"
          placement="end"
          size="lg"
          title="Details"
          description="Full record on the trailing edge."
          primaryActionLabel="Save"
        />
      </SimpleGrid>
    </Box>
  ),
}
