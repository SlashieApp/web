import type { CreateTaskViewConfig } from './types'

/**
 * "Do you have a budget in mind?" first (Ryan 22 Nov): Set a budget (the
 * amount, then what it's for) or Open budget, then the payment methods the
 * poster accepts.
 */
export const createBudget: CreateTaskViewConfig = {
  layout: 'step',
  step: 'budget',
  map: 'desktopBand',
  sections: ['budget'],
  fields: [
    'budgetMajor',
    'budgetUnit',
    'budgetAnswered',
    'openBudget',
    'budgetCurrency',
    'paymentMethods',
  ],
  primary: 'continue',
}
