import type { CreateTaskViewConfig } from './types'

/**
 * "Do you have a budget in mind?" first (Ryan 22 Nov): Set a budget (the
 * amount, then what it's for) or Open budget, then how you'll pay.
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
    'paymentMethod',
  ],
  primary: 'continue',
}
