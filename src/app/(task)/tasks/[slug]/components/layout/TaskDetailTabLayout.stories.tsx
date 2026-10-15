import { Box, Heading, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { Button, Card } from '@ui'

import { TASK_DETAIL_TAB } from '../../helpers/taskDetailTabs'
import { TaskDetailTabLayout } from './TaskDetailTabLayout'

const cards = (
  <>
    <Card layout="section" framed eyebrow="Task summary">
      <Text color="text.muted">The summary and quotes sit in this column.</Text>
    </Card>
    <Card layout="section" framed eyebrow="Details">
      <Text color="text.muted">Photos, description and facts follow.</Text>
    </Card>
  </>
)

const rail = (
  <Card layout="section" framed eyebrow="Help & actions">
    <Text color="text.muted">The desktop rail shares the cards' top edge.</Text>
  </Card>
)

/** Task-detail tab chrome with plain slots; the connected tabs wrap this. */
const meta = {
  title: 'Task detail/Layout/TaskDetailTabLayout',
  component: TaskDetailTabLayout,
  parameters: { layout: 'padded' },
  args: {
    title: ({ isStuck }) => (
      <Box pt={2} pb={4}>
        <Heading as="h1" fontSize={isStuck ? 'lg' : '3xl'}>
          Mount bookshelf on living room wall
        </Heading>
      </Box>
    ),
    tabs: [{ key: TASK_DETAIL_TAB.overview, label: 'Overview', cards: cards }],
    value: TASK_DETAIL_TAB.overview,
    onChange: fn(),
    ariaLabel: 'Task sections',
  },
  decorators: [
    (Story) => (
      <Box w="full" maxW="1100px">
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof TaskDetailTabLayout>

export default meta
type Story = StoryObj<typeof meta>

/** One section, no rail: the tab list is hidden and the cards fill the width. */
export const OverviewOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      name: 'Mount bookshelf on living room wall',
    })
    expect(canvas.queryByRole('tab')).toBeNull()
  },
}

/** Desktop: the cards take two thirds and the rail the last third. */
export const WithRail: Story = {
  args: { rail },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText('Help & actions')
  },
}

/** Desktop: the main button shares the title row, at the right with bottoms aligned. */
export const WithRailAndMainCta: Story = {
  args: { rail, mainCta: <Button w="full">Message</Button> },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Message' })
  },
}

/** Desktop: a lone button only takes its own width, so the title keeps the rest of the row. */
export const WithButtonOnlyMainCta: Story = {
  args: { rail, mainCta: <Button>Preview</Button>, mainCtaFit: true },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByRole('button', { name: 'Preview' })
  },
}

/** Phone: the rail and the desktop main button are hidden. */
export const Phone: Story = {
  args: {
    rail,
    mainCta: <Button w="full">Message</Button>,
    fittedBelowLg: true,
  },
  globals: { viewport: { value: 'mobile1' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await canvas.findByRole('heading', {
      name: 'Mount bookshelf on living room wall',
    })
    expect(canvas.queryByRole('button', { name: 'Message' })).toBeNull()
  },
}
