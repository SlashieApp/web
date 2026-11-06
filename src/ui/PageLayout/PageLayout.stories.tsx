import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import { READABLE_COLUMN_MAX_W_CSS } from '@/theme/pageContainer'

import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '../PageContainer/pageLines.testing'
import { PageLayout } from './PageLayout'

const COLUMN_PX = Number.parseFloat(READABLE_COLUMN_MAX_W_CSS) * 16

/** A block of page content that a play test can find. */
function Block({ id, title }: { id: string; title: string }) {
  return (
    <Box
      data-testid={id}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.surface"
      p={5}
    >
      <Text fontWeight={600}>{title}</Text>
      <Text fontSize="sm" color="text.muted">
        Content.
      </Text>
    </Box>
  )
}

const body = (
  <>
    <Block id="block" title="Contact" />
    <Block id="block-2" title="Sign-in and security" />
  </>
)

const rail = <Block id="rail" title="Visibility" />

const meta = {
  title: 'UI/PageLayout',
  component: PageLayout,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'Account',
    description: 'Email, phone and sign-in.',
    onBack: fn(),
    backAriaLabel: 'Go back',
    children: body,
  },
  argTypes: {
    width: { control: 'inline-radio', options: ['column', 'wide'] },
    onBack: { control: false },
    sidebar: { control: false },
    afterHeader: { control: false },
  },
} satisfies Meta<typeof PageLayout>

export default meta
type Story = StoryObj<typeof meta>

/** The page's parts, as they sit on the page. */
function parts(canvasElement: HTMLElement) {
  const canvas = within(canvasElement)
  return {
    title: canvas.getByRole('heading', { level: 1 }),
    row: canvasElement.querySelector('[data-sticky-header-row]') as HTMLElement,
    back: canvas.getByRole('button', { name: 'Go back' }),
    column: canvasElement.querySelector(
      '[data-page-layout-column]',
    ) as HTMLElement | null,
    block: canvas.getByTestId('block'),
  }
}

/**
 * R2: the page header (the bar's row and the title) starts on the logo line and
 * spans the container, whatever the body is.
 */
async function expectHeaderOnTheLines(canvasElement: HTMLElement) {
  const { logo, menu } = lines(canvasElement)
  const { title, row } = parts(canvasElement)
  expectPx(boxOf(row).left, logo, `row starts on the logo line ${logo}`)
  expectPx(boxOf(row).right, menu, `row ends on the menu line ${menu}`)
  expectPx(boxOf(title).left, logo, `title starts on the logo line ${logo}`)
}

/**
 * R3: the column is 45rem, LEFT-aligned on the logo line, never centred. On a
 * window narrower than the column plus gutters it is the container.
 */
async function expectColumnOnTheLine(canvasElement: HTMLElement) {
  await expectHeaderOnTheLines(canvasElement)
  const { logo, menu } = lines(canvasElement)
  const { column } = parts(canvasElement)
  expect(column).not.toBeNull()
  const box = boxOf(column as HTMLElement)
  expectPx(box.left, logo, `column starts on the logo line ${logo}`)
  expectPx(box.width, Math.min(COLUMN_PX, menu - logo), 'column width')
}

/** Desktop 1366: header on the logo line (75), column 720 from 75 to 795, the rest empty. */
export const Column: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1366)
    await expectColumnOnTheLine(canvasElement)
    const box = boxOf(parts(canvasElement).column as HTMLElement)
    expectPx(box.left, 75)
    expectPx(box.right, 795)
  },
}

/** Wide desktop 1920: the column is still on the logo line (352), not in the middle. */
export const ColumnWide: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1920)
    await expectColumnOnTheLine(canvasElement)
    const box = boxOf(parts(canvasElement).column as HTMLElement)
    expectPx(box.left, 352)
    expectPx(box.right, 1072)
  },
}

/** lg 1024: the container is the window; the column is 720 of the 960 and left. */
export const ColumnLg: Story = {
  ...viewportAt(1024),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1024)
    await expectColumnOnTheLine(canvasElement)
  },
}

/** Tablet 820: gutters 24, the column is 720 of the 772. */
export const ColumnTablet: Story = {
  ...viewportAt(820),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 820)
    await expectColumnOnTheLine(canvasElement)
  },
}

/** Phone: the column is the container (358 at 390), the same bar with Back. */
export const ColumnPhone: Story = {
  ...viewportAt(390),
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    await expectColumnOnTheLine(canvasElement)
    expectPx(boxOf(parts(canvasElement).column as HTMLElement).width, 358)
    await expect(parts(canvasElement).back).toBeVisible()
  },
}

/** A hero or notice between the header and the body sits in the column. */
export const WithAfterHeader: Story = {
  ...viewportAt(1366),
  render: (args) => (
    <PageLayout
      {...args}
      afterHeader={
        <Box data-testid="after" p={4} bg="bg.subtle" borderRadius="lg">
          <Text fontSize="sm">Content between the header and the body.</Text>
        </Box>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    const after = within(canvasElement).getByTestId('after')
    expectPx(boxOf(after).left, 75)
    expectPx(boxOf(after).width, COLUMN_PX)
  },
}

/** A wide page fills the container, logo line to menu line (R4). */
export const Wide: Story = {
  ...viewportAt(1366),
  args: { width: 'wide', title: 'Profile', children: body },
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1366)
    await expectHeaderOnTheLines(canvasElement)
    const { logo, menu } = lines(canvasElement)
    const block = boxOf(parts(canvasElement).block)
    expectPx(block.left, logo)
    expectPx(block.right, menu)
    expect(parts(canvasElement).column).toBeNull()
  },
}

/** A wide page with a rail: body and rail together span the container. */
export const WideWithRail: Story = {
  ...viewportAt(1920),
  args: { width: 'wide', title: 'Profile', sidebar: rail },
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1920)
    await expectHeaderOnTheLines(canvasElement)
    const { logo, menu } = lines(canvasElement)
    const canvas = within(canvasElement)
    const rail = boxOf(canvas.getByTestId('rail'))
    expectPx(rail.right, menu, 'the rail ends on the menu line')
    expectPx(boxOf(parts(canvasElement).block).left, logo)
  },
}

/** Phone: the rail stacks under the body. */
export const WideWithRailPhone: Story = {
  ...viewportAt(390),
  args: { width: 'wide', title: 'Profile', sidebar: rail },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const block = canvas.getByTestId('block-2')
    const rail = canvas.getByTestId('rail')
    expect(rail.getBoundingClientRect().top).toBeGreaterThanOrEqual(
      block.getBoundingClientRect().bottom,
    )
    expectPx(boxOf(rail).left, 16)
  },
}

/** Title, description, Back: one h1. */
export const Header: Story = {
  ...viewportAt(1366),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await expect(canvas.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    await expect(canvas.getByText('Email, phone and sign-in.')).toBeVisible()
    await expect(canvas.getByRole('button', { name: 'Go back' })).toBeVisible()
  },
}
