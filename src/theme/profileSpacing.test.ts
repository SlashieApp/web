import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

/**
 * The profile editors and the remaining page forms on the form spacing (wiki:
 * Foundations-Form-Spacing, FE-481 profile-editors): the Personal and Worker
 * editors and the photo card in the profile drawer, the drawer's own bar, and
 * the admin announcement composer. The gaps are measured in each surface's
 * stories; these pin that the numbers come from the form pieces and tokens, so
 * an editor does not go back to typing its own steps.
 */
const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8')

const EDIT = 'src/app/(dashboard)/profile/components/ui/edit'

const SURFACES = {
  ProfileEditDrawer: read(`${EDIT}/ProfileEditDrawer.tsx`),
  ProfileWorkerForm: read(`${EDIT}/ProfileWorkerForm.tsx`),
  ProfilePhotoCard: read(`${EDIT}/ProfilePhotoCard.tsx`),
  AdminNotificationComposer: read(
    'src/app/(dashboard)/admin/notifications/components/ui/AdminNotificationComposer.tsx',
  ),
  DrawerBar: read('src/ui/Drawer/DrawerBar.tsx'),
} as const

describe('profile editors: one rhythm from the form pieces', () => {
  it.each(Object.entries(SURFACES))(
    '%s types no stack gap of its own for a form gap',
    (name, source) => {
      // The step numbers the old editors used between fields (20 is gap 5, 24
      // is gap 6), and the old 44 override on a field.
      expect(source).not.toMatch(/<(?:Stack|HStack)\s+gap=\{(?:5|6)\}/)
      // 16 (gap 4) is the old stack gap too, except the photo card's row: the
      // photo and its button are not fields, so the spec has no gap for them.
      if (name !== 'ProfilePhotoCard') {
        expect(source).not.toMatch(/<(?:Stack|HStack)\s+gap=\{4\}/)
      }
      expect(source).not.toContain('minH="44px"')
    },
  )

  it.each(Object.entries(SURFACES))(
    '%s uses no font weight above 600',
    (_name, source) => {
      for (const [, weight] of source.matchAll(/fontWeight=\{(\d+)\}/g)) {
        expect(Number(weight)).toBeLessThanOrEqual(600)
      }
    },
  )

  it('Personal and Worker lay their fields out in a FormStack that ends in the drawer bar', () => {
    for (const source of [
      SURFACES.ProfileEditDrawer,
      SURFACES.ProfileWorkerForm,
    ]) {
      expect(source).toContain('<FormStack>')
      expect(source).toContain('<DrawerBar>')
      // Cancel and Save are the form's main buttons: 48 tall.
      expect(source.match(/size="form"/g)).toHaveLength(2)
    }
    // The hand-built bars: a sticky HStack with its own padding.
    expect(SURFACES.ProfileEditDrawer).not.toContain('position="sticky"')
    expect(SURFACES.ProfileWorkerForm).not.toContain('position="sticky"')
  })

  it('the drawer ends in the bar for the two editors, not for the photo', () => {
    expect(SURFACES.ProfileEditDrawer).toContain(
      "endsInBar={section === 'personal' || section === 'worker'}",
    )
    expect(read('src/ui/Drawer/Drawer.tsx')).toContain(
      'pb={primaryActionLabel || endsInBar ? 0 : 6}',
    )
  })

  it('the bar is pinned, has no line, no padding above, and the inline gap between its buttons', () => {
    const bar = SURFACES.DrawerBar
    expect(bar).toContain('gap="form.inlineGap"')
    expect(bar).toContain('position="sticky"')
    expect(bar).toContain('bottom={0}')
    expect(bar).toContain('pb={4}')
    expect(bar).not.toMatch(/\bp[ty]=/)
    expect(bar).not.toContain('borderTop')
  })

  it('Worker: years and radius are a FormRow, a field gap apart on a phone and an inline gap from md', () => {
    const worker = SURFACES.ProfileWorkerForm
    expect(worker).toContain('<FormRow')
    expect(worker).toContain("gridAutoFlow={{ base: 'row', md: 'column' }}")
    expect(worker).toContain(
      "gap={{ base: 'form.fieldGap', md: 'form.inlineGap' }}",
    )
    expect(worker).not.toContain('flexWrap')
    expect(worker).not.toContain("minW={{ base: 'full', md: '200px' }}")
  })

  it('Photo: sentence 8 under the title, the field 24 under it, the hint 4 under the button', () => {
    const photo = SURFACES.ProfilePhotoCard
    expect(photo).toContain('gap="form.titleToSubtitle"')
    expect(photo).toContain('bodyGap="form.headerToBody"')
    expect(photo.match(/gap="form\.controlToHelper"/g)).toHaveLength(2)
    expect(photo).toContain('size="form"')
    // A refused file or a failed upload is announced.
    expect(photo).toContain('role="alert"')
  })

  it('Admin composer: a FormStack under a heading 24 above it, buttons 8 apart, cohorts a choice group', () => {
    const admin = SURFACES.AdminNotificationComposer
    expect(admin).toContain('<FormStack>')
    expect(admin).toContain('bodyGap="form.headerToBody"')
    expect(admin).toContain('{...formControlLabelProps}')
    expect(admin).toContain('gap="form.alternativesGap"')
    expect(admin.match(/size="form"/g)).toHaveLength(2)
    // Rows 8 apart each take half of that for their tap target (28), so two
    // targets never overlap: a click on an upper row cannot tick the next box.
    expect(admin).toContain('COHORT_REACH = formSpace.alternativesGap / 2')
    expect(admin).toContain('<FormCheckbox')
    expect(admin).toContain('reachAbove={COHORT_REACH}')
    expect(admin).toContain('reachBelow={COHORT_REACH}')
    expect(admin).not.toContain('minH="44px"')
  })
})
