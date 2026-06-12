import { Box, Heading, Stack, Text } from '@chakra-ui/react'

import { pricingDisplayPrice } from '../helpers/formatPricing'
import type { PricingRecord } from '../helpers/getPricingForPage'

type PricingFaqProps = {
  pricing: PricingRecord
}

type FaqItem = {
  question: string
  answer: string
}

export function PricingFaq({ pricing }: PricingFaqProps) {
  const monthlyPrice = pricingDisplayPrice(pricing)

  const items: FaqItem[] = [
    {
      question: 'What am I paying for?',
      answer:
        'Slashie Unlimited is a platform subscription that lets workers send unlimited quotes on tasks. It is not a fee for completing jobs or receiving customer payments.',
    },
    {
      question: 'Do customers pay Slashie?',
      answer:
        'No. Customers post tasks, compare quotes, and accept a worker for free in the current MVP. Slashie does not charge customers to post or accept quotes.',
    },
    {
      question: 'How do workers get paid for jobs?',
      answer:
        'Payment for the work itself is arranged directly between the customer and worker outside Slashie. Slashie does not hold, process, or release job payments.',
    },
    {
      question: 'What happens after the trial?',
      answer: `After your trial ends, Slashie Unlimited continues at ${monthlyPrice} per month unless you cancel before the trial period ends.`,
    },
    {
      question: 'Can I cancel?',
      answer:
        'Yes. You can cancel your subscription from your worker plan page when billing management is available. Canceling stops future platform charges; it does not affect how you settle payment for completed jobs with customers.',
    },
  ]

  return (
    <Stack gap={4} w="full">
      <Heading size="md">Frequently asked questions</Heading>
      <Stack gap={3}>
        {items.map((item) => (
          <Box
            key={item.question}
            borderWidth="1px"
            borderColor="cardBorder"
            borderRadius="xl"
            bg="cardBg"
            p={{ base: 4, md: 5 }}
          >
            <Stack gap={2}>
              <Text fontWeight={700} color="cardFg">
                {item.question}
              </Text>
              <Text fontSize="sm" color="formLabelMuted" lineHeight="tall">
                {item.answer}
              </Text>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>
  )
}
