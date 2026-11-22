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
    title: (
      <Heading as="h1" fontSize="3xl">
        Mount bookshelf on living room wall
      </Heading>
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

const rect = (el: Element) => el.getBoundingClientRect()

/** The hairline under the title and the heading above it. */
async function titleAndLine(canvasElement: HTMLElement) {
  const heading = await within(canvasElement).findByRole('heading', {
    name: 'Mount bookshelf on living room wall',
  })
  const line = canvasElement.querySelector(
    '[data-task-title-line]',
  ) as HTMLElement
  return { heading, line }
}

/**
 * One section, no rail: the tab list is hidden and the cards fill the width.
 * A line under the title ends its block (Ryan 22 Nov): nothing sits between
 * the two, where the row of shortcut chips used to be.
 */
export const OverviewOnly: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const { heading, line } = await titleAndLine(canvasElement)
    expect(canvas.queryByRole('tab')).toBeNull()
    // A 1px line, as wide as the column, 16 under the title and 20 over the cards.
    await expect(getComputedStyle(line).borderBottomWidth).toBe('1px')
    await expect(rect(line).height).toBe(1)
    await expect(Math.round(rect(line).top - rect(heading).bottom)).toBe(16)
    const firstCard = canvas.getByText('Task summary')
    await expect(rect(firstCard).top).toBeGreaterThan(rect(line).bottom + 19)
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

/** Desktop: a card main button rises beside the title, its bottom level with the title's; both scroll away. */
export const WithRailAndMainCta: Story = {
  args: {
    rail,
    mainCta: (
      <Card layout="section" framed eyebrow="Quote sent">
        <Button w="full">Edit quote</Button>
      </Card>
    ),
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', {
      name: 'Edit quote',
    })
    const { heading, line } = await titleAndLine(canvasElement)
    // The card sits above the line and beside the title, never over it.
    const card = button.closest('section') ?? button
    await expect(rect(card).bottom).toBeLessThanOrEqual(rect(line).top - 15)
    await expect(rect(heading).right).toBeLessThanOrEqual(rect(card).left)
  },
}

/** Desktop: a lone button only takes its own width, beside the title, 16 above the line. */
export const WithButtonOnlyMainCta: Story = {
  args: {
    rail,
    mainCta: <Button>Preview</Button>,
    mainCtaFit: true,
  },
  globals: { viewport: { value: 'desktop' } },
  play: async ({ canvasElement }) => {
    const button = await within(canvasElement).findByRole('button', {
      name: 'Preview',
    })
    const { heading, line } = await titleAndLine(canvasElement)
    await expect(Math.round(rect(line).top - rect(button).bottom)).toBe(16)
    await expect(rect(heading).right).toBeLessThanOrEqual(rect(button).left)
    // Level with the title's foot, in the row the chips used to hold.
    await expect(Math.round(rect(button).bottom)).toBe(
      Math.round(rect(heading).bottom),
    )
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
