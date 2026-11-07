import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(dir, 'CreateTaskScreen.tsx'), 'utf8')

describe('Post a task carrying a worker (FE-507)', () => {
  it('reads the worker from the address once, as a validated 24-hex id', () => {
    expect(src).toContain('parseAskWorkerParam(window.location.search)')
    expect(src).toContain('useState(readAskWorkerId)')
  })

  it('opens the new task with the worker carried, and only then', () => {
    expect(src).toContain('taskPathAsking(taskId, askWorkerId)')
    expect(src).toContain('`/tasks/${taskId}`')
  })

  it('never sends the invitation itself', () => {
    expect(src).not.toContain('askWorkerToQuote')
    expect(src).not.toContain('useAskWorkerToQuote')
  })
})
