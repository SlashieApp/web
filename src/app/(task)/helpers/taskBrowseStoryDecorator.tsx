'use client'

import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  type Reference,
} from '@apollo/client/core'
import { ApolloProvider } from '@apollo/client/react'
import { Observable } from '@apollo/client/utilities'
import type { Decorator } from '@storybook/nextjs-vite'
import { type ReactNode, useEffect, useRef, useState } from 'react'

import type { TaskListItem } from '@/graphql/tasks-query.types'

import {
  type TaskBrowseInitialState,
  TaskBrowseProvider,
  useTaskBrowseData,
  useTaskBrowseLayout,
} from '../context/TaskBrowseProvider'
import {
  type BrowseDateFilter,
  browseDatePresetRange,
} from './taskBrowseHelpers'
import { storyBrowseTasks } from './taskBrowseStoryFixtures'

/**
 * What the discovery `Tasks` query does in a story:
 * - `ready` answers with the tasks (a page after the first answers empty).
 * - `loading` never answers: skeletons.
 * - `error` fails every request.
 * - `refreshing` answers once, then a filter change leaves the next request
 *   pending: the old results stay with the progress bar.
 * - `loadingMore` answers the first page; asking for the next one never answers.
 */
export type TaskBrowseStoryQuery =
  | 'ready'
  | 'loading'
  | 'error'
  | 'refreshing'
  | 'loadingMore'

export type TaskBrowseStoryConfig = {
  /** Tasks the query answers with. Default `storyBrowseTasks`. */
  tasks?: readonly TaskListItem[]
  query?: TaskBrowseStoryQuery
  /** Desktop split (map offset) or compact. Default desktop. */
  isDesktop?: boolean
  /** Deep-link state hydrated at mount (a shared /search URL). */
  initialState?: TaskBrowseInitialState
  /** Highlighted task once results are in (map pin and list or carousel card). */
  selectedTaskId?: string
  /** Date filter applied at mount. */
  dateFilter?: BrowseDateFilter
  /** Budget filter applied at mount (whole pounds, typed as strings). */
  budget?: { min?: string; max?: string }
  /** The phone search sheet starts open. */
  sheetOpen?: boolean
  /** The map's floating "Search this area" button is showing. */
  searchThisArea?: boolean
  /**
   * Blank the Mapbox token while the story is mounted. A shared link's place
   * name is looked up from Mapbox when a token exists, so a story that wants
   * the unresolved "Shared area" label needs this.
   */
  withoutMapToken?: boolean
}

type TaskBrowseQueryConfig = Pick<TaskBrowseStoryConfig, 'tasks' | 'query'>

/** A request that never answers: the story stays in that state. */
function pending() {
  return new Observable<ApolloLink.Result>(() => {})
}

function answer(data: ApolloLink.Result['data']) {
  return new Observable<ApolloLink.Result>((subscriber) => {
    subscriber.next({ data })
    subscriber.complete()
  })
}

/** `Tasks` cache shape: the fixture plus the typenames the cache needs. */
function tasksQueryData(tasks: readonly TaskListItem[]) {
  return {
    tasks: tasks.map((task) => ({
      __typename: 'Task' as const,
      id: task.id,
      title: task.title,
      description: task.description,
      categories: task.categories,
      budget: task.budget ? { __typename: 'TaskBudget', ...task.budget } : null,
      datetime: task.datetime
        ? { __typename: 'TaskDateTime', ...task.datetime }
        : null,
      images: task.images ?? [],
      status: task.status,
      views: task.views ?? 0,
      location: {
        __typename: 'TaskLocation',
        lat: task.location?.lat ?? null,
        lng: task.location?.lng ?? null,
        name: task.location?.name ?? null,
        address: task.location?.address ?? null,
      },
      poster: task.poster
        ? {
            __typename: 'User',
            id: task.poster.id,
            hostedCompletedCount: task.poster.hostedCompletedCount ?? 0,
            profile: {
              __typename: 'Profile',
              name: task.poster.profile?.name ?? null,
              avatarUrl: task.poster.profile?.avatarUrl ?? null,
            },
          }
        : null,
    })),
  }
}

/**
 * Story-only Apollo client. Nothing is forwarded: the `Tasks` query is
 * answered from the fixtures (or left pending) and every other operation
 * hangs, so no story can reach the API (`.env` points at production). The
 * cache mirrors the app's `tasks` list policy so "Load more" appends.
 */
function createTaskBrowseStoryClient({
  tasks = storyBrowseTasks,
  query = 'ready',
}: TaskBrowseQueryConfig) {
  let answered = 0
  const link = new ApolloLink((operation) => {
    if (operation.operationName !== 'Tasks') return pending()
    if (query === 'loading') return pending()
    if (query === 'error') {
      return new Observable<ApolloLink.Result>((subscriber) => {
        subscriber.error(new Error('Failed to fetch'))
      })
    }
    const nextPage = Boolean(operation.variables.after)
    if (nextPage) {
      return query === 'loadingMore' ? pending() : answer(tasksQueryData([]))
    }
    if (query === 'refreshing' && answered > 0) return pending()
    answered += 1
    return answer(tasksQueryData(tasks))
  })

  return new ApolloClient({
    link,
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            tasks: {
              keyArgs: ['filter', 'sort'],
              merge(
                existing: readonly Reference[] | undefined,
                incoming: readonly Reference[],
                { args, readField },
              ) {
                if (!args?.after || !existing) return incoming
                const seen = new Set(
                  existing.map((ref) => readField('id', ref)),
                )
                return [
                  ...existing,
                  ...incoming.filter((ref) => !seen.has(readField('id', ref))),
                ]
              },
            },
          },
        },
        Profile: { merge: true },
      },
    }),
  })
}

