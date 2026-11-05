import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import {
  LuClock,
  LuMailCheck,
  LuSearchX,
  LuTriangleAlert,
} from 'react-icons/lu'
import { expect, within } from 'storybook/test'

import { STATUS_CARD_MAX_W_CSS } from '@/theme/pageContainer'

import { Button } from '../Button'
import {
  boxOf,
  expectPx,
  expectWindowWidth,
  lines,
  viewportAt,
} from '../PageContainer/pageLines.testing'
import { StatusCard } from './StatusCard'

const CARD_PX = Number.parseFloat(STATUS_CARD_MAX_W_CSS) * 16

const meta = {
  title: 'UI/StatusCard',
  component: StatusCard,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: {
    title: 'This page is not available',
    body: 'It may have moved, or you may not have access to it.',
    // Actions are JSX, which does not belong in serialisable args: each story
    // that has them renders its own through `render`.
  },
  argTypes: {
    icon: { control: false },
    actions: { control: false },
    footer: { control: false },
    tone: {
      control: 'inline-radio',
      options: ['neutral', 'success', 'warning', 'danger'],
    },
  },
} satisfies Meta<typeof StatusCard>

export default meta
type Story = StoryObj<typeof meta>

const actions = (
  <>
    <Button variant="primary" size="form">
      Search tasks
    </Button>
    <Button variant="ghost" size="form">
      Go home
    </Button>
  </>
)

/** The card: a region named by its title. */
const cardOf = (canvasElement: HTMLElement, name: string) =>
  within(canvasElement).getByRole('region', { name })

/**
 * R6: the card is centred in the container and `STATUS_CARD_MAX_W` wide (448),
 * the one width of every centred card. On a window narrower than the card
 * plus the gutters it is the container.
 */
async function expectCentredCard(canvasElement: HTMLElement, name: string) {
  const { width, logo, menu } = lines(canvasElement)
  const box = boxOf(cardOf(canvasElement, name))
  expectPx(box.width, Math.min(CARD_PX, menu - logo), 'card width')
  expectPx(box.left + box.width / 2, width / 2, 'card is centred in the window')
}

/** A not-found page: the logo, a large code, a message and two actions. The page on its own. */
export const NotFound: Story = {
  ...viewportAt(1366),
  args: { fullPage: true, logo: true, code: '404', title: 'Page not found' },
  render: (args) => <StatusCard {...args} actions={actions} />,
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1366)
    await expect(within(canvasElement).getByText('404')).toBeVisible()
    await expect(
      within(canvasElement).getByRole('heading', {
        level: 1,
        name: 'Page not found',
      }),
    ).toBeVisible()
    await expectCentredCard(canvasElement, 'Page not found')
  },
}

/** A gate in front of a page, inside the app: an icon, a message, one action. */
export const Gate: Story = {
  ...viewportAt(1366),
  args: {
    icon: LuMailCheck,
    tone: 'success',
    title: 'Verify your email',
    body: 'We sent a link to your inbox. Open it to continue.',
  },
  render: (args) => (
    <StatusCard
      {...args}
      actions={
        <Button variant="primary" size="form">
          Resend email
        </Button>
      }
    />
  ),
  play: ({ canvasElement }) =>
    expectCentredCard(canvasElement, 'Verify your email'),
}

/** An error: a danger icon and a retry. */
export const ErrorCard: Story = {
  ...viewportAt(1366),
  args: {
    icon: LuTriangleAlert,
    tone: 'danger',
    title: 'Something went wrong',
    body: 'We could not load this page. Try again in a moment.',
  },
  render: (args) => (
    <StatusCard
      {...args}
      actions={
        <>
          <Button variant="primary" size="form">
            Try again
          </Button>
          <Button variant="ghost" size="form">
            Go home
          </Button>
        </>
      }
    />
  ),
  play: ({ canvasElement }) =>
    expectCentredCard(canvasElement, 'Something went wrong'),
}

/** Unavailable: neutral icon, no actions. */
export const NoActions: Story = {
  ...viewportAt(1366),
  args: { icon: LuSearchX, title: 'Not available' },
  play: ({ canvasElement }) =>
    expectCentredCard(canvasElement, 'Not available'),
}

/** A warning with a second note under the message (children) and a line under the card. */
export const NoteAndFooter: Story = {
  ...viewportAt(1366),
  args: {
    icon: LuClock,
    tone: 'warning',
    title: 'Your account is scheduled for deletion',
    body: 'It will be deleted on 30 November.',
    children: <span>You can restore it until then.</span>,
    footer: 'Need help? Contact us.',
  },
  render: (args) => (
    <StatusCard
      {...args}
      actions={
        <Button variant="primary" size="form">
          Restore my account
        </Button>
      }
    />
  ),
  play: async ({ canvasElement }) => {
    await expectCentredCard(
      canvasElement,
      'Your account is scheduled for deletion',
    )
    await expect(
      within(canvasElement).getByText('Need help? Contact us.'),
    ).toBeVisible()
  },
}

/** Wide window: still 448 and centred in the 80rem container, never stretched. */
export const Wide: Story = {
  ...viewportAt(1920),
  args: { fullPage: true, logo: true, code: '404', title: 'Page not found' },
  render: (args) => <StatusCard {...args} actions={actions} />,
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1920)
    await expectCentredCard(canvasElement, 'Page not found')
    expectPx(boxOf(cardOf(canvasElement, 'Page not found')).width, 448)
  },
}

/** lg: the same 448. */
export const Lg: Story = {
  ...viewportAt(1024),
  args: { title: 'Not available', body: 'Try again later.' },
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 1024)
    await expectCentredCard(canvasElement, 'Not available')
    expectPx(boxOf(cardOf(canvasElement, 'Not available')).width, 448)
  },
}

/** Phone: the card fills the container (358 at 390), actions full width. */
export const Phone: Story = {
  ...viewportAt(390),
  args: { fullPage: true, logo: true, code: '404', title: 'Page not found' },
  render: (args) => <StatusCard {...args} actions={actions} />,
  play: async ({ canvasElement }) => {
    expectWindowWidth(canvasElement, 390)
    await expectCentredCard(canvasElement, 'Page not found')
    expectPx(boxOf(cardOf(canvasElement, 'Page not found')).width, 358)
  },
}
