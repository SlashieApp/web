'use client'

import { Stack, Text } from '@chakra-ui/react'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { useI11n } from '@/i18n/useI11n'
import { MOBILE_BOTTOM_NAV_CLEARANCE } from '@/ui/MobileBottomNav'
import { Drawer } from '@ui'

import { useWorkerSearch } from '../context/WorkerSearchProvider'
import bag from '../i11n.json'
import {
  WORKERS_FILTER_LABEL,
  WorkersDistanceControl,
  WorkersSkillsInput,
  WorkersVerifiedToggle,
} from './WorkersSearchFields'

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
      <Stack gap={6} pb={2}>
        <Stack gap={2}>
          <Text {...WORKERS_FILTER_LABEL}>{t.skillsLabel}</Text>
          <WorkersSkillsInput />
        </Stack>
        <WorkersDistanceControl layout="block" />
        <Stack gap={2}>
          <Text {...WORKERS_FILTER_LABEL}>{t.verifiedOnly}</Text>
          <WorkersVerifiedToggle />
        </Stack>
      </Stack>
    </Drawer>
  )
}
