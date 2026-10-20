import type { PublicProfilePageConfig } from './types'

/** Body every worker view shares; views add the viewer's actions. */
export const workerBody = {
  layout: 'profile',
  width: 'wide',
  stats: ['rating', 'jobs', 'experience', 'joined'],
  sections: ['about', 'skills', 'work', 'reviews', 'photos', 'openTasks'],
  keepEmpty: ['reviews'],
  trust: true,
} as const satisfies Partial<PublicProfilePageConfig>

/** Body every customer view shares. */
export const customerBody = {
  layout: 'profile',
  width: 'narrow',
  heroActions: [],
  stats: ['rating', 'hosted', 'openTasks', 'joined'],
  sections: ['openTasks', 'reviews'],
  keepEmpty: ['openTasks', 'reviews'],
  contact: null,
  trust: false,
} as const satisfies Partial<PublicProfilePageConfig>
