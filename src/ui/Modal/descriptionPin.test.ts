import { describe, expect, it } from 'vitest'

import { formSpace } from '@/theme/styles'

import {
  type DescriptionPinInput,
  REPIN_MARGIN,
  bareHeaderHeight,
  descriptionFitsPinned,
  dialogScrollsWhole,
  minBodyHeight,
} from './descriptionPin'

/**
 * Where a Modal draws its description (FE-481 overlay-chrome, round 7,
 * R7-web-modal). The numbers are the ones measured in the Modal stories and
 * the same ones the app's Dialog tests (`descriptionPin.test.ts` there): the
 * title block (20 above, the 8 above the title line, the 28 title) is 56 tall,
 * the bar is a 48 button and 16 under it, and the long description of the
 * stories is 455 tall at 390 wide (432 at 414, 478 at 375).
 */
const TITLE_BLOCK = 20 + 8 + 28
const BAR = 48 + 16
/** The panel's maximum height at a window height (the window less the 16 inset each side), less its 2 border. */
const available = (windowHeight: number) => windowHeight - 32 - 2

const pinnedAt = (description: number, windowHeight: number, hasBody = true) =>
  descriptionFitsPinned({
    pinned: true,
    header: TITLE_BLOCK + formSpace.titleToSubtitle + description,
    description,
    footer: BAR,
    minBody: minBodyHeight(hasBody),
    available: available(windowHeight),
  })

describe('the body a description must leave room for', () => {
  it('is the 24 under the header, one 48 field and the 20 above the bar; a sentence-only confirm needs the 24', () => {
    expect(minBodyHeight(true)).toBe(24 + 48 + 20)
    expect(minBodyHeight(false)).toBe(24)
  })
})

describe('a description stays pinned under the title while the panel has room for it', () => {
  it('pins a short description at every height a form fits', () => {
    expect(pinnedAt(23, 844)).toBe(true)
    expect(pinnedAt(23, 568)).toBe(true)
    expect(pinnedAt(23, 375)).toBe(true)
  })

  it('pins a long one (455) on a tall phone and moves it into the body below 709 (the measured line)', () => {
    expect(pinnedAt(455, 844)).toBe(true)
    expect(pinnedAt(455, 709)).toBe(true)
    expect(pinnedAt(455, 708)).toBe(false)
    expect(pinnedAt(455, 700)).toBe(false)
    expect(pinnedAt(455, 560)).toBe(false)
    expect(pinnedAt(455, 345)).toBe(false)
  })

  it('moves a 4 line description (91 in a wide dialog, 137 in a narrow one) into the body on a phone on its side only when it does not fit', () => {
    expect(pinnedAt(91, 375)).toBe(true)
    expect(pinnedAt(137, 375)).toBe(false)
  })

  it('a sentence-only confirm needs room for no field, so it stays pinned where a form moves it', () => {
    expect(pinnedAt(137, 375, true)).toBe(false)
    expect(pinnedAt(137, 375, false)).toBe(true)
    expect(pinnedAt(455, 641, false)).toBe(true)
    expect(pinnedAt(455, 640, false)).toBe(false)
  })

  it('leaves it pinned while nothing is measured', () => {
    expect(
      descriptionFitsPinned({
        pinned: true,
        header: 0,
        description: 0,
        footer: 0,
        minBody: minBodyHeight(true),
        available: Number.POSITIVE_INFINITY,
      }),
    ).toBe(true)
  })
})

describe('once in the body it does not flip back and forth', () => {
  const inBody = (
    description: number,
    windowHeight: number,
  ): DescriptionPinInput => ({
    pinned: false,
    // Moved into the body, the header is the title block alone.
    header: TITLE_BLOCK,
    description,
    footer: BAR,
    minBody: minBodyHeight(true),
    available: available(windowHeight),
  })

  it('gives the same answer from either place, outside the margin: the header with the description is the same number', () => {
    for (const windowHeight of [300, 375, 560, 700, 844]) {
      for (const description of [23, 91, 137, 455]) {
        const fromBody = descriptionFitsPinned(
          inBody(description, windowHeight),
        )
        const fromHeader = pinnedAt(description, windowHeight)
        // Back under the title only with the margin to spare, so the two can
        // differ only on the line.
        if (fromBody) expect(fromHeader).toBe(true)
        const needed =
          TITLE_BLOCK +
          formSpace.titleToSubtitle +
          description +
          BAR +
          minBodyHeight(true)
        if (needed + REPIN_MARGIN < available(windowHeight)) {
          expect(fromBody).toBe(true)
        }
        if (needed > available(windowHeight)) expect(fromBody).toBe(false)
      }
    }
  })

  it('goes back under the title only with the margin (8) to spare', () => {
    // 455 long: it needs 56 + 8 + 455 + 64 + 92 = 675 of room.
    const needed =
      TITLE_BLOCK + formSpace.titleToSubtitle + 455 + BAR + minBodyHeight(true)
    expect(needed).toBe(675)
    expect(REPIN_MARGIN).toBe(formSpace.alternativesGap)
    // Pinned, it stays pinned at 675 on the nose (a 709 tall window); in the
    // body, it waits for 683 (717), as the sweep of the 390 wide story shows:
    // down it moves at 708, up it moves back at 720.
    expect(pinnedAt(455, 675 + 34)).toBe(true)
    expect(descriptionFitsPinned(inBody(455, 675 + 34))).toBe(false)
    expect(descriptionFitsPinned(inBody(455, 675 + 34 + REPIN_MARGIN))).toBe(
      true,
    )
  })

  it('stays in the body until it is measured', () => {
    expect(descriptionFitsPinned(inBody(0, 844))).toBe(false)
  })
})

