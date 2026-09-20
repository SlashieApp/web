import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { PAGE_CONTAINER_MAX_W, PAGE_GUTTER_X } from '@/theme/pageContainer'

const dir = dirname(fileURLToPath(import.meta.url))

describe('StepFlow header width', () => {
  it('aligns create-task and worker-setup headers to the page container', () => {
    const createSrc = readFileSync(join(dir, 'CreateTaskHeader.tsx'), 'utf8')
    const setupSrc = readFileSync(
      join(
        dir,
        '../../../../../worker/setup/components/ui/shared/WorkerSetupHeader.tsx',
      ),
      'utf8',
    )
    expect(PAGE_CONTAINER_MAX_W).toBe('page')
    expect(PAGE_GUTTER_X.lg).toBe(8)
    for (const src of [createSrc, setupSrc]) {
      expect(src).toContain('PAGE_CONTAINER_MAX_W')
      expect(src).toContain('PAGE_GUTTER_X')
    }
  })
})
