import { InMemoryCache } from '@apollo/client/core'
import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'
import { within } from 'storybook/test'

import {
  createStoryApolloClient,
  withStoryApollo,
} from '@/app/(stepflow)/stepflowStoryHelpers'

import {
  type CreateTaskFormFieldValues,
  createTaskFormSchema,
} from '../createTaskFormSchema'
import PopularTaskCategories from '../graphql/PopularTaskCategories.gql'

/** The form as the page starts it: nothing typed yet. */
export const emptyCreateTaskValues: CreateTaskFormFieldValues = {
  title: '',
  categories: [],
  description: '',
  streetAddress: '',
  mapPlaceName: '',
  locationLat: '',
  locationLng: '',
  datetimeType: TaskDateTimeType.Flexible,
  preferredDate: '',
  preferredTime: '',
  budgetMajor: '',
  budgetCurrency: Currency.Gbp,
  budgetType: TaskBudgetType.OneOff,
  paymentMethod: TaskPaymentMethod.Cash,
  preferredContactMethod: TaskContactMethod.InApp,
  acceptedProhibitedUse: false,
}

/** First message per field from the real schema, as the form shows it. */
export function createTaskStoryErrors(
  values: Partial<CreateTaskFormFieldValues> = {},
): Record<string, string> {
  const result = createTaskFormSchema.safeParse({
    ...emptyCreateTaskValues,
    ...values,
  })
  const errors: Record<string, string> = {}
  if (result.success) return errors
  for (const issue of result.error.issues) {
    const key = issue.path[0]
    if (typeof key === 'string' && !(key in errors)) errors[key] = issue.message
  }
  return errors
}

export const STORY_POPULAR_CATEGORIES = [
  'Plumbing',
  'Dog walking',
  'Flat-pack assembly',
  'Gutter cleaning',
  'Garden clearance',
]

/**
 * Story-only Apollo client with the popular-categories query answered from
 * its cache, so the category suggestions never touch the live API.
 */
export function withPopularCategories(
  categories: string[] = STORY_POPULAR_CATEGORIES,
) {
  const cache = new InMemoryCache()
  cache.writeQuery({
    query: PopularTaskCategories,
    variables: { first: 12 },
    data: { popularTaskCategories: categories },
  })
  return withStoryApollo(createStoryApolloClient({ cache }))
}

/**
 * Phones the location card is checked on (FE-349, FE-352). Pass as
 * `parameters.viewport.options`, then pick one with `globals.viewport`.
 */
export const CREATE_TASK_PHONE_VIEWPORTS = {
  iphoneSe1: {
    name: 'iPhone SE (1st gen)',
    styles: { width: '320px', height: '568px' },
    type: 'mobile',
  },
  iphoneSe2: {
    name: 'iPhone SE (2nd and 3rd gen)',
    styles: { width: '375px', height: '667px' },
    type: 'mobile',
  },
  iphone15: {
    name: 'iPhone 15',
    styles: { width: '393px', height: '852px' },
    type: 'mobile',
  },
} as const

/**
 * The map that shows above the location step's card, in px: from the top of
 * the page's `main` to the card's top edge, once the card has stopped
 * moving. The card is the box holding the step's heading and its Continue
 * (`continueName`, for another language).
 */
export async function storyVisibleMapHeight(
  canvasElement: HTMLElement,
  continueName: RegExp = /Continue/,
): Promise<number> {
  const canvas = within(canvasElement)
  const main = canvasElement.querySelector('main')
  if (!main) throw new Error('No main')
  const next = canvas.getByRole('button', { name: continueName })
  let card = canvas.getByRole('heading', { level: 1 }).parentElement
  while (card && !card.contains(next)) card = card.parentElement
  if (!card) throw new Error('No location card')
  const found = card
  const measure = () =>
    Math.round(
      found.getBoundingClientRect().top - main.getBoundingClientRect().top,
    )
  // Same reading three times running, 300 ms apart: the card has settled.
  let readings = [measure()]
  while (readings.length < 3 || new Set(readings.slice(-3)).size > 1) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    readings = [...readings, measure()]
    if (readings.length > 20) throw new Error('The card never settled')
  }
  return readings[readings.length - 1] ?? 0
}
