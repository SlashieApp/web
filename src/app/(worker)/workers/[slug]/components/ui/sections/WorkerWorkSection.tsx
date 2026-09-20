import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { LuChevronRight } from 'react-icons/lu'

import { Badge, Card, RatingStars, SpotIllustration } from '@ui'

/**
 * Display shape for a BE-36 `completedJobs` row. `areaLabel` is an
 * approximate area ("Camden, London") — never an address.
 */
export type WorkerCompletedJob = {
  id: string
  title: string
  category: string
  areaLabel?: string | null
  /** Display date, e.g. "March 2026". */
  completedLabel: string
  /** 1–5 stars; omitted until the job is reviewed. */
  rating?: number | null
}

function CompletedJobRow({ job }: { job: WorkerCompletedJob }) {
  return (
    <HStack
      gap={3}
      align="center"
      px={4}
      py={3}
      borderWidth="1px"
      borderColor="border.default"
      borderRadius="lg"
      bg="bg.surface"
    >
      <Stack gap={1.5} flex={1} minW={0}>
        <Text fontWeight={600} fontSize="sm" lineClamp={1}>
          {job.title}
        </Text>
        <HStack gap={2} flexWrap="wrap" color="text.muted" fontSize="xs">
          <Badge variant="neutral" shape="pill" size="sm">
            {job.category}
          </Badge>
          {job.areaLabel ? (
            <>
              <Text as="span">{job.areaLabel}</Text>
              <Text as="span" aria-hidden color="text.subtle">
                ·
              </Text>
            </>
          ) : null}
          <Text as="span">{job.completedLabel}</Text>
        </HStack>
      </Stack>
      {job.rating != null ? (
        <RatingStars value={job.rating} label={`${job.title} rating`} />
      ) : null}
      <Box as="span" display="inline-flex" color="text.subtle" aria-hidden>
        <LuChevronRight size={16} strokeWidth={2} />
      </Box>
    </HStack>
  )
}

/**
 * "Work on Slashie" — completed jobs with title, category chip, area, date,
 * and optional stars, from BE-36 `completedJobs` (mapped by the page).
 * Workers with no confirmed platform jobs get the E14 empty state.
 */
export function WorkerWorkSection({
  jobs = [],
}: {
  jobs?: readonly WorkerCompletedJob[]
}) {
  return (
    <Card
      layout="section"
      eyebrow="Work on Slashie"
      heading="Jobs completed on Slashie"
    >
      {jobs.length > 0 ? (
        <Stack gap={2.5}>
          {jobs.map((job) => (
            <CompletedJobRow key={job.id} job={job} />
          ))}
        </Stack>
      ) : (
        <Stack align="center" textAlign="center" gap={3} py={4} px={2} w="full">
          <SpotIllustration variant="no-work" />
          <Stack gap={1} align="center">
            <Text fontSize="lg" fontWeight={600} color="text.default">
              No completed jobs on Slashie yet
            </Text>
            <Text fontSize="sm" color="text.muted" maxW="320px">
              Jobs this worker completes through Slashie will appear here with
              the task, area, and date.
            </Text>
          </Stack>
        </Stack>
      )}
    </Card>
  )
}
