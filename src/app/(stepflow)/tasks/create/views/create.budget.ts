import type { CreateTaskViewConfig } from './types'

/** The amount and what it's for, or Skip (an open budget), then how you'll pay. */
export const createBudget: CreateTaskViewConfig = {
  layout: 'step',
  step: 'budget',
  map: 'desktopBand',
  sections: ['budget'],
  fields: [
    'budgetMajor',
    'budgetUnit',
    'openBudget',
    'budgetCurrency',
    'paymentMethod',
  ],
  primary: 'continue',
}
