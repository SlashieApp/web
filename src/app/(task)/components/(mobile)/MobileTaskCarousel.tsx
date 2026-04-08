'use client'

import { Box, HStack } from '@chakra-ui/react'
import useEmblaCarousel from 'embla-carousel-react'
import WheelGesturesPlugin from 'embla-carousel-wheel-gestures'
import { motion } from 'motion/react'
import { useEffect } from 'react'

import { Text } from '@ui'
import { TaskBrowseListItem } from '../(web)/TaskBrowseListItem'

type MobileTaskCard = {
  id: string
  title: string
  description: string
  location: string
  priceLabel: string
  badgeText?: string
  imageSeed?: string
}

export type MobileTaskCarouselProps = {
  tasks: MobileTaskCard[]
  selectedTaskId: string | null
  onSelectTask: (taskId: string) => void
}

export function MobileTaskCarousel({
  tasks,
  selectedTaskId,
  onSelectTask,
}: MobileTaskCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'center', containScroll: 'trimSnaps', dragFree: false },
    [WheelGesturesPlugin()],
  )

  useEffect(() => {
    if (!emblaApi || !selectedTaskId) return
    const selectedIndex = tasks.findIndex((task) => task.id === selectedTaskId)
    if (selectedIndex < 0) return
    emblaApi.scrollTo(selectedIndex)
  }, [emblaApi, selectedTaskId, tasks])

  if (tasks.length === 0) {
    return (
      <Box
        bg="surfaceContainerLowest/96"
        borderRadius="2xl"
        borderWidth="1px"
        borderColor="border"
        boxShadow="0 8px 24px rgba(15,23,42,0.2)"
        px={4}
        py={3}
      >
        <Text fontSize="sm" color="muted">
          No tasks match current filters.
        </Text>
      </Box>
    )
  }

  return (
    <Box
      ref={emblaRef}
      overflow="hidden"
      px={3}
      pb={20}
      mb={1}
      position="relative"
      style={{
        maskImage:
          'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 24px, rgba(0,0,0,1) calc(100% - 24px), rgba(0,0,0,0) 100%)',
        WebkitMaskImage:
          'linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 24px, rgba(0,0,0,1) calc(100% - 24px), rgba(0,0,0,0) 100%)',
      }}
    >
      <HStack
        gap={3}
        align="stretch"
        css={{
          touchAction: 'pan-y pinch-zoom',
        }}
      >
        {tasks.map((task) => {
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              style={{
                flex: '0 0 min(420px, calc(100% - 52px))',
                maxWidth: '420px',
                minWidth: '0',
              }}
            >
              <Box minW="0">
                <TaskBrowseListItem
                  title={task.title}
                  description={task.description}
                  priceLabel={task.priceLabel}
                  metaLine={task.location}
                  imageSeed={task.imageSeed}
                  detailsHref={`/task/${task.id}`}
                  badgeVariant={task.badgeText ? 'featured' : 'none'}
                  badgeText={task.badgeText}
                  isActive={selectedTaskId === task.id}
                  onActivate={() => onSelectTask(task.id)}
                />
              </Box>
            </motion.div>
          )
        })}
      </HStack>
    </Box>
  )
}
