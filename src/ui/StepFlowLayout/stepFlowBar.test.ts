import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import { formSpace, pinnedBarClearance, pinnedBarHeight } from '@/theme/styles'

import {
  STEP_FLOW_BAR_ATTR,
  STEP_FLOW_BAR_RULE,
  STEP_FLOW_BAR_SCROLL_PADDING,
} from './stepFlowBar'

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

describe('the pinned bar and keyboard focus (WCAG 2.4.11)', () => {
  it('the bar is a form control tall button and 16 below it; focus stops 20 above it', () => {
    expect(pinnedBarHeight).toBe(64)
    expect(pinnedBarClearance).toBe(pinnedBarHeight + formSpace.bodyToAction)
    expect(pinnedBarClearance).toBe(84)
  })

  it('globals.css gives <html> the bar, the 20 above it, the inset and the cookie banner', () => {
    expect(STEP_FLOW_BAR_SCROLL_PADDING).toBe(
      'calc(var(--cookie-banner-height, -16px) + 16px + 84px + env(safe-area-inset-bottom, 0px))',
    )
    const globals = read('src/app/globals.css').replace(/\s+/g, ' ')
    expect(globals).toContain(`html:has([${STEP_FLOW_BAR_ATTR}]) {`)
    expect(globals).toContain(
      'scroll-padding-bottom: calc( var(--cookie-banner-height, -16px) + 16px + 84px + env(safe-area-inset-bottom, 0px) );',
    )
    expect(STEP_FLOW_BAR_RULE).toContain(STEP_FLOW_BAR_SCROLL_PADDING)
  })

  it('a pinned StepFlowActions carries the attribute, a static one does not', () => {
    const layout = read('src/ui/StepFlowLayout/StepFlowLayout.tsx')
    expect(layout).toContain(
      "{...(sticky ? { [STEP_FLOW_BAR_ATTR]: '' } : {})}",
    )
  })
})
