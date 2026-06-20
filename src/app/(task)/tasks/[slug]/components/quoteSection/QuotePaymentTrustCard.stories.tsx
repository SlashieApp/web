import { Box } from '@chakra-ui/react'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'

import { QuotePaymentTrustCard } from './QuotePaymentTrustCard'

const meta = {
  title: 'task/QuoteSection/QuotePaymentTrustCard',
  component: QuotePaymentTrustCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  render: () => (
    <Box maxW="400px" w="full">
      <QuotePaymentTrustCard />
    </Box>
  ),
} satisfies Meta<typeof QuotePaymentTrustCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
