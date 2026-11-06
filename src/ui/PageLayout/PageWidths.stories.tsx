import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, fn, within } from 'storybook/test'

import {
  PAGE_CONTAINER_PX,
  READABLE_COLUMN_MAX_W_CSS,
} from '@/theme/pageContainer'

import { PageBleed, PageContainer } from '../PageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '../PageContainer/pageLines.testing'
import { StatusCard } from '../StatusCard'
import {
  STATUS_CARD_PX,
  expectCentredCardBox,
} from '../StatusCard/statusCard.testing'
import {
  StepFlowBody,
  StepFlowColumn,
  StepFlowHeading,
} from '../StepFlowLayout'
import { PageLayout } from './PageLayout'

const COLUMN_PX = Number.parseFloat(READABLE_COLUMN_MAX_W_CSS) * 16

/**
 * One entry per page type of the layout rules (FE-493), each drawn under the
 * site header's line (R1): a header bar in the page container whose logo box
 * is the logo line and whose menu box is the menu line. A play check says
 * where the page starts and ends against those two lines, and every check
 * also asserts the header itself is on its lines, so a page that drifts and a
 * header that drifts both fail. The checks are the same helpers the page
 * stories use (`pageLines.testing`, `statusCard.testing`).
 *
 * This overview covers the shared primitives only (`PageContainer`,
 * `PageBleed`, `PageLayout`, `StatusCard`, the step-flow column) on drawn demo
 * pages. The real pages are checked in their own stories (the `On The Lines`,
 * `Rules` and card-width stories next to each screen), which is where a page
 * that drifts from a primitive is caught.
 */

/** The site header: logo left, menu right, both in the page container. */
function SiteHeaderLine() {
  return (
    <Box
      as="header"
      borderBottomWidth="1px"
      borderColor="border.default"
      bg="bg.surface"
    >
      <PageContainer>
        <Flex h={14} align="center" justify="space-between">
          <Box
            data-testid="logo"
            w={24}
            h={7}
            borderRadius="md"
            bg="bg.muted"
          />
          <Box
            data-testid="menu"
            w={40}
            h={7}
            borderRadius="full"
            bg="bg.muted"
          />
        </Flex>
      </PageContainer>
    </Box>
  )
}

/** A block of content a play check can find. */
function Block({
  id,
  title,
  minH,
}: {
  id: string
  title: string
  minH?: number
}) {
  return (
    <Box
      data-testid={id}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.surface"
      p={5}
      minH={minH ? `${minH}px` : undefined}
    >
      <Text fontWeight={600}>{title}</Text>
      <Text fontSize="sm" color="text.muted">
        Content.
      </Text>
    </Box>
  )
}

const PAGE_TYPES = [
  'single-column',
  'wide',
  'wide-rail',
  'full-bleed',
  'centred-card',
  'step-flow-column',
  'step-flow-rail-panel',
] as const
type PageType = (typeof PAGE_TYPES)[number]

function PageOfType({ type }: { type: PageType }) {
  switch (type) {
    case 'single-column':
      return (
        <PageLayout
          title="Account"
          description="Email, phone and sign-in."
          onBack={fn()}
          backAriaLabel="Go back"
        >
          <Block id="body" title="Contact" />
          <Block id="body-2" title="Sign-in and security" />
        </PageLayout>
      )
    case 'wide':
      return (
        <PageLayout
          width="wide"
          title="My tasks"
          onBack={fn()}
          backAriaLabel="Go back"
        >
          <Block id="body" title="Posted tasks" minH={160} />
        </PageLayout>
      )
    case 'wide-rail':
      return (
        <PageLayout
          width="wide"
          title="Profile"
          onBack={fn()}
          backAriaLabel="Go back"
          sidebar={<Block id="rail" title="Visibility" />}
        >
          <Block id="body" title="About" minH={160} />
        </PageLayout>
      )
    case 'full-bleed':
      return (
        <PageBleed
          data-testid="bleed"
          bg="bg.muted"
          borderBottomWidth="1px"
          borderColor="border.default"
          py={10}
        >
          <Block id="body" title="Content inside a full-bleed band" />
        </PageBleed>
      )
    case 'centred-card':
      return (
        <StatusCard
          title="This page is not available"
          body="It may have moved, or you may not have access to it."
        />
      )
    case 'step-flow-column':
      return (
        <PageContainer py={5}>
          <StepFlowColumn data-testid="step-column">
            <StepFlowHeading
              title="Where is the task?"
              description="Add the address."
            />
            <StepFlowBody>
              <Block id="body" title="Address" />
            </StepFlowBody>
          </StepFlowColumn>
        </PageContainer>
      )
    case 'step-flow-rail-panel':
      return (
        <PageContainer py={8}>
          <Grid
            gridTemplateColumns="minmax(280px, 320px) minmax(0, 1fr)"
            gap={8}
          >
            <Block id="rail" title="Steps" minH={240} />
            <Block id="body" title="Where is the task?" minH={240} />
          </Grid>
        </PageContainer>
      )
  }
}

