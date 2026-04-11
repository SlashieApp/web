'use client'

import { Box, HStack, Image, Stack } from '@chakra-ui/react'
import { useRef } from 'react'

import { Button } from '@/ui/Button'
import { GlassCard } from '@/ui/Card/GlassCard'
import { Heading, Text } from '@ui'

export type CreateTaskVisualsSectionProps = {
  files: File[]
  previews: string[]
  /** Snapshot `File[]` in the change handler before clearing the input (mobile-safe). */
  onFilesAdded: (files: File[]) => void
  onRemoveFile: (index: number) => void
}

export function CreateTaskVisualsSection({
  files,
  previews,
  onFilesAdded,
  onRemoveFile,
}: CreateTaskVisualsSectionProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  return (
    <GlassCard p={{ base: 5, md: 6 }} bg="surfaceContainerLowest">
      <Stack gap={4}>
        <Heading size="lg" color="primary.700">
          3. Visuals
        </Heading>
        <Text fontSize="sm" color="muted">
          Photos help contractors give more accurate quotes.
        </Text>

        <Box
          borderWidth="2px"
          borderStyle="dashed"
          borderColor="border"
          borderRadius="xl"
          p={6}
          bg="surfaceContainerLow"
        >
          <Stack align="center" gap={3}>
            <Text fontSize="sm" color="muted" textAlign="center">
              Upload images of the job area or problem (optional).
            </Text>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => {
                const picked =
                  e.target.files && e.target.files.length > 0
                    ? Array.from(e.target.files)
                    : []
                e.target.value = ''
                if (picked.length > 0) {
                  onFilesAdded(picked)
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => inputRef.current?.click()}
            >
              Upload
            </Button>
          </Stack>
        </Box>

        {previews.length > 0 ? (
          <HStack gap={3} flexWrap="wrap" align="flex-start">
            {previews.map((src, i) => {
              const file = files[i]
              const stableKey = file
                ? `${file.name}-${file.size}-${file.lastModified}`
                : `${i}-${src.slice(0, 24)}`
              return (
                <Box key={stableKey} position="relative">
                  <Image
                    key={src}
                    src={src}
                    alt={file ? `Preview: ${file.name}` : ''}
                    boxSize="88px"
                    objectFit="cover"
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor="border"
                  />
                  <Button
                    type="button"
                    size="xs"
                    variant="subtle"
                    position="absolute"
                    top={1}
                    right={1}
                    onClick={() => onRemoveFile(i)}
                  >
                    ×
                  </Button>
                </Box>
              )
            })}
          </HStack>
        ) : null}
      </Stack>
    </GlassCard>
  )
}
