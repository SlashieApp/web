import {
  Toaster as ChakraToaster,
  HStack,
  Portal,
  createToaster,
} from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useEffect, useState } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { Button } from '../Button/Button'
import { Toast, type UiToastType } from './Toast'

/**
 * Toast is rendered by a Chakra `Toaster`. These stories spin up a local toaster
 * and fire toasts on click so you can see real placement, stacking and motion.
 */
const demoToaster = createToaster({
  placement: 'top-end',
  overlap: true,
  gap: 12,
})

const samples: Record<UiToastType, { title: string; description: string }> = {
  success: {
    title: 'Quote sent',
    description: 'Sam the plumber has been notified. You pay them directly.',
  },
  error: {
    title: "Couldn't send quote",
    description: 'Check your connection and try again.',
  },
  info: {
    title: 'Task updated',
    description: 'Your task in Hackney is now visible to nearby workers.',
  },
  warning: {
    title: 'Card expiring soon',
    description: 'Update your payment method to keep Slashie Unlimited.',
  },
  loading: {
    title: 'Sending quote…',
    description: 'Posting your £120 quote to the customer.',
  },
}

function fire(type: UiToastType) {
  demoToaster.create({
    type,
    duration: type === 'loading' ? 4000 : 5000,
    closable: true,
    ...samples[type],
  })
}

const meta = {
  title: 'UI/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { toast: { type: 'info', ...samples.info } },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

const TYPES: UiToastType[] = ['success', 'error', 'info', 'warning', 'loading']

/** Playground: buttons fire a live toast of each type. */
export const Playground: Story = {
  render: () => (
    <>
      <HStack gap={3} flexWrap="wrap">
        {TYPES.map((type) => (
          <Button
            key={type}
            variant={type === 'error' ? 'danger' : 'secondary'}
            onClick={() => fire(type)}
          >
            {type}
          </Button>
        ))}
      </HStack>
      <Portal>
        <ChakraToaster toaster={demoToaster} insetInline={{ mdDown: '4' }}>
          {(toast) => <Toast toast={toast} />}
        </ChakraToaster>
      </Portal>
    </>
  ),
}

type ShownToast = Parameters<typeof demoToaster.create>[0]

/**
 * Story-only host: its own toaster (so nothing leaks between stories) that
 * shows the given toasts straight away and never auto-dismisses them.
 */
function ShownToasts({ toasts }: { toasts: ShownToast[] }) {
  const [toaster] = useState(() =>
    createToaster({ placement: 'top-end', overlap: true, gap: 12 }),
  )
  useEffect(() => {
    toasts.forEach((toast, index) => {
      toaster.create({
        id: `story-toast-${index}`,
        duration: Number.POSITIVE_INFINITY,
        ...toast,
      })
    })
  }, [toaster, toasts])
  return (
    <ChakraToaster toaster={toaster} insetInline={{ mdDown: '4' }}>
      {(toast) => <Toast toast={toast} />}
    </ChakraToaster>
  )
}

/** Toasts are fixed to the viewport, so the Docs page renders them in an iframe. */
const toastDocs = {
  docs: { story: { inline: false, iframeHeight: 240 } },
} as const

const shown = (type: UiToastType): ShownToast => ({
  type,
  closable: true,
  ...samples[type],
})

/** Waits until every title is on screen (the toast animates in). */
const showsTitles =
  (...titles: string[]): Story['play'] =>
  async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    for (const title of titles) {
      await waitFor(() => expect(canvas.getByText(title)).toBeVisible(), {
        timeout: 3000,
      })
    }
  }

const successToasts = [shown('success')]
const errorToasts = [shown('error')]
const infoToasts = [shown('info')]
const warningToasts = [shown('warning')]
const loadingToasts = [shown('loading')]

/** Success: green check indicator for a completed action. */
export const Success: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={successToasts} />,
  play: showsTitles(samples.success.title),
}

/** Error: red warning indicator for a failed action. */
export const ErrorState: Story = {
  name: 'Error',
  parameters: toastDocs,
  render: () => <ShownToasts toasts={errorToasts} />,
  play: showsTitles(samples.error.title),
}

/** Info: neutral notice with no indicator icon. */
export const Info: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={infoToasts} />,
  play: showsTitles(samples.info.title),
}

/** Warning: amber indicator for something that needs attention soon. */
export const Warning: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={warningToasts} />,
  play: showsTitles(samples.warning.title),
}

/** Loading: a spinner replaces the icon and the toast never auto-dismisses. */
export const Loading: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={loadingToasts} />,
  play: showsTitles(samples.loading.title),
}

const actionToasts: ShownToast[] = [
  {
    type: 'success',
    closable: true,
    title: 'Quote withdrawn',
    description: 'The customer has been told you are no longer available.',
    action: { label: 'Undo', onClick: () => {} },
  },
]

/** With action: a link-style button beside the message (such as Undo). */
export const WithAction: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={actionToasts} />,
  play: showsTitles('Quote withdrawn'),
}

const titleOnlyToasts: ShownToast[] = [
  { type: 'success', closable: true, title: 'Task saved' },
]

/** Title only: a single line with no description. */
export const TitleOnly: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={titleOnlyToasts} />,
  play: showsTitles('Task saved'),
}

const notClosableToasts: ShownToast[] = [
  { type: 'info', ...samples.info, closable: false },
]

/** Not closable: no dismiss button, so it only leaves on its own timer. */
export const NotClosable: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={notClosableToasts} />,
  play: showsTitles(samples.info.title),
}

const longToasts: ShownToast[] = [
  {
    type: 'warning',
    closable: true,
    title: 'Your payment method needs updating before the next billing date',
    description:
      'We could not charge the card ending 4242 for your Slashie Unlimited plan. Update it in your account settings within seven days to keep unlimited quotes and priority placement.',
  },
]

/** Long content: the title and description wrap and the toast grows taller. */
export const LongContent: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={longToasts} />,
  play: showsTitles(
    'Your payment method needs updating before the next billing date',
  ),
}

const stackedToasts = [shown('success'), shown('warning'), shown('info')]

/** Stacked: several toasts at once pile up with the newest on top. */
export const Stacked: Story = {
  parameters: { docs: { story: { inline: false, iframeHeight: 320 } } },
  render: () => <ShownToasts toasts={stackedToasts} />,
  play: showsTitles(
    samples.success.title,
    samples.warning.title,
    samples.info.title,
  ),
}

/** Phone: the toast spans the narrow viewport with a 16px gutter. */
export const Mobile: Story = {
  parameters: toastDocs,
  globals: { viewport: { value: 'mobile1', isRotated: false } },
  render: () => <ShownToasts toasts={infoToasts} />,
  play: showsTitles(samples.info.title),
}

/** Dismiss: the close button removes the toast from the screen. */
export const DismissRemovesToast: Story = {
  parameters: toastDocs,
  render: () => <ShownToasts toasts={infoToasts} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(
      await canvas.findByRole(
        'button',
        { name: 'Dismiss notification' },
        { timeout: 3000 },
      ),
    )
    await waitFor(
      () => expect(canvas.queryByText(samples.info.title)).toBeNull(),
      {
        timeout: 3000,
      },
    )
  },
}
