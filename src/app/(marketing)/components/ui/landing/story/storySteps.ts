import type { StoryCopy } from '../phone/phoneCopy'
import type { StoryStage } from './storyState'

/**
 * The how-it-works steps, in reading order: the customer act, then the worker
 * act. The rows, the section index and the phone all work from these lists, so
 * a step is added in one place.
 */
export const CUSTOMER_STAGES = [
  'post',
  'quotes',
  'chat',
  'hire',
  'review',
] as const satisfies readonly StoryStage[]

export const WORKER_STAGES = [
  'workerFind',
  'workerQuote',
  'workerProfile',
] as const satisfies readonly StoryStage[]

export type CustomerStage = (typeof CUSTOMER_STAGES)[number]
export type WorkerStage = (typeof WORKER_STAGES)[number]

/** The id of a step's row: where the section index links to. */
export function stepDomId(stage: StoryStage): string {
  return `how-it-works-${stage}`
}

export type StoryIndexItem = {
  stage: StoryStage
  label: string
  href: string
}

/**
 * The section index's links, one list per act (the customer's, then the
 * worker's), each named by `landing.story.index`.
 */
export function buildIndexGroups(
  index: StoryCopy['index'],
): StoryIndexItem[][] {
  const toItems = (stages: readonly (CustomerStage | WorkerStage)[]) =>
    stages.map((stage) => ({
      stage,
      label: index[stage],
      href: `#${stepDomId(stage)}`,
    }))
  return [toItems(CUSTOMER_STAGES), toItems(WORKER_STAGES)]
}
