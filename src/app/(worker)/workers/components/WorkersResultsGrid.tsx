'use client'

import {
  Box,
  HStack,
  Heading,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
} from '@chakra-ui/react'

import { useTaskBrowseData } from '@/app/(task)/context/TaskBrowseProvider'
import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, Card, SpotIllustration } from '@ui'

import { useWorkerSearch } from '../context/WorkerSearchProvider'
import {
  buildWorkerActiveFilterTags,
  formatWorkersListTitle,
  milesToKmRounded,
  workerAvatarUrl,
  workerDisplayName,
  workerExperienceShortLabel,
  workerRatingLabel,
  workerRespondsLabel,
  workerServiceAreaLabel,
  workerSubtitle,
} from '../helpers/workerSearchHelpers'
import bag from '../i11n.json'
import { WorkerSearchCard } from './WorkerSearchCard'

function WorkersEmptyState() {
  const t = useI11n(bag)
  const { referenceLocation } = useTaskBrowseData()
  const { clearWorkerFilters } = useWorkerSearch()

  return (
    <Card p={5}>
      <Stack align="center" textAlign="center" gap={3} py={6} px={2} w="full">
        <SpotIllustration variant="quotes" width={120} />
        <Stack gap={1} align="center">
          <Text fontSize="lg" fontWeight={600} color="text.default">
            {t.emptyTitle}
          </Text>
          <Text fontSize="sm" color="text.muted" maxW="360px">
            {formatMessage(t.emptyDescription, {
              area: referenceLocation.label,
            })}
          </Text>
        </Stack>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={clearWorkerFilters}
        >
          {t.clearFilters}
        </Button>
      </Stack>
    </Card>
  )
}

function WorkersResultsTitle() {
  const t = useI11n(bag)
  const {
    referenceLocation,
    submittedRadiusMiles,
    syncDraftFiltersFromSubmitted,
  } = useTaskBrowseData()
  const {
    workers,
    submittedWorkerSearchText,
    submittedVerifiedOnly,
    setIsFilterOpen,
    syncWorkerDraftFromSubmitted,
  } = useWorkerSearch()

  const tags = buildWorkerActiveFilterTags({
    submittedWorkerSearchText,
    submittedVerifiedOnly,
    submittedRadiusMiles,
    verifiedLabel: t.verifiedOnly,
    distanceLabel: formatMessage(t.distanceValue, {
      km: String(milesToKmRounded(submittedRadiusMiles)),
    }),
  })

  const openFilters = () => {
    syncDraftFiltersFromSubmitted()
    syncWorkerDraftFromSubmitted()
    setIsFilterOpen(true)
  }

  return (
    <Stack gap={2}>
      <Heading
        as="h2"
        fontSize={{ base: 'lg', md: 'xl' }}
        fontWeight={700}
        letterSpacing="-0.02em"
        color="text.default"
      >
        {formatWorkersListTitle(workers.length, referenceLocation.label)}
      </Heading>
      {tags.length > 0 ? (
        <HStack
          gap={1.5}
          flexWrap="wrap"
          display={{ base: 'flex', md: 'none' }}
        >
          {tags.map((tag) => (
            <Button
              key={`${tag.kind}-${tag.label}`}
              type="button"
              size="xs"
              variant="ghost"
              px={2.5}
              py={1}
              h="auto"
              minH={0}
              borderRadius="full"
              bg="action.primary"
              color="text.onGreen"
              fontSize="xs"
              fontWeight={700}
              boxShadow="none"
              _hover={{ bg: 'action.primaryHover', color: 'text.onGreen' }}
              onClick={openFilters}
            >
              {tag.label}
            </Button>
          ))}
        </HStack>
      ) : null}
    </Stack>
  )
}

export function WorkersResultsGrid() {
  const { workers, loading, dataLoaded, canShowWorkersEmptyState } =
    useWorkerSearch()

  return (
    <Stack gap={4}>
      {loading && !dataLoaded ? (
        <Skeleton h="28px" w="14rem" borderRadius="md" />
      ) : (
        <WorkersResultsTitle />
      )}

      {loading && !dataLoaded ? (
        <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={4}>
          {['a', 'b', 'c', 'd', 'e', 'f'].map((key) => (
            <Skeleton key={key} h="320px" borderRadius="lg" />
          ))}
        </SimpleGrid>
      ) : canShowWorkersEmptyState && workers.length === 0 ? (
        <WorkersEmptyState />
      ) : (
        <SimpleGrid columns={{ base: 2, md: 3, xl: 4 }} gap={4}>
          {workers.map((worker) => (
            <Box key={worker.id} minW={0}>
              <WorkerSearchCard
                workerId={worker.id}
                name={workerDisplayName(worker)}
                avatarUrl={workerAvatarUrl(worker)}
                verified={Boolean(worker.isVerified)}
                subtitle={workerSubtitle(worker)}
                ratingLabel={workerRatingLabel(worker)}
                experienceLabel={workerExperienceShortLabel(worker)}
                respondsLabel={workerRespondsLabel(worker)}
                serviceAreaLabel={workerServiceAreaLabel(worker)}
                skills={worker.skills ?? []}
                profileHref={`/workers/${worker.id}`}
              />
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  )
}