const meta = {
  title: 'Layout/Page widths',
  component: PageOfType,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  argTypes: {
    type: { control: 'select', options: PAGE_TYPES },
  },
  render: ({ type }) => (
    <Box minH="100vh" bg="bg.canvas">
      <SiteHeaderLine />
      <PageOfType type={type} />
    </Box>
  ),
} satisfies Meta<typeof PageOfType>

export default meta
type Story = StoryObj<typeof meta>

/** The header is on its lines and the window is the one the story asks for. */
function expectHeaderLines(canvasElement: HTMLElement, width: number) {
  expectWindowWidth(canvasElement, width)
  const canvas = within(canvasElement)
  const { logo, menu } = lines(canvasElement)
  expectPx(
    boxOf(canvas.getByTestId('logo')).left,
    logo,
    'logo on the logo line',
  )
  expectPx(
    boxOf(canvas.getByTestId('menu')).right,
    menu,
    'menu on the menu line',
  )
}

const byId = (canvasElement: HTMLElement, id: string) =>
  within(canvasElement).getByTestId(id)

/** The page header (Back and the title) starts on the logo line and spans to the menu line (R2). */
function expectPageHeader(canvasElement: HTMLElement) {
  const { logo, menu } = lines(canvasElement)
  const title = canvasElement.querySelector('[data-sticky-header-title]')
  const row = canvasElement.querySelector('[data-sticky-header-row]')
  expect(title, 'the page title').not.toBeNull()
  expect(row, 'the header row').not.toBeNull()
  expectPx(boxOf(title as Element).left, logo, 'the title is on the logo line')
  expectPx(
    boxOf(row as Element).right,
    menu,
    'the header row ends on the menu line',
  )
}

async function expectSingleColumn(canvasElement: HTMLElement, width: number) {
  expectHeaderLines(canvasElement, width)
  expectPageHeader(canvasElement)
  const { logo, menu } = lines(canvasElement)
  const body = boxOf(byId(canvasElement, 'body'))
  expectPx(body.left, logo, 'the column is on the logo line, not centred')
  expectPx(
    body.width,
    Math.min(COLUMN_PX, menu - logo),
    '720, or the container when narrower',
  )
}

async function expectWide(canvasElement: HTMLElement, width: number) {
  expectHeaderLines(canvasElement, width)
  expectPageHeader(canvasElement)
  const { logo, menu } = lines(canvasElement)
  const body = boxOf(byId(canvasElement, 'body'))
  expectPx(body.left, logo, 'the page starts on the logo line')
  expectPx(body.right, menu, 'the page fills the container to the menu line')
}

async function expectWideRail(canvasElement: HTMLElement, width: number) {
  expectHeaderLines(canvasElement, width)
  expectPageHeader(canvasElement)
  const { logo, menu } = lines(canvasElement)
  const body = boxOf(byId(canvasElement, 'body'))
  const rail = boxOf(byId(canvasElement, 'rail'))
  expectPx(body.left, logo, 'the body starts on the logo line')
  if (width >= 1024) {
    expectPx(rail.right, menu, 'the rail ends on the menu line')
    expect(rail.left, 'the rail is beside the body').toBeGreaterThan(body.right)
  } else {
    expectPx(rail.left, logo, 'stacked, the rail starts on the logo line')
    expectPx(rail.right, menu, 'stacked, the rail fills the container')
  }
}

