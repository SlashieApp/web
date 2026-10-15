import { storyMe, storyWorkerMe } from '@/app/(auth)/helpers/authStoryFixtures'
import type { MeSnapshot } from '@/app/(auth)/store/user'

/**
 * Fictional signed-in user for profile stories (no real data): a customer, or
 * a published worker with a verified phone. Use `storyMe` / `storyWorkerMe`
 * from `(auth)/helpers/authStoryFixtures` to shape other situations.
 */
export function meStoryFixture(worker = false): MeSnapshot {
  return worker ? storyWorkerMe() : storyMe()
}
