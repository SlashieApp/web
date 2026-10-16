'use client'

import { Box, HStack, Image, Stack, Text, Wrap } from '@chakra-ui/react'
import { useRef } from 'react'
import { LuImagePlus, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Badge, Button, IconButton } from '@ui'

import {
  TASK_PHOTOS_MAX,
  TASK_PHOTO_MAX_MB,
  type TaskPhotoRejection,
} from '../../../helpers/taskPhotos'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

export type CreateTaskVisualsSectionProps = {
  files: File[]
  previews: string[]
  /** Snapshot `File[]` in the change handler before clearing the input (mobile-safe). */
  onFilesAdded: (files: File[]) => void
  onRemoveFile: (index: number) => void
  /** Files the last pick turned away, and why. */
  rejected?: readonly TaskPhotoRejection[]
  /** Photos already on the task (edit). */
  existingImageUrls?: string[]
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  /** False when a heading above already says "Photos" (edit). */
  labelled?: boolean
}

const THUMB = '88px'

/** Optional photos: public on the task, up to 10, each up to 10 MB. */
export function CreateTaskVisualsSection({
  files,
  previews,
  onFilesAdded,
  onRemoveFile,
  rejected = [],
  existingImageUrls = [],
  bare = false,
  sectionHeading = '',
  labelled = true,
}: CreateTaskVisualsSectionProps) {
  const f = useI11n(bag).fields
  const inputRef = useRef<HTMLInputElement | null>(null)
  const count = existingImageUrls.length + previews.length
  const full = count >= TASK_PHOTOS_MAX

  const rejection = (item: TaskPhotoRejection) =>
    item.reason === 'tooMany'
      ? formatMessage(f.tooManyPhotos, { max: TASK_PHOTOS_MAX })
      : item.reason === 'tooLarge'
        ? formatMessage(f.photoTooLarge, {
            name: item.name,
            size: TASK_PHOTO_MAX_MB,
          })
        : formatMessage(f.notAPhoto, { name: item.name })

  return (
    <CreateTaskSection bare={bare} heading={sectionHeading} bodyGap={3}>
      <HStack gap={2} justify="space-between">
        {labelled ? (
          <HStack gap={2}>
            <Text fontSize="14px" fontWeight={500} color="text.default" px={1}>
              {f.photos}
            </Text>
            <Badge variant="neutral" shape="pill">
              {f.optional}
            </Badge>
          </HStack>
        ) : (
          <span />
        )}
        {count > 0 ? (
          <Text fontSize="sm" color="text.muted">
            {formatMessage(f.photoCount, { count, max: TASK_PHOTOS_MAX })}
          </Text>
        ) : null}
      </HStack>
      <Text fontSize="sm" color="text.muted" px={1}>
        {f.photosHelper}
      </Text>

      <Wrap gap={3} align="flex-start" pt={1}>
        {existingImageUrls.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={formatMessage(f.savedPhoto, { number: i + 1 })}
            boxSize={THUMB}
            objectFit="cover"
            borderRadius="lg"
            borderWidth="1px"
            borderColor="border.default"
          />
        ))}
        {previews.map((src, i) => {
          const file = files[i]
          const number = existingImageUrls.length + i + 1
          return (
            <Box
              key={file ? `${file.name}-${file.lastModified}-${i}` : src}
              position="relative"
            >
              <Image
                src={src}
                alt=""
                boxSize={THUMB}
                objectFit="cover"
                borderRadius="lg"
                borderWidth="1px"
                borderColor="border.default"
              />
              {/* 44px target hangs off the corner to cover less of the photo. */}
              <IconButton
                type="button"
                aria-label={formatMessage(f.removePhoto, { number })}
                position="absolute"
                top={-2}
                right={-2}
                bg="bg.surface"
                boxShadow="e2"
                onClick={() => onRemoveFile(i)}
              >
                <LuX aria-hidden />
              </IconButton>
            </Box>
          )
        })}
        {full ? null : (
          <Button
            type="button"
            variant="secondary"
            onClick={() => inputRef.current?.click()}
            h={THUMB}
            minW={THUMB}
            borderStyle="dashed"
            borderWidth="2px"
          >
            <Stack gap={1} align="center">
              <LuImagePlus size={20} aria-hidden />
              <Text as="span" fontSize="sm">
                {f.addPhotos}
              </Text>
            </Stack>
          </Button>
        )}
      </Wrap>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          const picked = e.target.files ? Array.from(e.target.files) : []
          e.target.value = ''
          if (picked.length > 0) onFilesAdded(picked)
        }}
      />

      {rejected.length > 0 ? (
        <Stack gap={1} role="alert">
          {rejected.map((item) => (
            <Text
              key={item.reason === 'tooMany' ? 'tooMany' : item.name}
              fontSize="sm"
              color="status.danger.fg"
              px={1}
            >
              {rejection(item)}
            </Text>
          ))}
        </Stack>
      ) : null}
    </CreateTaskSection>
  )
}
