'use client'

import { Box, Text } from '@chakra-ui/react'

import { workerSetupHref } from '@/app/(stepflow)/worker/setup/helpers/workerSetupHref'
import { useI11n } from '@/i18n/useI11n'
import { Link } from '@ui'

import type { QuoteBlocker } from '../../helpers/quoteBlocker'
import bag from '../../i11n.json'

const HREF: Record<QuoteBlocker, string> = {
  finishSetup: workerSetupHref('/tasks'),
  fixPayment: '/billing',
  quotesUsed: '/billing',
}

/** "Before you can quote: …" with the one fix; only when something blocks quoting. */
export function MyTasksQuoteBlocker({ blocker }: { blocker: QuoteBlocker }) {
  const t = useI11n(bag).blocker

  return (
    <Box
      px={4}
      py={3}
      borderRadius="lg"
      bg="status.warning.soft"
      color="text.default"
    >
      <Text fontSize="sm">
        <Text as="span" fontWeight={500}>
          {t.lead}
        </Text>{' '}
        {t.reasons[blocker]}{' '}
        <Link href={HREF[blocker]} fontWeight={500} color="text.link">
          {t.actions[blocker]}
        </Link>
      </Text>
    </Box>
  )
}
