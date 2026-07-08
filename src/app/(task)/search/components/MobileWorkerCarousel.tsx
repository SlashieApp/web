'use client'

import { Box, HStack } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { useWorkerSearch } from '../context/WorkerSearchProvider'
import {
  workerAvatarUrl,
  workerDisplayName,
  workerServiceAreaLabel,
  workerSubtitle,
} from '../helpers/workerSearchHelpers'
import { WorkerSearchCard } from './WorkerSearchCard'
import { WorkerSearchEmptyState } from './WorkerSearchEmptyState'

/**
 * Mobile bottom strip for worker mode: horizontal scroll-snap cards over the
 * map (same slot as the task carousel). Tapping a card highlights its pin;
 * tapping the highlighted card opens the worker's profile. Selecting a pin
 * scrolls its card into view.
 */
export function MobileWorkerCarousel() {
  const router = useRouter()
  const {
    workers,
    canShowWorkersEmptyState,
    selectedWorkerId,
    setSelectedWorkerId,
  } = useWorkerSearch()
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())

  // Pin tap → bring the matching card into view.
  useEffect(() => {
    if (!selectedWorkerId) return
    const el = cardRefs.current.get(selectedWorkerId)
    el?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })
  }, [selectedWorkerId])

  if (canShowWorkersEmptyState && workers.length === 0) {
    return (
      <Box px={3} pointerEvents="auto">
        <WorkerSearchEmptyState />
      </Box>
    )
  }

  return (
    <HStack
      as="ul"
      listStyleType="none"
      gap={3}
      px={3}
      overflowX="auto"
      scrollSnapType="x mandatory"
      scrollbarWidth="none"
      css={{
        msOverflowStyle: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
      pointerEvents="auto"
      aria-label="Workers in this area"
    >
      {workers.map((worker) => {
        const name = workerDisplayName(worker)
        const isActive = selectedWorkerId === worker.id
        return (
          <Box
            key={worker.id}
            as="li"
            ref={(node: HTMLDivElement | null) => {
              if (node) cardRefs.current.set(worker.id, node)
              else cardRefs.current.delete(worker.id)
            }}
            flexShrink={0}
            w="82vw"
            maxW="340px"
            scrollSnapAlign="center"
          >
            <WorkerSearchCard
              compact
              name={name}
              avatarUrl={workerAvatarUrl(worker)}
              verified={worker.isVerified}
              subtitle={workerSubtitle(worker)}
              serviceAreaLabel={workerServiceAreaLabel(worker)}
              skills={worker.skills}
              profileHref={`/workers/${worker.id}`}
              isActive={isActive}
              activateAriaLabel={
                isActive
                  ? `${name}. Open profile.`
                  : `${name}. Select to highlight on map.`
              }
              onActivate={() => {
                if (isActive) {
                  router.push(`/workers/${worker.id}`)
                  return
                }
                setSelectedWorkerId(worker.id)
              }}
            />
          </Box>
        )
      })}
    </HStack>
  )
}