/** The "Today / This week" change that leaves a new request pending. */
const REFRESH_FILTER = browseDatePresetRange('week')

/**
 * Drives the real provider the way a visitor would, once, so the story can
 * open on a specific state. There is no map in a story, so it also tells the
 * provider the map is ready (otherwise the query waits for one).
 */
function TaskBrowseStoryScript({ config }: { config: TaskBrowseStoryConfig }) {
  const data = useTaskBrowseData()
  const layout = useTaskBrowseLayout()
  const started = useRef(false)
  const settled = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    data.markMapReadyForQuery(true)
    if (config.dateFilter) data.setDateFilter(config.dateFilter)
    if (config.budget) {
      data.setBudgetMinInput(config.budget.min ?? '')
      data.setBudgetMaxInput(config.budget.max ?? '')
    }
    if (config.sheetOpen) layout.setIsFilterOpen(true)
    if (config.searchThisArea) {
      layout.setSearchThisAreaUi({
        visible: true,
        enabled: true,
        position: 'bottom',
        onClick: () => {},
      })
    }
  }, [config, data, layout])

  useEffect(() => {
    if (settled.current || !data.dataLoaded) return
    settled.current = true
    if (config.selectedTaskId) data.setSelectedTaskId(config.selectedTaskId)
    if (config.query === 'refreshing') data.setDateFilter(REFRESH_FILTER)
  }, [config, data])

  return null
}

/**
 * Blanks the Mapbox token while mounted (put back on unmount), and puts the
 * URL back too: `SearchUrlSync` rewrites it as the search changes. Provider
 * code reads the token as it renders, so this must run before the provider.
 */
function useBlankMapboxToken(blank: boolean) {
  const saved = useRef<{ token: string | undefined; href: string } | null>(null)
  if (blank && !saved.current) {
    saved.current = {
      token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      href: window.location.href,
    }
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = ''
  }

  useEffect(
    () => () => {
      if (!saved.current) return
      const { token, href } = saved.current
      if (token === undefined) {
        Reflect.deleteProperty(process.env, 'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN')
      } else {
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = token
      }
      window.history.replaceState(window.history.state, '', href)
    },
    [],
  )
}

function TaskBrowseStoryRoot({
  config,
  children,
}: {
  config: TaskBrowseStoryConfig
  children: ReactNode
}) {
  useBlankMapboxToken(Boolean(config.withoutMapToken))
  const [client] = useState(() => createTaskBrowseStoryClient(config))

  return (
    <ApolloProvider client={client}>
      <TaskBrowseProvider
        initialTasks={[]}
        isDesktop={config.isDesktop ?? true}
        initialState={config.initialState}
      >
        <TaskBrowseStoryScript config={config} />
        {children}
      </TaskBrowseProvider>
    </ApolloProvider>
  )
}

/**
 * Route context for browse components (`useTaskBrowseData` and
 * `useTaskBrowseLayout`): the real `TaskBrowseProvider` over a story-only
 * Apollo client, so results, filters and selection behave as on /search.
 */
export function withTaskBrowseStory(
  config: TaskBrowseStoryConfig = {},
): Decorator {
  return (Story) => (
    <TaskBrowseStoryRoot config={config}>
      <Story />
    </TaskBrowseStoryRoot>
  )
}

function TaskBrowseQueryRoot({
  config,
  children,
}: {
  config: TaskBrowseQueryConfig
  children: ReactNode
}) {
  useBlankMapboxToken(true)
  const [client] = useState(() => createTaskBrowseStoryClient(config))
  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

/**
 * The same story-only Apollo client, for components that mount their own
 * `TaskBrowseProvider` (`SearchScreen`). Such a provider waits for a map
 * before it queries, and a story has none, so the Mapbox token is blanked
 * while the story is on screen.
 */
export function withTaskBrowseQuery(
  config: TaskBrowseQueryConfig = {},
): Decorator {
  return (Story) => (
    <TaskBrowseQueryRoot config={config}>
      <Story />
    </TaskBrowseQueryRoot>
  )
}

const idleClient = new ApolloClient({
  link: new ApolloLink(() => pending()),
  cache: new InMemoryCache(),
})

/**
 * For components that hold a mutation (the card's report control) but need no
 * data: every request hangs, so pressing Send in a story cannot reach the API.
 */
export const withIdleApollo: Decorator = (Story) => (
  <ApolloProvider client={idleClient}>
    <Story />
  </ApolloProvider>
)
