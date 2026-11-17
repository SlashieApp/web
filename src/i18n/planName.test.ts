import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const SRC = join(process.cwd(), 'src')

/** Every copy file and source file under `src` (tests excluded: this one names the old plan). */
const files = readdirSync(SRC, { recursive: true })
  .map(String)
  .filter(
    (path) =>
      /(\.tsx?|i11n\.json|\.md)$/.test(path) &&
      !/\.test\.tsx?$/.test(path) &&
      !path.includes('.codegen'),
  )

/**
 * The paid plan is Slashie Pro (Ryan, 17 Nov 2026; FE-578). Slashie Unlimited was its old
 * name: it must not come back in English or Chinese. "Unlimited quotes" (無限報價) stays,
 * because that's what the plan gives.
 */
describe('the paid plan is called Slashie Pro', () => {
  it('no copy or code says Slashie Unlimited', () => {
    const old = files.filter((file) =>
      readFileSync(join(SRC, file), 'utf8').includes('Slashie Unlimited'),
    )
    expect(old).toEqual([])
  })

  it('the plan is named Slashie Pro in both languages', () => {
    const billing = JSON.parse(
      readFileSync(join(SRC, 'app/(dashboard)/billing/i11n.json'), 'utf8'),
    )
    expect(billing.en.views.titles.unlimited).toBe('Slashie Pro')
    expect(billing.zh_hk.views.titles.unlimited).toBe('Slashie Pro')
    const profile = JSON.parse(
      readFileSync(join(SRC, 'app/(dashboard)/profile/i11n.json'), 'utf8'),
    )
    expect(profile.en.workerForm.title.pro).toBe('Pro')
    expect(profile.zh_hk.workerForm.title.pro).toBe('Pro')
  })
})
