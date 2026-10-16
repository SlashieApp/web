import type { EditTaskViewConfig } from './types'

/** A worker is booked (or the job is done): the details are locked. */
export const editBooked: EditTaskViewConfig = {
  layout: 'status',
  title: 'bookedTitle',
  body: 'bookedBody',
  actions: ['viewTask'],
}
