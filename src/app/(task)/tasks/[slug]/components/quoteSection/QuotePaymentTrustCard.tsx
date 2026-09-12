'use client'

import { SafetyNotice } from '@ui'

/** C2C pay + meet-safely note under the quotes column when no order exists. */
export function QuotePaymentTrustCard() {
  return <SafetyNotice variant="panel" />
}
