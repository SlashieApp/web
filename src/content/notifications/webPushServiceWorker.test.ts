import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('web push service worker', () => {
  const source = readFileSync(resolve(process.cwd(), 'public/sw.js'), 'utf8')

  it('opens the review page for REVIEW_PROMPT clicks', () => {
    expect(source).toContain('REVIEW_PROMPT')
    expect(source).toContain('/review')
    expect(source).toContain('notificationclick')
  })
})
