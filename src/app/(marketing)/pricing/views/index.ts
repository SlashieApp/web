import { checkingSession } from './checkingSession'
import { customer } from './customer'
import { guest } from './guest'
import type { PricingView, PricingViewConfig } from './types'
import { unavailable } from './unavailable'
import { workerBilling } from './workerBilling'
import { workerFree } from './workerFree'
import { workerLapsed } from './workerLapsed'
import { workerSetup } from './workerSetup'
import { workerUnlimited } from './workerUnlimited'

export const PRICING_VIEWS: Record<PricingView, PricingViewConfig> = {
  unavailable,
  checkingSession,
  guest,
  customer,
  workerSetup,
  workerFree,
  workerLapsed,
  workerUnlimited,
  workerBilling,
}

export { getPricingView } from './getPricingView'
export type { PricingViewInput } from './getPricingView'
export type {
  PricingAction,
  PricingActionLabel,
  PricingView,
  PricingViewConfig,
} from './types'
