import { Box, Text } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, within } from 'storybook/test'

import { PAGE_CONTAINER_MAX_W_CSS } from '@/theme/pageContainer'

import { PageBleed, PageContainer } from './PageContainer'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from './pageLines.testing'

/** The content the container holds: a bordered box that shows the content box. */
function Probe({ label = 'Content box' }: { label?: string }) {
  return (
    <Box
      data-testid="probe"
      borderWidth="1px"
      borderStyle="dashed"
      borderColor="border.default"
      borderRadius="md"
      p={4}
    >
      <Text fontSize="sm" color="text.muted">
        {label}
      </Text>
    </Box>
  )
}

const meta = {
  title: 'UI/PageContainer',
  component: PageContainer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { children: <Probe /> },
  argTypes: {
    gutters: { control: 'inline-radio', options: ['all', 'lg', 'none'] },
  },
} satisfies Meta<typeof PageContainer>

export default meta
type Story = StoryObj<typeof meta>

/**
 * The content box is the logo line on the left and the menu line on the
 * right (R1): the site header's own measure. At every width the box starts
 * where the formula puts the logo (gutter 16 / 24 / 32 plus the margin beyond
 * 80rem) and is never wider than 80rem less the gutters.
 */
async function expectOnTheLines(canvasElement: HTMLElement, width: number) {
  expectWindowWidth(canvasElement, width)
  const probe = within(canvasElement).getByTestId('probe')
  const { logo, menu } = lines(canvasElement)
  const box = boxOf(probe)
  expectPx(box.left, logo, `left ${box.left} is the logo line ${logo}`)
  expectPx(box.right, menu, `right ${box.right} is the menu line ${menu}`)
  expect(box.width).toBeLessThanOrEqual(
    Number.parseFloat(PAGE_CONTAINER_MAX_W_CSS) * 16,
  )
}

export const Default: Story = {
  ...viewportAt(1366),
  play: ({ canvasElement }) => expectOnTheLines(canvasElement, 1366),
}

/** Phone: gutters 16, the same measure the page has under no header. */
export const Phone: Story = {
  ...viewportAt(390),
  play: ({ canvasElement }) => expectOnTheLines(canvasElement, 390),
}

/** Tablet portrait: gutters 24. */
export const Tablet: Story = {
  ...viewportAt(820),
  play: ({ canvasElement }) => expectOnTheLines(canvasElement, 820),
}

/** From lg: gutters 32, the container is the window until 1280. */
export const Lg: Story = {
  ...viewportAt(1024),
  play: ({ canvasElement }) => expectOnTheLines(canvasElement, 1024),
}

/** Wide: the container stops at 80rem and is centred; the margin grows. */
export const Wide: Story = {
  ...viewportAt(1920),
  play: async ({ canvasElement }) => {
    await expectOnTheLines(canvasElement, 1920)
    const box = boxOf(within(canvasElement).getByTestId('probe'))
    // 80rem less two 32px gutters.
    expectPx(box.width, 1280 - 64)
  },
}

/** No gutters below lg (Messages, the create-task map run edge to edge on phones and tablets). */
export const GuttersFromLg: Story = {
  ...viewportAt(390),
  args: { gutters: 'lg' },
  play: async ({ canvasElement }) => {
    const box = boxOf(within(canvasElement).getByTestId('probe'))
    expectPx(box.left, 0)
    expectPx(box.right, 390)
  },
}

/** `lg` gutters from lg: 32, on the logo line. */
export const GuttersFromLgDesktop: Story = {
  ...viewportAt(1366),
  args: { gutters: 'lg' },
  play: ({ canvasElement }) => expectOnTheLines(canvasElement, 1366),
}

/** No gutters at all: the content brings its own. */
export const NoGutters: Story = {
  ...viewportAt(1366),
  args: { gutters: 'none' },
  play: async ({ canvasElement }) => {
    const box = boxOf(within(canvasElement).getByTestId('probe'))
    expectPx(box.left, (1366 - 1280) / 2)
    expectPx(box.width, 1280)
  },
}

/**
 * Full bleed (R5): the band runs edge to edge and takes the background, and
 * its content still sits on the logo line and the menu line.
 */
export const Bleed: Story = {
  ...viewportAt(1920),
  render: () => (
    <PageBleed bg="bg.subtle" py={8} data-testid="band">
      <Probe label="Content in a full-bleed band" />
    </PageBleed>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const band = boxOf(canvas.getByTestId('band'))
    expectPx(band.left, 0)
    expectPx(band.right, 1920)
    await expectOnTheLines(canvasElement, 1920)
  },
}

/** The same band on a phone. */
export const BleedPhone: Story = {
  ...viewportAt(390),
  render: () => (
    <PageBleed bg="bg.subtle" py={8} data-testid="band">
      <Probe label="Content in a full-bleed band" />
    </PageBleed>
  ),
  play: async ({ canvasElement }) => {
    expectPx(boxOf(within(canvasElement).getByTestId('band')).width, 390)
    await expectOnTheLines(canvasElement, 390)
  },
}
