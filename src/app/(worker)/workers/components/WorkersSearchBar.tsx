'use client'

import { Box, HStack } from '@chakra-ui/react'
import { LuSlidersHorizontal } from 'react-icons/lu'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { sdlMotion } from '@/theme/styles'
import { Button, Card } from '@ui'

import { useWorkerSearch } from '../context/WorkerSearchProvider'
import {
  buildWorkerActiveFilterTags,
  milesToKmRounded,
} from '../helpers/workerSearchHelpers'
import bag from '../i11n.json'
import { WorkersFiltersDrawer } from './WorkersFiltersDrawer'
import {
  WorkersAreaInput,
  WorkersDistanceControl,
  WorkersSkillsInput,
  WorkersVerifiedToggle,
} from './WorkersSearchFields'

export function WorkersSearchBar({ stuck = false }: { stuck?: boolean }) {
  const t = useI11n(bag)
  const {
    commitAreaLocationSearch,
    submitBrowseFilters,
    syncDraftFiltersFromSubmitted,
    submittedRadiusMiles,
  } = useTaskBrowseData()
  const {
    submitWorkerFilters,
    syncWorkerDraftFromSubmitted,
    setIsFilterOpen,
    submittedWorkerSearchText,
    submittedVerifiedOnly,
  } = useWorkerSearch()

  const applySearch = () => {
    commitAreaLocationSearch()
    submitBrowseFilters()
    submitWorkerFilters()
  }

  const openFilters = () => {
    syncDraftFiltersFromSubmitted()
    syncWorkerDraftFromSubmitted()
    setIsFilterOpen(true)
  }

  const activeFilterCount = buildWorkerActiveFilterTags({
    submittedWorkerSearchText,
    submittedVerifiedOnly,
    submittedRadiusMiles,
    verifiedLabel: t.verifiedOnly,
    distanceLabel: formatMessage(t.distanceValue, {
      km: String(milesToKmRounded(submittedRadiusMiles)),
    }),
  }).length

  return (
    <>
      <Card
        display={{ base: 'block', md: 'none' }}
        w="full"
        maxW="full"
        p={2}
        borderRadius={stuck ? 0 : 'xl'}
        boxShadow={stuck ? 'none' : 'e4'}
        transitionProperty="border-radius, box-shadow"
        transitionDuration={sdlMotion.duration.moderate}
      >
        <Box
          as="form"
          onSubmit={(e) => {
            e.preventDefault()
            commitAreaLocationSearch()
            submitBrowseFilters()
          }}
        >
          <HStack gap={2} align="center">
            <Box flex={1} minW={0}>
              <WorkersAreaInput />
            </Box>
            <Button
              type="button"
              variant={activeFilterCount > 0 ? 'primary' : 'secondary'}
              flexShrink={0}
              aria-label={
                activeFilterCount > 0
                  ? formatMessage(t.openFiltersWithCount, {
                      count: activeFilterCount,
                    })
                  : t.openFilters
              }
              onClick={openFilters}
            >
              <LuSlidersHorizontal size={18} strokeWidth={2} aria-hidden />
              {t.filters}
            </Button>
          </HStack>
        </Box>
      </Card>

      <Card
        display={{ base: 'none', md: 'block' }}
        w="full"
        maxW="full"
        p={3}
        borderRadius={stuck ? 0 : 'xl'}
        boxShadow={stuck ? 'none' : 'e4'}
        transitionProperty="border-radius, box-shadow"
        transitionDuration={sdlMotion.duration.moderate}
      >
        <Box
          as="form"
          onSubmit={(e) => {
            e.preventDefault()
            applySearch()
          }}
        >
          <HStack gap={3} align="center" flexWrap="nowrap">
            <Box flex="1 1 180px" minW={0}>
              <WorkersAreaInput />
            </Box>
            <Box flex="1 1 180px" minW={0}>
              <WorkersSkillsInput />
            </Box>
            <WorkersDistanceControl layout="inline" />
            <WorkersVerifiedToggle />
            <Button type="submit" variant="primary" flexShrink={0}>
              {t.search}
            </Button>
          </HStack>
        </Box>
      </Card>

      <WorkersFiltersDrawer />
    </>
  )
}
