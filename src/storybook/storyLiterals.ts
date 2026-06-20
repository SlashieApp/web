/** GraphQL enum string literals for Storybook — no `@codegen/schema` dependency. */
export const StoryOrderStatus = {
  Active: 'ACTIVE',
  WorkCompleted: 'WORK_COMPLETED',
  PaymentAcknowledged: 'PAYMENT_ACKNOWLEDGED',
  Closed: 'CLOSED',
  Cancelled: 'CANCELLED',
} as const

export const StoryQuoteStatus = {
  Pending: 'PENDING',
  Accepted: 'ACCEPTED',
  Declined: 'DECLINED',
} as const

export const StoryTaskStatus = {
  Open: 'OPEN',
  Confirmed: 'CONFIRMED',
  Cancelled: 'CANCELLED',
} as const

export const StoryCurrency = {
  Gbp: 'GBP',
} as const

export const StoryLoginMethod = {
  Password: 'PASSWORD',
} as const

export const StoryTaskContactMethod = {
  Phone: 'PHONE',
  Email: 'EMAIL',
  InApp: 'IN_APP',
} as const

export const StoryWorkerSubscriptionStatus = {
  Active: 'ACTIVE',
  None: 'NONE',
  Trialing: 'TRIALING',
} as const
