#!/usr/bin/env bun
/**
 * Spot-check a GraphQL marketplace for FE-142 fixture / junk listings.
 *
 *   bun scripts/spot-check-marketplace-listings.ts
 *   bun scripts/spot-check-marketplace-listings.ts --url https://api.slashie.app
 */

import {
  isFixtureLikeTask,
  isFixtureLikeWorker,
} from '../src/utils/marketplaceListingQuality'

type TaskRow = {
  id: string
  title: string
  description: string
  poster?: { profile?: { name?: string | null } | null } | null
}

type WorkerRow = {
  id: string
  tagline?: string | null
  skills?: string[] | null
  isVerified?: boolean | null
  tasksCompletedCount?: number | null
  user?: { profile?: { name?: string | null } | null } | null
}

function readUrl(): string {
  const flagIndex = process.argv.indexOf('--url')
  const fromFlag =
    flagIndex >= 0 ? process.argv[flagIndex + 1]?.trim() : undefined
  const fromEnv = process.env.NEXT_PUBLIC_GRAPHQL_URL?.trim()
  const base = (fromFlag || fromEnv || '').replace(/\/$/, '')
  if (!base) {
    console.error(
      'Pass --url https://api.slashie.app or set NEXT_PUBLIC_GRAPHQL_URL',
    )
    process.exit(2)
  }
  return base.endsWith('/graphql') ? base : `${base}/graphql`
}

async function main() {
  const url = readUrl()
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'apollo-require-preflight': 'true',
    },
    body: JSON.stringify({
      query: `query MarketplaceSpotCheck {
        tasks {
          id
          title
          description
          poster { profile { name } }
        }
        workers {
          id
          tagline
          skills
          isVerified
          tasksCompletedCount
          user { profile { name } }
        }
      }`,
    }),
  })

  if (!response.ok) {
    console.error(`GraphQL HTTP ${response.status} from ${url}`)
    process.exit(2)
  }

  const json = (await response.json()) as {
    data?: { tasks?: TaskRow[]; workers?: WorkerRow[] }
    errors?: unknown
  }
  if (json.errors) {
    console.error('GraphQL errors:', JSON.stringify(json.errors, null, 2))
    process.exit(2)
  }

  const tasks = json.data?.tasks ?? []
  const workers = json.data?.workers ?? []
  const fixtureTasks = tasks.filter((task) => isFixtureLikeTask(task))
  const fixtureWorkers = workers.filter((worker) => isFixtureLikeWorker(worker))

  console.log(`Checked ${url}`)
  console.log(`Tasks: ${tasks.length} (${fixtureTasks.length} fixture-like)`)
  for (const task of fixtureTasks) {
    console.log(
      `  - task ${task.id} “${task.title}” (${task.poster?.profile?.name ?? 'unknown'})`,
    )
  }
  console.log(
    `Workers: ${workers.length} (${fixtureWorkers.length} fixture-like)`,
  )
  for (const worker of fixtureWorkers) {
    console.log(
      `  - worker ${worker.id} “${worker.user?.profile?.name ?? 'unknown'}” skills=${JSON.stringify(worker.skills ?? [])}`,
    )
  }

  if (fixtureTasks.length > 0 || fixtureWorkers.length > 0) {
    console.error(
      '\nAPI still has fixture-like marketplace rows. Web hides them when NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS is unset; purge/cancel on Apollo to clear the database.',
    )
    process.exit(1)
  }

  console.log('No fixture-like tasks or thin junk worker profiles in the API.')
}

void main()
