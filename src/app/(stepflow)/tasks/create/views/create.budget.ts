import type { CreateTaskViewConfig } from './types'

/** Budget type first, then the amount for that unit, then how you'll pay. */
export const createBudget: CreateTaskViewConfig = {
  layout: 'step',
  step: 'budget',
  map: 'desktopBand',
  sections: ['budget'],
  fields: ['budgetType', 'budgetMajor', 'budgetCurrency', 'paymentMethod'],
  primary: 'continue',
}
