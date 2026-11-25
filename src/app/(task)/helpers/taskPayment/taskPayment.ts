import { TaskPaymentMethod } from '@codegen/schema'

import bag from './i11n.json'

/**
 * How the poster accepts to pay (FE-599, BE-148; Ryan 22 Nov): one or more of
 * Cash, Bank transfer and Pay by card. The customer pays the worker directly:
 * Slashie never takes, holds or charges the payment, card included. The Expo
 * app's `taskPayment.ts` reads the same.
 */
export const taskPaymentBag = bag
export type TaskPaymentCopy = (typeof bag)['en']

/** Every method, in the order they are always offered and shown. */
export const TASK_PAYMENT_METHODS = [
  TaskPaymentMethod.Cash,
  TaskPaymentMethod.BankTransfer,
  TaskPaymentMethod.Card,
] as const

/** A task or a booking as the queries read it. */
export type PaymentMethodsLike =
  | {
      paymentMethods?: readonly (string | null)[] | null
      /** The one method a task had before it could accept several. */
      paymentMethod?: string | null
    }
  | null
  | undefined

/** The known methods in `values`, once each, in the order they are shown. */
export function orderedPaymentMethods(
  values: readonly (string | null | undefined)[] | null | undefined,
): TaskPaymentMethod[] {
  const picked = new Set(
    (values ?? []).map((value) => value?.trim().toUpperCase() ?? ''),
  )
  return TASK_PAYMENT_METHODS.filter((method) => picked.has(method))
}

/**
 * Every method a task (or a booking) accepts. The list when there is one,
 * else the single method an older reply carries.
 */
export function taskPaymentMethods(
  source: PaymentMethodsLike,
): TaskPaymentMethod[] {
  const list = orderedPaymentMethods(source?.paymentMethods)
  if (list.length > 0) return list
  return orderedPaymentMethods([source?.paymentMethod])
}

/** Tapping a method adds it, or takes it off. The order never changes. */
export function togglePaymentMethod(
  current: readonly TaskPaymentMethod[],
  method: TaskPaymentMethod,
): TaskPaymentMethod[] {
  return current.includes(method)
    ? orderedPaymentMethods(current.filter((value) => value !== method))
    : orderedPaymentMethods([...current, method])
}

/** Each accepted method in the reader's language. */
export function paymentMethodLabels(
  source: PaymentMethodsLike,
  copy: TaskPaymentCopy,
): string[] {
  return taskPaymentMethods(source).map((method) => copy.method[method])
}

/** "Cash, Bank transfer, Pay by card" on one line; null when none is known. */
export function paymentMethodsLine(
  source: PaymentMethodsLike,
  copy: TaskPaymentCopy,
): string | null {
  const labels = paymentMethodLabels(source, copy)
  return labels.length > 0 ? labels.join(copy.separator) : null
}
