import type { WorkerContactAction } from '@codegen/schema'

/** Who is looking and what the profile is (README.md). */
export type PublicProfileViewName =
  | 'loading'
  | 'loadError'
  | 'unavailable'
  | 'worker.guest'
  | 'worker.visitor'
  | 'worker.quoted'
  | 'worker.booked'
  | 'worker.owner'
  | 'worker.ownerHidden'
  | 'customer.visitor'
  | 'customer.owner'
  | 'customer.ownerHidden'

export type PublicProfileViewInput = {
  /** The PublicProfile query, before any data is cached. */
  query: 'loading' | 'error' | 'ready'
  /**
   * Null when the API has no public profile for this id (a private profile
   * is null for everyone but its owner).
   */
  profile: {
    isSelf: boolean
    /** Private profile: the owner's preview of it. */
    isHidden: boolean
    isWorker: boolean
    /** `worker.viewer` contact state; null when signed out or a customer. */
    contact: {
      action: WorkerContactAction
      relatedTaskId: string | null
    } | null
  } | null
}

/** Main-column blocks. */
export type PublicProfileSection =
  | 'about'
  | 'skills'
  | 'work'
  | 'reviews'
  | 'photos'
  | 'openTasks'

/** Cells in the hero's stats strip. */
export type PublicProfileStat =
  | 'rating'
  | 'jobs'
  | 'hosted'
  | 'experience'
  | 'openTasks'
  | 'joined'

/** What the main button does. Copy under `contact.actions`. */
export type PublicProfileContactAction =
  | 'signIn'
  | 'postTask'
  | 'viewQuote'
  | 'openJob'

/** The line above the main button. Copy under `contact.helpers`. */
export type PublicProfileContactHelper = 'locked' | 'quoted' | 'booked'

/** Loading: a skeleton in the page's shape. */
export type PublicProfileSkeletonConfig = { layout: 'skeleton' }

/** A message and one action instead of a profile. */
export type PublicProfileStatusConfig = {
  layout: 'status'
  /** Copy under `status.<copy>`. */
  copy: 'error' | 'unavailable'
  /** Copy under `status.actions`. */
  action: 'retry' | 'search'
}

export type PublicProfilePageConfig = {
  layout: 'profile'
  /** Two columns with the contact sidebar, or one 720px column. */
  width: 'wide' | 'narrow'
  /**
   * Above the hero: `public` says "This is how others see you."; `hidden`
   * says only you can see it, with a link to the visibility switch.
   */
  ownerBar: 'public' | 'hidden' | null
  /** Hero buttons. `review` shows only when the viewer can review. */
  heroActions: readonly ('save' | 'review')[]
  /** Report in the hero's ⋯ menu. */
  report: boolean
  /** Stats strip cells; a cell without a value is left out. */
  stats: readonly PublicProfileStat[]
  sections: readonly PublicProfileSection[]
  /** Sections that keep an empty state; the rest are left out when empty. */
  keepEmpty: readonly PublicProfileSection[]
  /** Sidebar card and phone bar; null hides both. */
  contact: {
    action: PublicProfileContactAction
    helper: PublicProfileContactHelper
  } | null
  /** Contact checks card. */
  trust: boolean
  /** Owner-only Your activity block. */
  activity: boolean
}

export type PublicProfileViewConfig =
  | PublicProfileSkeletonConfig
  | PublicProfileStatusConfig
  | PublicProfilePageConfig
