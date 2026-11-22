import { TaskPaymentMethod } from '@codegen/schema'
import { describe, expect, it } from 'vitest'

import bag from './i11n.json'
import {
  TASK_PAYMENT_METHODS,
  orderedPaymentMethods,
  paymentMethodLabels,
  paymentMethodsLine,
  taskPaymentMethods,
  togglePaymentMethod,
} from './taskPayment'

const { Cash, BankTransfer, Card } = TaskPaymentMethod

describe('the payment methods a poster accepts (FE-599)', () => {
  it('offers Cash, Bank transfer and Pay by card, in that order', () => {
    expect(TASK_PAYMENT_METHODS).toEqual([Cash, BankTransfer, Card])
    expect(TASK_PAYMENT_METHODS.map((m) => bag.en.method[m])).toEqual([
      'Cash',
      'Bank transfer',
      'Pay by card',
    ])
  })

  it('has the same methods in both languages', () => {
    expect(Object.keys(bag.zh_hk.method)).toEqual(Object.keys(bag.en.method))
    for (const method of TASK_PAYMENT_METHODS) {
      expect(bag.zh_hk.method[method]).toBeTruthy()
    }
  })

  it('never says Slashie takes the payment', () => {
    const copy = JSON.stringify(bag)
    expect(copy).not.toMatch(/slashie/i)
    expect(copy).not.toMatch(/stripe|checkout|fee|commission/i)
  })

  it('keeps known methods once each, in the shown order', () => {
    expect(orderedPaymentMethods([Card, Cash, Card])).toEqual([Cash, Card])
    expect(orderedPaymentMethods(['card', ' cash '])).toEqual([Cash, Card])
    expect(orderedPaymentMethods(['BITCOIN', null, undefined])).toEqual([])
    expect(orderedPaymentMethods(null)).toEqual([])
  })

  it('reads the list, else the one method an older reply carries', () => {
    expect(
      taskPaymentMethods({ paymentMethods: [Card, BankTransfer] }),
    ).toEqual([BankTransfer, Card])
    expect(
      taskPaymentMethods({ paymentMethods: [], paymentMethod: Cash }),
    ).toEqual([Cash])
    expect(taskPaymentMethods({ paymentMethod: BankTransfer })).toEqual([
      BankTransfer,
    ])
    // The list wins: the single field is only the first of Cash and Bank transfer.
    expect(
      taskPaymentMethods({ paymentMethods: [Cash, Card], paymentMethod: Cash }),
    ).toEqual([Cash, Card])
    expect(taskPaymentMethods(null)).toEqual([])
    expect(taskPaymentMethods({})).toEqual([])
  })

  it('a tap adds a method or takes it off, and may leave none', () => {
    expect(togglePaymentMethod([Cash], Card)).toEqual([Cash, Card])
    expect(togglePaymentMethod([Card], Cash)).toEqual([Cash, Card])
    expect(togglePaymentMethod([Cash, Card], Cash)).toEqual([Card])
    expect(togglePaymentMethod([Cash], Cash)).toEqual([])
  })

  it("shows every method, in the reader's language", () => {
    const all = { paymentMethods: [Cash, BankTransfer, Card] }
    expect(paymentMethodLabels(all, bag.en)).toEqual([
      'Cash',
      'Bank transfer',
      'Pay by card',
    ])
    expect(paymentMethodsLine(all, bag.en)).toBe(
      'Cash, Bank transfer, Pay by card',
    )
    expect(paymentMethodsLine(all, bag.zh_hk)).toBe('現金、銀行轉帳、刷卡付款')
    expect(paymentMethodsLine({ paymentMethod: Cash }, bag.en)).toBe('Cash')
    expect(paymentMethodsLine({}, bag.en)).toBeNull()
  })
})