describe('the whole dialog scrolls only when nothing else can fit (FE-481 round 8, R8-web-short)', () => {
  const scrollsAt = (
    windowHeight: number,
    {
      bareHeader = TITLE_BLOCK,
      footer = BAR,
      hasBody = true,
    }: { bareHeader?: number; footer?: number; hasBody?: boolean } = {},
  ) =>
    dialogScrollsWhole({
      bareHeader,
      footer,
      minBody: minBodyHeight(hasBody),
      available: available(windowHeight),
    })

  it('keeps the title and the bar fixed in every short window that has the room: 56 + 64 + 92 is a 246 tall window', () => {
    // The windows the old 340 rule scrolled as a whole, and the app laid out
    // with its title and bar fixed (body 146, 186, 176, 106, 166).
    for (const windowHeight of [340, 330, 320, 300, 260, 250, 246]) {
      expect(scrollsAt(windowHeight), `${windowHeight}`).toBe(false)
    }
    expect(TITLE_BLOCK + BAR + minBodyHeight(true) + 32 + 2).toBe(246)
  })

  it('scrolls the whole dialog below that, where the body between the bars would be under 92', () => {
    for (const windowHeight of [245, 240, 200, 180]) {
      expect(scrollsAt(windowHeight), `${windowHeight}`).toBe(true)
    }
  })

  it('a sentence-only confirm needs only the 24 under the title: it keeps the bars down to 178', () => {
    expect(scrollsAt(178, { hasBody: false })).toBe(false)
    expect(scrollsAt(177, { hasBody: false })).toBe(true)
  })

  it('a title that wraps to two lines (84 at 320 wide) or a bar that wraps to two rows (120) asks for more room', () => {
    // 84 + 64 + 92 + 34 = 274.
    expect(scrollsAt(274, { bareHeader: 84 })).toBe(false)
    expect(scrollsAt(273, { bareHeader: 84 })).toBe(true)
    // 56 + 120 + 92 + 34 = 302.
    expect(scrollsAt(302, { footer: 120 })).toBe(false)
    expect(scrollsAt(301, { footer: 120 })).toBe(true)
  })

  it('a dialog with no bar needs only the title block and a body', () => {
    expect(scrollsAt(182, { footer: 0 })).toBe(false)
    expect(scrollsAt(181, { footer: 0 })).toBe(true)
  })

  it('never while nothing is measured', () => {
    expect(
      dialogScrollsWhole({
        bareHeader: 0,
        footer: 0,
        minBody: minBodyHeight(true),
        available: Number.POSITIVE_INFINITY,
      }),
    ).toBe(false)
  })

  it('does not depend on where the description is: the title block is the same measured either way', () => {
    for (const description of [23, 91, 455]) {
      const pinned = bareHeaderHeight({
        header: TITLE_BLOCK + formSpace.titleToSubtitle + description,
        description,
        descriptionInHeader: true,
      })
      const inBody = bareHeaderHeight({
        header: TITLE_BLOCK,
        description,
        descriptionInHeader: false,
      })
      expect(pinned).toBe(TITLE_BLOCK)
      expect(inBody).toBe(TITLE_BLOCK)
    }
  })

  it('whenever the description fits pinned, the dialog does not scroll as a whole', () => {
    for (const windowHeight of [246, 300, 375, 560, 700, 844]) {
      for (const description of [23, 91, 137, 455]) {
        if (pinnedAt(description, windowHeight)) {
          expect(
            scrollsAt(windowHeight),
            `${description} in ${windowHeight}`,
          ).toBe(false)
        }
      }
    }
  })
})
