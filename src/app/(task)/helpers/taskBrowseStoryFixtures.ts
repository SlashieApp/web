import {
  Currency,
  TaskBudgetType,
  TaskDateTimeType,
  TaskPaymentMethod,
  TaskStatus,
} from '@codegen/schema'

import type { TaskListItem } from '@/graphql/tasks-query.types'

const STORY_THUMBNAIL =
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=300&h=300&fit=crop'

/** One discovery task (the `Tasks` list shape) with realistic public fields. */
export function storyBrowseTask(
  overrides: Partial<TaskListItem> = {},
): TaskListItem {
  return {
    id: 'browse-task-1',
    title: 'Mount a 55-inch TV on the wall',
    description:
      'Need a worker to mount one TV safely on a plasterboard wall. Bracket supplied.',
    categories: ['TECH_SETUP'],
    status: TaskStatus.Open,
    views: 14,
    createdAt: '2026-10-12T09:00:00.000Z',
    datetime: { type: TaskDateTimeType.Flexible, date: null, time: null },
    budget: {
      amount: 120,
      currency: Currency.Gbp,
      type: TaskBudgetType.OneOff,
      paymentMethod: TaskPaymentMethod.Cash,
    },
    images: [STORY_THUMBNAIL],
    location: { lat: 51.5035, lng: -0.0948, name: 'Southwark', address: null },
    poster: {
      id: 'poster-1',
      hostedCompletedCount: 4,
      profile: { name: 'Alex Chen', avatarUrl: null },
    },
    ...overrides,
  }
}

/** A handful of different tasks: budget kinds, timing, photo or none. */
export const storyBrowseTasks: TaskListItem[] = [
  storyBrowseTask(),
  storyBrowseTask({
    id: 'browse-task-2',
    title: 'Deep clean a two-bedroom flat before moving out',
    categories: ['CLEANING'],
    budget: {
      amount: 18,
      currency: Currency.Gbp,
      type: TaskBudgetType.PerHour,
      paymentMethod: TaskPaymentMethod.BankTransfer,
    },
    datetime: {
      type: TaskDateTimeType.Exact,
      date: '2030-06-15',
      time: '10:00',
    },
    location: { lat: 51.539, lng: -0.1426, name: 'Camden', address: null },
  }),
  storyBrowseTask({
    id: 'browse-task-3',
    title: 'Help moving a sofa up two flights of stairs',
    categories: ['MOVING'],
    budget: {
      amount: 60,
      currency: Currency.Gbp,
      type: TaskBudgetType.OneOff,
      paymentMethod: TaskPaymentMethod.Cash,
    },
    datetime: {
      type: TaskDateTimeType.Before,
      date: '2030-06-21',
      time: null,
    },
    images: [],
    location: { lat: 51.545, lng: -0.0553, name: 'Hackney', address: null },
  }),
  storyBrowseTask({
    id: 'browse-task-4',
    title: 'Fix a leaking kitchen tap',
    categories: ['HANDYMAN'],
    budget: null,
    datetime: {
      type: TaskDateTimeType.Exact,
      date: '2030-06-18',
      time: '14:00',
    },
    location: { lat: 51.5362, lng: -0.1033, name: 'Islington', address: null },
  }),
  storyBrowseTask({
    id: 'browse-task-5',
    title: 'Walk two dogs on Saturday morning',
    categories: ['Dog walking'],
    budget: {
      amount: 25,
      currency: Currency.Gbp,
      type: TaskBudgetType.PerHour,
      paymentMethod: TaskPaymentMethod.Cash,
    },
    images: [],
    location: { lat: 51.4613, lng: -0.1384, name: 'Clapham', address: null },
  }),
]

/**
 * A full page of results (the list asks for 100 at a time), so "Load more"
 * shows. Titles repeat with a number; places and prices vary.
 */
export function storyBrowseTaskPage(count = 100): TaskListItem[] {
  return Array.from({ length: count }, (_, index) => {
    const base = storyBrowseTasks[index % storyBrowseTasks.length]
    return {
      ...base,
      id: `browse-page-${index + 1}`,
      title: `${base.title} (${index + 1})`,
    }
  })
}
