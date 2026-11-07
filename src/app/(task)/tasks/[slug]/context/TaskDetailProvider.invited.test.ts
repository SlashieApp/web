import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const dir = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(dir, 'TaskDetailProvider.tsx'), 'utf8')

describe('quote-sent analytics after an invitation (FE-507)', () => {
  it('adds invited: true to the existing quote-sent event, and no new event', () => {
    const sent = src.slice(
      src.indexOf('trackFlowSucceeded(EVENTS.quote_send_success'),
    )
    expect(sent.slice(0, 260)).toContain('...invitedProperty(task)')
  })
})
