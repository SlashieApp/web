import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { APP_OVERLAY_Z_INDEX } from '@/theme/styles'
import { describe, expect, it } from 'vitest'

describe('APP_OVERLAY_Z_INDEX', () => {
  it('stacks above Header (30), mobile dock (40), and dropdowns (50)', () => {
    expect(APP_OVERLAY_Z_INDEX).toBeGreaterThan(50)
    expect(APP_OVERLAY_Z_INDEX).toBe(1400)
  })

  it('is used by Modal and Drawer body portals', () => {
    const modal = readFileSync(
      join(process.cwd(), 'src/ui/Modal/Modal.tsx'),
      'utf8',
    )
    const drawer = readFileSync(
      join(process.cwd(), 'src/ui/Drawer/Drawer.tsx'),
      'utf8',
    )
    expect(modal).toContain('createPortal(overlay, document.body)')
    expect(modal).toContain('APP_OVERLAY_Z_INDEX')
    // The Drawer portals to the page by default; a `container` (the Messages
    // thread's sheet, FE-543) puts it inside that element instead.
    expect(drawer).toContain(
      'createPortal(overlay, container?.current ?? document.body)',
    )
    expect(drawer).toContain('APP_OVERLAY_Z_INDEX')
  })
})
