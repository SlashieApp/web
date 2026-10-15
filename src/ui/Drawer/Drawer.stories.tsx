import { Box, SimpleGrid, Stack, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentProps } from 'react'
import { useState } from 'react'
import { expect, within } from 'storybook/test'

import { Button } from '../Button'
import { Drawer, type DrawerPlacement, type DrawerSize } from './Drawer'

/**
 * SDL Drawer (Foundations). A scrim-backed sheet that tracks the finger 1:1,
 * dismisses on drag, and settles with a critically damped spring (a slight
 * bounce only when the release is a flick). Grabbing mid-open or mid-close
 * retargets that spring. `prefers-reduced-motion` snaps open and closed.
 * Chakra's `DrawerRoot` provides the focus trap, ESC-to-close, and click-scrim
 * close. Bottom placement shows a drag handle. Renders under light + dark via
 * the global theme toolbar (do not hardcode a mode).
 */
const meta = {
  title: 'UI/Drawer',
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

/** Enough rows to overflow the drawer body and make it scroll. */
function LongBody() {
  return (
    <Stack gap={4}>
      {Array.from({ length: 24 }, (_, i) => `row-${i + 1}`).map((rowKey, i) => (
        <Text key={rowKey} fontSize="sm" color="text.default">
          Row {i + 1}: scrollable drawer body content.
        </Text>
      ))}
    </Stack>
  )
}

/** Reusable trigger + controlled-open wrapper so each story is self-contained. */
function DrawerDemo({
  label = 'Open drawer',
  children = <BodyCopy />,
  initialOpen = false,
  ...args
}: Partial<ComponentProps<typeof Drawer>> & {
  label?: string
  /** Render the drawer already open (the trigger stays behind the scrim). */
  initialOpen?: boolean
}) {
  const [open, setOpen] = useState(initialOpen)
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

/** Required props for stories whose `DrawerDemo` supplies open state and body. */
const controlled = {
  open: false,
  onOpenChange: () => {},
  children: null,
} as const

/** Play for open stories: the dialog is on screen without any interaction. */
async function expectOpen(canvasElement: HTMLElement, name: string) {
  const page = within(canvasElement.ownerDocument.body)
  await expect(await page.findByRole('dialog', { name })).toBeVisible()
}

/** Default: closed with a trigger; opens from the start edge with a footer action. */
export const Default: Story = {
  args: { open: false, onOpenChange: () => {}, children: null },
  render: (args) => <DrawerDemo {...args} />,
}

/** Title only: no description and no footer action, the minimal drawer. */
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
      <LongBody />
    </DrawerDemo>
  ),
}

// Open stories are left off the autodocs page: an open drawer would cover it.
/** Open, start edge: side panel with description and footer action. */
export const OpenStart: Story = {
  tags: ['!autodocs'],
  args: controlled,
  render: (args) => <DrawerDemo {...args} initialOpen />,
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Filters'),
}

/** Open, end edge: trailing side panel, as used for profile editing. */
export const OpenEnd: Story = {
  tags: ['!autodocs'],
  args: {
    ...controlled,
    placement: 'end',
    title: 'Edit profile',
    description: 'Changes show on your public profile.',
    primaryActionLabel: 'Save',
  },
  render: (args) => <DrawerDemo {...args} initialOpen />,
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Edit profile'),
}

/** Open, top edge: sheet that drops down and is as tall as its content. */
export const OpenTop: Story = {
  tags: ['!autodocs'],
  args: { ...controlled, placement: 'top', title: 'Announcement' },
  render: (args) => <DrawerDemo {...args} initialOpen />,
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Announcement'),
}

/** Open, bottom edge: sheet with a drag handle, as tall as its content. */
export const OpenBottom: Story = {
  tags: ['!autodocs'],
  args: { ...controlled, placement: 'bottom' },
  render: (args) => <DrawerDemo {...args} initialOpen />,
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Filters'),
}

/** Open, bottom edge with `size="full"`: the sheet fills the viewport height. */
export const OpenBottomFull: Story = {
  tags: ['!autodocs'],
  args: { ...controlled, placement: 'bottom', size: 'full' },
  render: (args) => <DrawerDemo {...args} initialOpen />,
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Filters'),
}

/** Open, phone: bottom sheet at phone width, as used by search and filters. */
export const OpenBottomPhone: Story = {
  tags: ['!autodocs'],
  args: { ...controlled, placement: 'bottom' },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => <DrawerDemo {...args} initialOpen />,
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Filters'),
}

/** Open, phone: side panel fills the screen width, as in the account and site menus. */
export const OpenEndPhone: Story = {
  tags: ['!autodocs'],
  args: {
    ...controlled,
    placement: 'end',
    title: 'Menu',
    primaryActionLabel: 'Log out',
  },
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: (args) => (
    <DrawerDemo {...args} description={undefined} initialOpen />
  ),
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Menu'),
}

/** Open, title only: header and body, no description and no footer action. */
export const OpenTitleOnly: Story = {
  tags: ['!autodocs'],
  args: { ...controlled, title: 'Quick view' },
  render: (args) => (
    <DrawerDemo
      {...args}
      description={undefined}
      primaryActionLabel={undefined}
      initialOpen
    />
  ),
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Quick view'),
}

/** Open, long content: the body scrolls while header and footer stay pinned. */
export const OpenScrollingBody: Story = {
  tags: ['!autodocs'],
  args: controlled,
  render: (args) => (
    <DrawerDemo {...args} initialOpen>
      <LongBody />
    </DrawerDemo>
  ),
  play: ({ canvasElement }) => expectOpen(canvasElement, 'Filters'),
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

/** Every size option at the end edge (the panel is capped at `lg`, so widths match). */
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
