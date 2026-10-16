import { activating } from './activating'
import { activationDelayed } from './activationDelayed'
import { cancelling } from './cancelling'
import { customer } from './customer'
import { free } from './free'
import { incomplete } from './incomplete'
import { lapsed } from './lapsed'
import { loading } from './loading'
import { paused } from './paused'
import { paymentProblem } from './paymentProblem'
import { priceUnavailable } from './priceUnavailable'
import { subscribed } from './subscribed'
import { trialing } from './trialing'
import type { BillingView, BillingViewConfig } from './types'
import { workerSetup } from './workerSetup'

export { getBillingView } from './getBillingView'
export type {
  BillingAction,
  BillingBadge,
  BillingBody,
  BillingDate,
  BillingCardTitle,
  BillingPriceLine,
  BillingView,
  BillingViewConfig,
  BillingViewInput,
} from './types'

export const BILLING_VIEWS: Record<BillingView, BillingViewConfig> = {
  customer,
  workerSetup,
  loading,
  priceUnavailable,
  free,
  lapsed,
  trialing,
  subscribed,
  cancelling,
  paymentProblem,
  paused,
  incomplete,
  activating,
  activationDelayed,
}
