/**
 * Runtime GraphQL enums for Storybook when `.codegen/schema.ts` is absent.
 * Regenerate: `bun run codegen && node scripts/extract-schema-enums.mjs`
 */

export enum Currency {
  Gbp = 'GBP',
  Usd = 'USD',
}
export enum LoginMethod {
  Apple = 'APPLE',
  Google = 'GOOGLE',
  Password = 'PASSWORD',
}
export enum NotificationType {
  OrderClosed = 'ORDER_CLOSED',
  OrderWorkCompleted = 'ORDER_WORK_COMPLETED',
  QuoteAccepted = 'QUOTE_ACCEPTED',
  QuoteDeclined = 'QUOTE_DECLINED',
  QuoteReceived = 'QUOTE_RECEIVED',
  TaskCompleted = 'TASK_COMPLETED',
  TaskConfirmed = 'TASK_CONFIRMED',
}
export enum OrderPartyRole {
  Customer = 'CUSTOMER',
  Worker = 'WORKER',
}
export enum OrderStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Closed = 'CLOSED',
  PaymentAcknowledged = 'PAYMENT_ACKNOWLEDGED',
  WorkCompleted = 'WORK_COMPLETED',
}
export enum QuoteStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Withdrawn = 'WITHDRAWN',
}
export enum SortDirection {
  Asc = 'ASC',
  Desc = 'DESC',
}
export enum TaskBudgetType {
  OneOff = 'ONE_OFF',
  PerDay = 'PER_DAY',
  PerHour = 'PER_HOUR',
}
export enum TaskContactMethod {
  /** Share the email from the poster's profile. */
  Email = 'EMAIL',
  /** Keep communication inside the app only. */
  InApp = 'IN_APP',
  /** Share the phone number from the poster's profile. */
  Phone = 'PHONE',
}
export enum TaskDateTimeType {
  Before = 'BEFORE',
  Exact = 'EXACT',
  Flexible = 'FLEXIBLE',
}
export enum TaskPaymentMethod {
  /** Payment by bank transfer. */
  BankTransfer = 'BANK_TRANSFER',
  /** Cash payment on completion or as agreed. */
  Cash = 'CASH',
}
export enum TaskSortField {
  /** Sort by task creation time. */
  CreatedAt = 'CREATED_AT',
  /**
   * Sort by distance from the map center. Valid on `tasks` only, and only when `filter.lat` and
   * `filter.lng` are provided; rejected on other queries or without coordinates.
   */
  Distance = 'DISTANCE',
  /** Sort by the task's scheduled date/time; tasks without a schedulable date sort last. */
  ScheduledAt = 'SCHEDULED_AT',
  /** Sort alphabetically by title (case-insensitive). */
  Title = 'TITLE',
}
export enum TaskStatus {
  /** A worker has been chosen. */
  Awarded = 'AWARDED',
  /** Task cancelled. */
  Cancelled = 'CANCELLED',
  /** Work finished pending confirmation. */
  Completed = 'COMPLETED',
  /** Customer confirmed completion. */
  Confirmed = 'CONFIRMED',
  /** Draft task not yet visible. */
  Draft = 'DRAFT',
  /** Work is underway. */
  InProgress = 'IN_PROGRESS',
  /** Open for worker quotes. */
  Open = 'OPEN',
  /** A quote has been accepted. */
  QuoteAccepted = 'QUOTE_ACCEPTED',
}
export enum WorkerSortField {
  /** Sort by distance from `filter.lat` / `filter.lng`. Requires a geo center; otherwise falls back to name order. */
  Distance = 'DISTANCE',
  /** Sort alphabetically by display name (legal name, then linked user profile name). */
  Name = 'NAME',
  /** Sort by average rating (Stage 3 — no-op until reviews exist; falls back to name order). */
  Rating = 'RATING',
  /** Sort by completed task count. */
  TasksCompleted = 'TASKS_COMPLETED',
}
export enum WorkerSubscriptionStatus {
  /** Stripe `active` — paying subscriber with unlimited quotes. */
  Active = 'ACTIVE',
  /** Stripe `canceled` — subscription ended; free tier applies. */
  Canceled = 'CANCELED',
  /** Stripe `incomplete` — Checkout started but not completed. */
  Incomplete = 'INCOMPLETE',
  /** Stripe `incomplete_expired` — Checkout session expired. */
  IncompleteExpired = 'INCOMPLETE_EXPIRED',
  /** No live subscription — free tier quote limits apply. */
  None = 'NONE',
  /** Stripe `past_due` — payment failed; quotes blocked until resolved. */
  PastDue = 'PAST_DUE',
  /** Stripe `paused` — subscription paused (if enabled on account). */
  Paused = 'PAUSED',
  /** Stripe `trialing` — unlimited quotes during trial. */
  Trialing = 'TRIALING',
  /** Stripe `unpaid` — invoice unpaid; quotes blocked. */
  Unpaid = 'UNPAID',
}
