import { EVENTS, capture } from '@/utils/analytics'

export type SearchCardImpressionSource = 'list' | 'carousel'

/** Cheap mount-time impression — one event per task id per tracker instance. */
export function captureSearchCardImpression(
  taskId: string,
  source: SearchCardImpressionSource,
): void {
  capture(EVENTS.search_card_impression, {
    task_id: taskId,
    source,
  })
}
