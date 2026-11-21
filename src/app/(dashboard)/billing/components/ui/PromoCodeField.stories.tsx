import { Box, Stack } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { expect, userEvent, within } from 'storybook/test'

import {
  type StoryResponse,
  withSession,
} from '@/app/(auth)/helpers/authStoryDecorator'
import {
  storyWorker,
  storyWorkerMe,
} from '@/app/(auth)/helpers/authStoryFixtures'
import { LocaleProvider } from '@/i18n/LocaleProvider'
import { Button } from '@ui'

import { usePromoCode } from '../../helpers/usePromoCode'
import { PromoCodeField } from './PromoCodeField'

/** The Slashie Pro button with "Have a code?" under it, as on Pricing. */
function Demo({ align = 'center' }: { align?: 'center' | 'start' }) {
  const promo = usePromoCode()
  return (
    <Box maxW="360px">
      <Stack gap={2} w="full">
        <Button w="full" variant="primary">
          Start free trial
        </Button>
        <PromoCodeField promo={promo} align={align} />
      </Stack>
    </Box>
  )
}

const working = (fields: Record<string, unknown> = {}): StoryResponse => ({
  kind: 'data',
  data: {
    checkPromoCode: {
      code: 'LAUNCH50',
      valid: true,
      problem: null,
      percentOff: 50,
      amountOff: null,
      currency: null,
      duration: 'REPEATING',
      durationInMonths: 3,
      startsAfterTrial: true,
      ...fields,
    },
  },
})

const session = (CheckPromoCode: StoryResponse) =>
  withSession({
    me: storyWorkerMe({ worker: storyWorker() }),
    responses: { CheckPromoCode },
  })

const meta = {
  title: 'Dashboard/Billing/PromoCodeField',
  component: Demo,
  parameters: { layout: 'padded' },
  decorators: [session(working())],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** Closed: a small "Have a code?" link under the button (FE-586). */
export const Closed: Story = {}

/**
 * The link opens the field with focus in it; Apply shows what the code gives,
 * that it starts after the free trial, and Remove.
 */
export const Applied: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Have a code?' }))
    const field = canvas.getByLabelText('Promo code')
    await expect(field).toHaveFocus()
    await userEvent.type(field, 'launch50')
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await expect(
      await canvas.findByText('LAUNCH50: 50% off for 3 months'),
    ).toBeVisible()
    await expect(
      canvas.getByText('Starts after your free trial.'),
    ).toBeVisible()
    await userEvent.click(
      canvas.getByRole('button', { name: 'Remove LAUNCH50' }),
    )
    await expect(canvas.getByLabelText('Promo code')).toBeVisible()
  },
}

/** An amount off, with no trial: no trial line. */
export const AmountNoTrial: Story = {
  decorators: [
    session(
      working({
        code: 'WELCOME5',
        percentOff: null,
        amountOff: 500,
        currency: 'gbp',
        duration: 'ONCE',
        durationInMonths: null,
        startsAfterTrial: false,
      }),
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Have a code?' }))
    await userEvent.type(canvas.getByLabelText('Promo code'), 'WELCOME5{Enter}')
    await expect(
      await canvas.findByText('WELCOME5: £5 off your first month'),
    ).toBeVisible()
    await expect(canvas.queryByText('Starts after your free trial.')).toBeNull()
  },
}

/** A code that can't be used says why under the field. */
export const NotFound: Story = {
  decorators: [
    session(working({ valid: false, problem: 'NOT_FOUND', percentOff: null })),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Have a code?' }))
    await userEvent.type(canvas.getByLabelText('Promo code'), 'NOPE')
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await expect(
      await canvas.findByText(
        "We couldn't find that code. Check it and try again.",
      ),
    ).toBeVisible()
    await expect(canvas.getByLabelText('Promo code')).toHaveAttribute(
      'aria-invalid',
      'true',
    )
  },
}

/** Ten checks in 15 minutes: wait a few minutes. */
export const TooManyTries: Story = {
  decorators: [
    session({ kind: 'graphqlError', code: 'PROMO_CODE_RATE_LIMITED' }),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: 'Have a code?' }))
    await userEvent.type(canvas.getByLabelText('Promo code'), 'LAUNCH50')
    await userEvent.click(canvas.getByRole('button', { name: 'Apply' }))
    await expect(
      await canvas.findByText(
        'Too many tries. Wait a few minutes and try again.',
      ),
    ).toBeVisible()
  },
}

/** From the start of the card, as on Plan & billing. */
export const StartAligned: Story = { args: { align: 'start' } }

/** zh-HK: the link, and the applied line in Traditional Chinese. */
export const ZhHk: Story = {
  parameters: { nextjs: { navigation: { pathname: '/zh-hk/pricing' } } },
  decorators: [
    (Story) => (
      <LocaleProvider>
        <Story />
      </LocaleProvider>
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button', { name: '有優惠碼？' }))
    await userEvent.type(canvas.getByLabelText('優惠碼'), 'LAUNCH50')
    await userEvent.click(canvas.getByRole('button', { name: '套用' }))
    await expect(
      await canvas.findByText('LAUNCH50：首 3 個月減 50%'),
    ).toBeVisible()
    await expect(canvas.getByText('免費試用結束後開始生效。')).toBeVisible()
  },
}
