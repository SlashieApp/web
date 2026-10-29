'use client'

import { Stack, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { useI11n } from '@/i18n/useI11n'
import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav/mobileBottomNavLayout'
import { Drawer, FormStack } from '@ui'

import { useWorkerSearch } from '../../context/WorkerSearchProvider'
import bag from '../../i11n.json'
import {
  WORKERS_FILTER_LABEL,
  WorkersDistanceControl,
  WorkersSkillsInput,
  WorkersVerifiedToggle,
} from '../ui/WorkersSearchFields'

export function WorkersFiltersDrawer() {
  const t = useI11n(bag)
  const { submitBrowseFilters, syncDraftFiltersFromSubmitted } =
    useTaskBrowseData()
  const {
    isFilterOpen,
    setIsFilterOpen,
    submitWorkerFilters,
    syncWorkerDraftFromSubmitted,
  } = useWorkerSearch()

  const syncDrafts = () => {
    syncDraftFiltersFromSubmitted()
    syncWorkerDraftFromSubmitted()
  }

  return (
    <Drawer
      open={isFilterOpen}
      onOpenChange={(open) => {
        setIsFilterOpen(open)
        if (open) syncDrafts()
      }}
      title={t.filtersTitle}
      placement="bottom"
      size="md"
      primaryActionLabel={t.applyFilters}
      onPrimaryAction={() => {
        submitBrowseFilters()
        submitWorkerFilters()
        setIsFilterOpen(false)
      }}
      contentProps={{ pb: MOBILE_BOTTOM_NAV_CLEARANCE }}
    >
      {/* Filters are fields of a form (FE-481): 20 apart, each label 8 above its
          control. The frame puts 24 under the title and ends the body 20 above
          Apply, so nothing here adds space at either end. */}
      <FormStack>
        <Stack gap="form.labelToControl">
          <Text {...WORKERS_FILTER_LABEL}>{t.skillsLabel}</Text>
          <WorkersSkillsInput asField />
        </Stack>
        <WorkersDistanceControl layout="block" />
        <Stack gap="form.labelToControl">
          <Text {...WORKERS_FILTER_LABEL}>{t.verifiedOnly}</Text>
          <WorkersVerifiedToggle />
        </Stack>
      </FormStack>
    </Drawer>
  )
}
