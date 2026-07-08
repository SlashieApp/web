'use client'

import { Box, Stack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'motion/react'
import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import { Skeleton } from '@chakra-ui/react'

import { useTaskBrowseLayout } from '../../context/TaskBrowseProvider'
import { useWorkerSearch } from '../context/WorkerSearchProvider'
import {
  workerAvatarUrl,
  workerDisplayName,
  workerServiceAreaLabel,
  workerSubtitle,
} from '../helpers/workerSearchHelpers'
import { WorkerFiltersPanel } from './WorkerFiltersPanel'
import { WorkerSearchCard } from './WorkerSearchCard'
import { WorkerSearchEmptyState } from './WorkerSearchEmptyState'

const panelEase = [0.22, 1, 0.36, 1] as const
const panelSlidePx = 22

/** Worker result list: select-to-highlight, activate again to open the profile. */
export function WorkerSearchList() {
  const router = useRouter()
  const {
    workers,
    loading,
    canShowWorkersEmptyState,
    selectedWorkerId,
    setSelectedWorkerId,
  } = useWorkerSearch()
  const cardRefs = useRef<Map<string, HTMLDivElement | null>>(new Map())
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const scrollCardIntoView = (workerId: string) => {
    const el = cardRefs.current.get(workerId)
    const scroller = scrollRef.current
    if (!el || !scroller) return
    scroller.scrollTo({
      top: Math.max(0, el.offsetTop - 96),
      behavior: 'smooth',
    })
  }

  const activateWorker = (workerId: string) => {
    if (selectedWorkerId === workerId) {
      router.push(`/workers/${workerId}`)
      return
    }
    setSelectedWorkerId(workerId)
    requestAnimationFrame(() => scrollCardIntoView(workerId))
  }

  return (
    <Box
      flex={1}
      minH={0}
      h="full"
      maxH="full"
      w="full"
      position="relative"
      overflow="hidden"
      pointerEvents="auto"
    >
      <Box
        ref={scrollRef}
        h="full"
        maxH="full"
        overflowY="auto"
        scrollbarWidth="none"
        css={{
          msOverflowStyle: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        <Stack gap={3} py={5} pb={10}>
          {loading && workers.length === 0
            ? [0, 1, 2].map((row) => (
                <Skeleton key={row} h="108px" borderRadius="2xl" />
              ))
            : null}
          {canShowWorkersEmptyState && workers.length === 0 ? (
            <Box px={1}>
              <WorkerSearchEmptyState />
            </Box>
          ) : null}
          {workers.map((worker) => {
            const name = workerDisplayName(worker)
            const isActive = selectedWorkerId === worker.id
            return (
              <Box
                key={worker.id}
                ref={(node: HTMLDivElement | null) => {
                  if (node) cardRefs.current.set(worker.id, node)
                  else cardRefs.current.delete(worker.id)
                }}
              >
                <WorkerSearchCard
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
                  onActivate={() => activateWorker(worker.id)}
                />
              </Box>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}

/**
 * Worker-mode equivalent of `WebTaskBrowseFiltersBlock`: filters and the
 * result list share one flex region, swapped with the same motion treatment.
 */
export function WebWorkerSearchBlock() {
  const { isFilterOpen } = useTaskBrowseLayout()

  return (
    <Box
      flex={1}
      minH={0}
      h="full"
      w="full"
      pointerEvents="none"
      display="flex"
      flexDirection="column"
      overflow="hidden"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isFilterOpen ? (
          <motion.div
            key="worker-search-filters"
            initial={{ opacity: 0, x: -panelSlidePx }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: panelSlidePx }}
            transition={{ duration: 0.32, ease: panelEase }}
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box flex={1} minH={0} w="full" overflowY="auto">
              <WorkerFiltersPanel />
            </Box>
          </motion.div>
        ) : (
          <motion.div
            key="worker-search-list"
            initial={{ opacity: 0, x: -panelSlidePx }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: panelSlidePx }}
            transition={{ duration: 0.26, ease: panelEase }}
            style={{
              flex: 1,
              minHeight: 0,
              height: '100%',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <WorkerSearchList />
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  )
}
