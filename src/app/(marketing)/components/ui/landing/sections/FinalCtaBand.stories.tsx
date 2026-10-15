import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { FinalCtaBand } from './FinalCtaBand'

const { ctas } = messages.en.common

const meta: Meta<typeof FinalCtaBand> = {
  title: 'Marketing/Landing/FinalCtaBand',
  component: FinalCtaBand,
  parameters: {
    layout: 'padded',
  },
  args: {
    copy: messages.en.landing.finalCta,
    ctas: { postTask: ctas.postTask, becomeWorker: ctas.becomeWorker },
    postTaskHref: '/register?next=%2Ftasks%2Fcreate',
    becomeWorkerHref: '/register?next=%2Fworker%2Fsetup',
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
