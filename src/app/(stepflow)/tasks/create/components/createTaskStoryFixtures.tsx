import { InMemoryCache } from '@apollo/client/core'
import {
  Currency,
  TaskBudgetType,
  TaskContactMethod,
  TaskDateTimeType,
  TaskPaymentMethod,
} from '@codegen/schema'

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
