import {
  Toaster as ChakraToaster,
  HStack,
  Portal,
  createToaster,
} from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

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
    title: 'Quote accepted',
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
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { toast: { type: 'info', ...samples.info } },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

const TYPES: UiToastType[] = ['success', 'error', 'info', 'warning', 'loading']

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
