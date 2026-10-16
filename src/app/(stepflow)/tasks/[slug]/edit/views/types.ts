import type { TaskStatus } from '@codegen/schema'

import type bag from '../i11n.json'

export type EditTaskViewName =
  | 'edit.signIn'
  | 'edit.loading'
  | 'edit.loadError'
  | 'edit.notFound'
  | 'edit.notOwner'
  | 'edit.booked'
  | 'edit.cancelled'
  | 'edit.open'
  | 'edit.openWithQuotes'

export type EditTaskViewInput = {
  session: 'guest' | 'loading' | 'ready'
  /** The task query, before anything is cached. */
  query: 'loading' | 'error' | 'ready'
  task: { status: TaskStatus; isOwner: boolean; liveQuotes: number } | null
}

type StatusCopy = keyof (typeof bag)['en']['status']

/** What a status screen offers, in order. */
export type EditTaskStatusAction = 'retry' | 'viewTask' | 'myTasks' | 'repost'

export type EditTaskViewConfig =
  | { layout: 'redirect' }
  | { layout: 'splash' }
  | {
      layout: 'status'
      title: StatusCopy
      body: StatusCopy
      actions: readonly EditTaskStatusAction[]
    }
  | {
      layout: 'form'
      /** Workers have quoted: say they won't be told about changes. */
      quotesWarning: boolean
    }
