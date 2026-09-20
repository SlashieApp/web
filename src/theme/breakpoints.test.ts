import { describe, expect, it } from 'vitest'

import {
  BREAKPOINT_PX,
  TABLET_MIN_PX,
  TABLET_MQ,
  WEB_MIN_PX,
  WEB_MQ,
  chakraBreakpoints,
} from './breakpoints'

describe('theme breakpoints', () => {
  it('uses Chakra v3 lg (1024px) as the compact-to-web split', () => {
    expect(WEB_MIN_PX).toBe(1024)
    expect(TABLET_MIN_PX).toBe(768)
    expect(WEB_MQ).toBe('(min-width: 1024px)')
    expect(TABLET_MQ).toBe('(min-width: 768px)')
    expect(chakraBreakpoints.lg).toBe('1024px')
    expect(chakraBreakpoints.md).toBe('768px')
    expect(BREAKPOINT_PX.lg).toBe(WEB_MIN_PX)
  })
})
