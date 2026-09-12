/**
 * Public marketplace quality gate (FE-142).
 *
 * Production (`slashie.app`) must not show fixture / placeholder tasks or thin
 * junk worker profiles. The GraphQL API is the system of record — this module
 * is the web safety net until Apollo seed scripts are gated and leftover rows
 * are purged.
 *
 * Gate: `NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS=true` shows everything (local /
 * Storybook against a fixture-heavy API). Unset or any other value hides
 * fixture-like listings on public surfaces.
 */

/** Known leftover production task ids from the FE-142 readiness report. */
export const KNOWN_PRODUCTION_FIXTURE_TASK_IDS = [
  '6a612fb50c686c175415cad1', // Test from app / Hi
  '6a4943b68a49ac47a59ff109', // starbuck
  '6a7cf04cb46b05fa27122f43', // Test from app / letter salad
  '6a4984068a49ac47a59ff10e', // Help me with myTV mounted
  '6a63c88e0c686c175415cad4', // Hi / I added this from app
] as const

const KNOWN_TASK_ID_SET = new Set<string>(KNOWN_PRODUCTION_FIXTURE_TASK_IDS)

/** Exact titles named in FE-142 plus common placeholder titles. */
const FIXTURE_TITLES = new Set([
  'test from app',
  'help me with mytv mounted',
  'starbuck',
  'hi',
  'hello',
  'test',
  'demo',
  'asdf',
  'foo',
  'bar',
  'lorem',
  'lorem ipsum',
  'xxx',
  'yyy',
  'n/a',
  'na',
  'tbd',
])

const FIXTURE_BODIES = new Set([
  'test',
  'demo',
  'hi',
  'hello',
  'asdf',
  'foo',
  'bar',
  'y',
  'n/a',
  'na',
  'i added this from app',
])

const FIXTURE_TOKENS = new Set([
  'test',
  'demo',
  'asdf',
  'foo',
  'bar',
  'lorem',
  'hi',
  'hello',
  'xxx',
  'yyy',
  'y',
  'n/a',
  'na',
  'tbd',
])

const FIXTURE_POSTER_NAMES = new Set(['slashie admin'])

/** “test”, “test 2”, “test from app”, “test from app 3” — not “Test the boiler”. */
const TITLE_PLACEHOLDER_RE =
  /^(test|demo|asdf|lorem)(\s+from\s+app)?(\s+\d+)?$/i

export type PublicTaskLike = {
  id?: string | null
  title?: string | null
  description?: string | null
  poster?: {
    profile?: { name?: string | null } | null
  } | null
}

export type PublicWorkerLike = {
  id?: string | null
  tagline?: string | null
  bio?: string | null
  skills?: readonly (string | null | undefined)[] | null
  isVerified?: boolean | null
  tasksCompletedCount?: number | null
  user?: {
    id?: string | null
    profile?: { name?: string | null; avatarUrl?: string | null } | null
  } | null
  profile?: { name?: string | null; avatarUrl?: string | null } | null
}

export type FixtureGateEnv = {
  NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS?: string
}

function fixtureFlagFrom(env?: FixtureGateEnv): string | undefined {
  return (env ?? process.env).NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS
}

export function allowFixtureListings(env?: FixtureGateEnv): boolean {
  const raw = fixtureFlagFrom(env)?.trim().toLowerCase()
  return raw === '1' || raw === 'true' || raw === 'yes'
}

function normalizeCopy(value: string | null | undefined): string {
  return (value ?? '').replace(/\s+/g, ' ').trim().toLowerCase()
}

export function isFixtureToken(value: string | null | undefined): boolean {
  return FIXTURE_TOKENS.has(normalizeCopy(value))
}

export function isFixtureLikeTaskTitle(
  title: string | null | undefined,
): boolean {
  const normalized = normalizeCopy(title)
  if (!normalized) return true
  if (FIXTURE_TITLES.has(normalized)) return true
  if (TITLE_PLACEHOLDER_RE.test(normalized)) return true
  return false
}

export function isFixtureLikeTaskBody(
  description: string | null | undefined,
): boolean {
  const normalized = normalizeCopy(description)
  if (!normalized) return false
  if (FIXTURE_BODIES.has(normalized)) return true

  const tokens = normalized.split(' ').filter(Boolean)
  if (tokens.length >= 8) {
    const singleLetter = tokens.filter((token) => token.length === 1).length
    if (singleLetter / tokens.length >= 0.6) return true
  }
  return false
}

function isFixturePosterName(name: string | null | undefined): boolean {
  return FIXTURE_POSTER_NAMES.has(normalizeCopy(name))
}

export function isFixtureLikeTask(task: PublicTaskLike): boolean {
  if (task.id && KNOWN_TASK_ID_SET.has(task.id)) return true
  if (isFixtureLikeTaskTitle(task.title)) return true
  if (isFixtureLikeTaskBody(task.description)) return true
  if (isFixturePosterName(task.poster?.profile?.name)) return true
  return false
}

function workerDisplayName(worker: PublicWorkerLike): string {
  return (
    worker.user?.profile?.name?.trim() || worker.profile?.name?.trim() || ''
  )
}

function isThinDisplayName(name: string): boolean {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return true
  if (parts.length === 1 && parts[0].length <= 2) return true
  if (parts.length >= 2 && parts[parts.length - 1].length === 1) return true
  return isFixtureToken(name)
}

export function isFixtureLikeWorker(worker: PublicWorkerLike): boolean {
  if (worker.isVerified) return false
  if ((worker.tasksCompletedCount ?? 0) > 0) return false

  const skills = (worker.skills ?? [])
    .map((skill) => skill?.trim() ?? '')
    .filter(Boolean)
  const skillsAreJunk =
    skills.length === 0 || skills.every((skill) => isFixtureToken(skill))
  const tagline = worker.tagline?.trim() ?? ''
  const taglineIsJunk =
    tagline.length === 0 ||
    tagline.length < 3 ||
    isFixtureToken(tagline) ||
    isFixtureLikeTaskTitle(tagline)
  const bio = worker.bio?.trim() ?? ''
  const bioIsThin = bio.length < 40

  if (!skillsAreJunk || !taglineIsJunk || !bioIsThin) return false

  return (
    isThinDisplayName(workerDisplayName(worker)) ||
    skills.some((skill) => isFixtureToken(skill)) ||
    isFixtureToken(tagline)
  )
}

export function isPublicMarketplaceTask(
  task: PublicTaskLike,
  env?: FixtureGateEnv,
): boolean {
  if (allowFixtureListings(env)) return true
  return !isFixtureLikeTask(task)
}

export function isPublicMarketplaceWorker(
  worker: PublicWorkerLike,
  env?: FixtureGateEnv,
): boolean {
  if (allowFixtureListings(env)) return true
  return !isFixtureLikeWorker(worker)
}

export function filterPublicMarketplaceTasks<T>(
  tasks: readonly T[],
  env?: FixtureGateEnv,
): T[] {
  if (allowFixtureListings(env)) return [...tasks]
  return tasks.filter((task) => !isFixtureLikeTask(task as PublicTaskLike))
}

export function filterPublicMarketplaceWorkers<T>(
  workers: readonly T[],
  env?: FixtureGateEnv,
): T[] {
  if (allowFixtureListings(env)) return [...workers]
  return workers.filter(
    (worker) => !isFixtureLikeWorker(worker as PublicWorkerLike),
  )
}
