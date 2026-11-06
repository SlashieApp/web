import { describe, expect, it } from 'vitest'

import { lightSystem } from './chakraSystem'
import {
  PAGE_CONTAINER_MAX_W_CSS,
  PAGE_GUTTER_X,
  READABLE_COLUMN_MAX_W_CSS,
  STATUS_CARD_MAX_W_CSS,
} from './pageContainer'

describe('page measures', () => {
  it('has the sizes the layout rules name', () => {
    expect(PAGE_CONTAINER_MAX_W_CSS).toBe('80rem')
    // R3: the readable column is 720px.
    expect(READABLE_COLUMN_MAX_W_CSS).toBe('45rem')
    // R6: one card width, 448px, the auth card and the status card both.
    expect(STATUS_CARD_MAX_W_CSS).toBe('28rem')
  })

  it('registers them as size tokens, so maxW="pageColumn" and "statusCard" resolve', () => {
    expect(lightSystem.token('sizes.page')).toBe(PAGE_CONTAINER_MAX_W_CSS)
    expect(lightSystem.token('sizes.pageColumn')).toBe(
      READABLE_COLUMN_MAX_W_CSS,
    )
    expect(lightSystem.token('sizes.statusCard')).toBe(STATUS_CARD_MAX_W_CSS)
  })
})
