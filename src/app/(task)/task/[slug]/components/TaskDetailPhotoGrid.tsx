'use client'

import { Box, Grid, Image, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'

import type { TaskDetailRecord } from './taskDetailUtils'

function accentGradient(seed: string): string {
  const key = seed.toLowerCase()
  if (key.includes('plumb'))
    return 'linear-gradient(135deg, #1A56DB 0%, #003fb1 100%)'
  if (key.includes('electr'))
    return 'linear-gradient(135deg, #5f88e8 0%, #1A56DB 100%)'
  if (key.includes('paint'))
    return 'linear-gradient(135deg, #cb7f08 0%, #855300 100%)'
  if (key.includes('garden'))
    return 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)'
  return 'linear-gradient(135deg, #dfe8f7 0%, #b5ceff 100%)'
}

function Placeholder({ label, seed }: { label: string; seed: string }) {
  return (
    <Box
      w="full"
      h="full"
      minH={{ base: '140px', md: '120px' }}
      bg={accentGradient(seed)}
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="white"
      fontWeight={700}
      fontSize="sm"
      textAlign="center"
      px={3}
      opacity={0.92}
    >
      {label}
    </Box>
  )
}

type CellProps = {
  src?: string | null
  alt: string
  accentSeed: string
  emptyLabel: string
}

function PhotoCell({ src, alt, accentSeed, emptyLabel }: CellProps) {
  const [broken, setBroken] = useState(false)
  if (!src || broken) {
    return <Placeholder label={emptyLabel} seed={accentSeed} />
  }
  return (
    <Image
      src={src}
      alt={alt}
      w="full"
      h="full"
      minH={{ base: '140px', md: '120px' }}
      objectFit="cover"
      onError={() => setBroken(true)}
    />
  )
}

export type TaskDetailPhotoGridProps = {
  task: TaskDetailRecord
  /** Section label above the grid (default PHOTOS). */
  sectionTitle?: string
}

export function TaskDetailPhotoGrid({
  task,
  sectionTitle = 'PHOTOS',
}: TaskDetailPhotoGridProps) {
  const images = task.images ?? []
  const [main, second, third] = [images[0], images[1], images[2]]
  const extra = Math.max(0, images.length - 3)
  const accentSeed = `${task.title} ${task.description}`

  return (
    <Stack gap={3}>
      <Text
        fontSize="sm"
        fontWeight={700}
        color="formLabelMuted"
        letterSpacing="0.06em"
      >
        {sectionTitle}
      </Text>
      <Grid
        templateColumns={{
          base: '1fr 1fr',
          md: 'minmax(0, 1.35fr) minmax(0, 1fr)',
        }}
        templateRows={{
          base: 'minmax(180px, 52vw) minmax(130px, 32vw)',
          md: 'minmax(0, 1fr) minmax(0, 1fr)',
        }}
        gap={3}
        minH={{ md: '280px' }}
      >
        <Box
          gridColumn={{ base: '1 / -1', md: '1' }}
          gridRow={{ base: '1', md: '1 / span 2' }}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="jobCardBorder"
          bg="jobCardBg"
        >
          <PhotoCell
            src={main}
            alt={task.title}
            accentSeed={accentSeed}
            emptyLabel="No photos yet"
          />
        </Box>
        <Box
          gridColumn={{ base: '1', md: '2' }}
          gridRow={{ base: '2', md: '1' }}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="jobCardBorder"
        >
          <PhotoCell
            src={second}
            alt=""
            accentSeed={accentSeed}
            emptyLabel="Add angles in the app"
          />
        </Box>
        <Box
          gridColumn={{ base: '2', md: '2' }}
          gridRow={{ base: '2', md: '2' }}
          borderRadius="xl"
          overflow="hidden"
          borderWidth="1px"
          borderColor="jobCardBorder"
          position="relative"
        >
          <PhotoCell
            src={third}
            alt=""
            accentSeed={accentSeed}
            emptyLabel="More soon"
          />
          {extra > 0 ? (
            <Box
              position="absolute"
              inset={0}
              bg="rgba(15,23,42,0.55)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontWeight={800}
              fontSize="lg"
            >
              +{extra} photo{extra === 1 ? '' : 's'}
            </Box>
          ) : null}
        </Box>
      </Grid>
    </Stack>
  )
}
