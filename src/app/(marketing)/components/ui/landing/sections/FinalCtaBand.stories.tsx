import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { FinalCtaBand } from './FinalCtaBand'

const { ctas } = messages.en.common

const meta = {
  title: 'Marketing/Landing/FinalCtaBand',
  component: FinalCtaBand,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    copy: messages.en.landing.finalCta,
    ctas: { postTask: ctas.postTask, becomeWorker: ctas.becomeWorker },
    postTaskHref: '/register?next=%2Ftasks%2Fcreate',
    becomeWorkerHref: '/register?next=%2Fworker%2Fsetup',
  },
} satisfies Meta<typeof FinalCtaBand>

export default meta
type Story = StoryObj<typeof meta>

/** The closing beat: one line and two ways in, post a task (primary) or become a worker. */
export const Default: Story = {}

/** Longer heading and body: the text block stays centred at its 40rem measure. */
export const LongCopy: Story = {
  args: {
    copy: {
      heading: 'Ready to get local help, or to start earning from your skills?',
      body: 'Post a task and compare quotes from people nearby, or set up a worker profile and start quoting on tasks around you. Both take about a minute, and neither costs anything to begin.',
    },
  },
}

/** Phone width: the heading shrinks and the two buttons wrap onto separate rows if needed. */
export const Mobile: Story = {
  globals: { viewport: { value: 'mobile1', isRotated: false } },
}

/** Traditional Chinese copy. */
export const TraditionalChinese: Story = {
  args: {
    copy: messages.zh_hk.landing.finalCta,
    ctas: {
      postTask: messages.zh_hk.common.ctas.postTask,
      becomeWorker: messages.zh_hk.common.ctas.becomeWorker,
    },
  },
}
