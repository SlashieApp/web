import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

const TARGET_PAGE_GLOBS = [
  'src/app/(auth)',
  'src/app/(task)',
  'src/app/(dashboard)',
  'src/app/(worker)',
] as const

const TARGET_PAGES = [
  'src/app/(auth)/forgot-password/page.tsx',
  'src/app/(auth)/forgot-password/sent/page.tsx',
  'src/app/(auth)/login/page.tsx',
  'src/app/(auth)/register/page.tsx',
  'src/app/(auth)/reset-password/page.tsx',
  'src/app/(auth)/verify-email/page.tsx',
  'src/app/(auth)/verify-email/sent/page.tsx',
  'src/app/(dashboard)/account/page.tsx',
  'src/app/(dashboard)/billing/page.tsx',
  'src/app/(dashboard)/dashboard/page.tsx',
  'src/app/(dashboard)/dashboard/orders/[orderId]/page.tsx',
  'src/app/(dashboard)/earnings/page.tsx',
  'src/app/(dashboard)/profile/page.tsx',
  'src/app/(dashboard)/quotes/page.tsx',
  'src/app/(dashboard)/requests/page.tsx',
  'src/app/(task)/search/page.tsx',
  'src/app/(stepflow)/tasks/create/page.tsx',
  'src/app/(task)/tasks/page.tsx',
  'src/app/(task)/tasks/[slug]/edit/page.tsx',
  'src/app/(task)/tasks/[slug]/page.tsx',
  'src/app/(stepflow)/tasks/[slug]/quote/page.tsx',
  'src/app/(worker)/worker/plan/page.tsx',
  'src/app/(stepflow)/worker/setup/page.tsx',
  'src/app/(worker)/workers/[slug]/page.tsx',
] as const

function readJson(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

describe('per-page i11n coverage', () => {
  it('tracks every non-marketing page that requires colocated i11n', () => {
    const root = process.cwd()
    for (const segment of TARGET_PAGE_GLOBS) {
      expect(existsSync(path.join(root, segment))).toBe(true)
    }
    expect(TARGET_PAGES).toHaveLength(24)
  })

  it('requires en and zh_hk metadata beside every target page', () => {
    const root = process.cwd()
    for (const page of TARGET_PAGES) {
      const i11nPath = path.join(root, path.dirname(page), 'i11n.json')
      expect(existsSync(i11nPath), `${page} is missing i11n.json`).toBe(true)

      const bag = readJson(i11nPath) as {
        en?: { metadata?: { title?: string; description?: string } }
        zh_hk?: { metadata?: { title?: string; description?: string } }
      }

      for (const locale of ['en', 'zh_hk'] as const) {
        expect(
          bag[locale]?.metadata?.title,
          `${page} ${locale} metadata.title`,
        ).toEqual(expect.any(String))
        expect(
          bag[locale]?.metadata?.description,
          `${page} ${locale} metadata.description`,
        ).toEqual(expect.any(String))
      }
    }
  })
})
