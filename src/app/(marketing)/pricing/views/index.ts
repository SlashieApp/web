import { checkingSession } from './checkingSession'
import { customer } from './customer'
import { guest } from './guest'
import type { PricingView, PricingViewConfig } from './types'
import { unavailable } from './unavailable'
import { workerBilling } from './workerBilling'
import { workerCancelling } from './workerCancelling'
import { workerFree } from './workerFree'
import { workerGiven } from './workerGiven'
import { workerGivenUntil } from './workerGivenUntil'
import { workerIncomplete } from './workerIncomplete'
import { workerLapsed } from './workerLapsed'
import { workerPaused } from './workerPaused'
import { workerPaymentProblem } from './workerPaymentProblem'
import { workerSetup } from './workerSetup'
import { workerTrialing } from './workerTrialing'
import { workerUnlimited } from './workerUnlimited'

export const PRICING_VIEWS: Record<PricingView, PricingViewConfig> = {
  unavailable,
  checkingSession,
  guest,
  customer,
  workerSetup,
  workerFree,
  workerLapsed,
  workerTrialing,
  workerUnlimited,
  workerCancelling,
  workerGivenUntil,
  workerGiven,
  workerPaymentProblem,
  workerPaused,
  workerIncomplete,
  workerBilling,
}

export { getPricingView } from './getPricingView'
export type { PricingViewInput } from './getPricingView'
export type {
  PricingAction,
  PricingActionLabel,
  PricingPaidLine,
  PricingView,
  PricingViewConfig,
} from './types'