async function expectFullBleed(canvasElement: HTMLElement, width: number) {
  expectHeaderLines(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const bleed = boxOf(byId(canvasElement, 'bleed'))
  const body = boxOf(byId(canvasElement, 'body'))
  expectPx(bleed.left, 0, 'the band starts at the screen edge')
  expectPx(bleed.right, width, 'the band runs to the other screen edge')
  expectPx(body.left, logo, 'the content inside sits on the logo line')
  expectPx(body.right, menu, 'the content inside ends on the menu line')
}

async function expectCentredCard(canvasElement: HTMLElement, width: number) {
  expectHeaderLines(canvasElement, width)
  const card = within(canvasElement).getByRole('region', {
    name: 'This page is not available',
  })
  expectCentredCardBox(canvasElement, card)
  expect(STATUS_CARD_PX).toBe(448)
}

/** Below lg a step is one 720 column, left-aligned on the logo line (R3). */
async function expectStepFlowColumn(canvasElement: HTMLElement, width: number) {
  expectHeaderLines(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const column = boxOf(byId(canvasElement, 'step-column'))
  expectPx(
    column.left,
    logo,
    'the step column is on the logo line, not centred',
  )
  expectPx(
    column.width,
    Math.min(COLUMN_PX, menu - logo),
    '720, or the container when narrower',
  )
}

/** From lg the rail and the panel fill the container (R3 applies below lg only). */
async function expectStepFlowRailPanel(
  canvasElement: HTMLElement,
  width: number,
) {
  expectHeaderLines(canvasElement, width)
  const { logo, menu } = lines(canvasElement)
  const rail = boxOf(byId(canvasElement, 'rail'))
  const panel = boxOf(byId(canvasElement, 'body'))
  expectPx(rail.left, logo, 'the rail starts on the logo line')
  expectPx(panel.right, menu, 'the panel ends on the menu line')
  expect(panel.left, 'the panel is right of the rail').toBeGreaterThan(
    rail.right,
  )
  expect(
    panel.right - rail.left,
    'rail plus panel fill the container, not a 720 column',
  ).toBeGreaterThan(COLUMN_PX)
}

/** The container the pages are drawn in is the 80rem box (a sanity check on the 1920 formula). */
const CONTAINER_PX = PAGE_CONTAINER_PX

/** Single column: Account, Billing, settings pages. 720, left on the logo line. */
export const SingleColumn1366: Story = {
  ...viewportAt(1366),
  args: { type: 'single-column' },
  play: ({ canvasElement }) => expectSingleColumn(canvasElement, 1366),
}

export const SingleColumn390: Story = {
  ...viewportAt(390),
  args: { type: 'single-column' },
  play: ({ canvasElement }) => expectSingleColumn(canvasElement, 390),
}

/** Wide: Profile, My tasks, lists. The container, logo line to menu line. */
export const Wide1366: Story = {
  ...viewportAt(1366),
  args: { type: 'wide' },
  play: ({ canvasElement }) => expectWide(canvasElement, 1366),
}

export const Wide390: Story = {
  ...viewportAt(390),
  args: { type: 'wide' },
  play: ({ canvasElement }) => expectWide(canvasElement, 390),
}

/** Wide with a rail: the rail on the right from lg, stacked under the body below it. */
export const WideWithRail1366: Story = {
  ...viewportAt(1366),
  args: { type: 'wide-rail' },
  play: ({ canvasElement }) => expectWideRail(canvasElement, 1366),
}

export const WideWithRail390: Story = {
  ...viewportAt(390),
  args: { type: 'wide-rail' },
  play: ({ canvasElement }) => expectWideRail(canvasElement, 390),
}

/** Full bleed (maps, bands, covers): edge to edge, the content inside on the lines. */
export const FullBleedWithContent1366: Story = {
  ...viewportAt(1366),
  args: { type: 'full-bleed' },
  play: ({ canvasElement }) => expectFullBleed(canvasElement, 1366),
}

export const FullBleedWithContent390: Story = {
  ...viewportAt(390),
  args: { type: 'full-bleed' },
  play: ({ canvasElement }) => expectFullBleed(canvasElement, 390),
}

/** Wider than the container: the band still goes to the screen edges, the content stays on the lines. */
export const FullBleedWithContent1920: Story = {
  ...viewportAt(1920),
  args: { type: 'full-bleed' },
  play: async ({ canvasElement }) => {
    await expectFullBleed(canvasElement, 1920)
    const body = boxOf(byId(canvasElement, 'body'))
    expect(body.width).toBeLessThan(CONTAINER_PX)
  },
}

/** Centred card (auth forms, status, gate and error cards): one 448 width, centred. */
export const CentredCard1366: Story = {
  ...viewportAt(1366),
  args: { type: 'centred-card' },
  play: ({ canvasElement }) => expectCentredCard(canvasElement, 1366),
}

export const CentredCard390: Story = {
  ...viewportAt(390),
  args: { type: 'centred-card' },
  play: ({ canvasElement }) => expectCentredCard(canvasElement, 390),
}

/** Step flow below lg: one column, left on the logo line (390 is the container, 820 shows the 720 cap). */
export const StepFlowBelowLg390: Story = {
  ...viewportAt(390),
  args: { type: 'step-flow-column' },
  play: ({ canvasElement }) => expectStepFlowColumn(canvasElement, 390),
}

export const StepFlowBelowLg820: Story = {
  ...viewportAt(820),
  args: { type: 'step-flow-column' },
  play: ({ canvasElement }) => expectStepFlowColumn(canvasElement, 820),
}

/** Step flow from lg: rail plus panel fill the container (Ryan confirmed on 5 Nov, audit W9). */
export const StepFlowRailPanel1366: Story = {
  ...viewportAt(1366),
  args: { type: 'step-flow-rail-panel' },
  play: ({ canvasElement }) => expectStepFlowRailPanel(canvasElement, 1366),
}
