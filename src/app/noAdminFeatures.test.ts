import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The web app has no staff tools (FE-612, Ryan 24 Nov 2026). They live in the
 * admin panel, a separate repo behind its own sign-in. These fail when a staff
 * page or an `@admin` API call comes back here.
 */
const SRC = join(process.cwd(), 'src')

function walk(dir: string): { dirs: string[]; files: string[] } {
  const dirs: string[] = []
  const files: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      dirs.push(path)
      const inner = walk(path)
      dirs.push(...inner.dirs)
      files.push(...inner.files)
    } else {
      files.push(path)
    }
  }
  return { dirs, files }
}

const tree = walk(SRC)

describe('web has no admin features', () => {
  it('has no admin route or admin content folder', () => {
    const admin = tree.dirs
      .map((dir) => dir.slice(SRC.length))
      .filter((dir) => /\/admin$/i.test(dir))
    expect(admin).toEqual([])
  })

  it('calls no admin field on the API', () => {
    const offenders = tree.files
      .filter((file) => file.endsWith('.gql'))
      .filter((file) => /\badmin[A-Z]/.test(readFileSync(file, 'utf8')))
      .map((file) => file.slice(SRC.length))
    expect(offenders).toEqual([])
  })
})
