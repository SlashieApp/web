'use client'

import { Box, HStack, Image, Stack, Text, Wrap, chakra } from '@chakra-ui/react'
import { type ComponentProps, type ReactNode, useState } from 'react'
import { LuImagePlus, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { formHelperTextStyle, sdlFocusRing } from '@/theme/styles'
import {
  Badge,
  Button,
  IconButton,
  ImagePreview,
  PhotoSourcePicker,
  PhotoTile,
} from '@ui'

import {
  TASK_PHOTOS_MAX,
  TASK_PHOTO_MAX_MB,
  type TaskPhotoRejection,
} from '../../../helpers/taskPhotos'
import type { TaskPhotoTile } from '../../../helpers/useTaskPhotos'
import bag from '../../../i11n.json'
import { CreateTaskSection } from '../../layout/shared/CreateTaskSection'

export type CreateTaskVisualsSectionProps = {
  /** Photos picked here, as their tiles show them (`useTaskPhotos`). */
  photos: TaskPhotoTile[]
  onFilesAdded: (files: File[]) => void
  onRemoveFile: (index: number) => void
  /** Files the last pick turned away, and why. */
  rejected?: readonly TaskPhotoRejection[]
  /** Photos already on the task (edit). */
  existingImageUrls?: string[]
  /** Bare inside the create flow's step; a titled section on edit. */
  bare?: boolean
  sectionHeading?: string
  /** False when a heading above already says "Photos" (edit, create's photos step). */
  labelled?: boolean
  /** False when the step's description already says what photos are for (create's photos step). */
  helper?: boolean
}

const THUMB = '88px'

const PhotoButton = chakra('button')

/** A thumbnail that opens the photo full screen. */
function PhotoThumb({
  src,
  alt,
  onOpen,
}: { src: string; alt: string; onOpen: () => void }) {
  return (
    <PhotoButton
      type="button"
      onClick={onOpen}
      display="block"
      borderRadius="lg"
      cursor="zoom-in"
      _hover={{ opacity: 0.85 }}
      _focusVisible={sdlFocusRing}
    >
      <Image
        src={src}
        alt={alt}
        boxSize={THUMB}
        objectFit="cover"
        borderRadius="lg"
        borderWidth="1px"
        borderColor="border.default"
      />
    </PhotoButton>
  )
}

/** A dashed tile after the photos that adds more (camera or library on touch screens). */
function AddPhotoTile({
  icon,
  label,
  ...props
}: ComponentProps<typeof Button> & { icon: ReactNode; label: string }) {
  return (
    <Button
      type="button"
      variant="secondary"
      h={THUMB}
      minW={THUMB}
      borderStyle="dashed"
      borderWidth="2px"
      {...props}
    >
      <Stack gap={1} align="center">
        {icon}
        <Text as="span" fontSize="sm">
          {label}
        </Text>
      </Stack>
    </Button>
  )
}

/** Optional photos: public on the task, up to 10, each up to 10 MB. */
export function CreateTaskVisualsSection({
  photos,
  onFilesAdded,
  onRemoveFile,
  rejected = [],
  existingImageUrls = [],
  bare = false,
  sectionHeading = '',
  labelled = true,
  helper = true,
}: CreateTaskVisualsSectionProps) {
  const f = useI11n(bag).fields
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const count = existingImageUrls.length + photos.length
  const full = count >= TASK_PHOTOS_MAX
  // Full screen pages through the photos that can be shown: saved ones
  // first, then the ones picked here, numbered as the tiles are.
  const viewable = [
    ...existingImageUrls.map((src, i) => ({
      src,
      alt: formatMessage(f.savedPhoto, { number: i + 1 }),
    })),
    ...photos.flatMap((photo, i) =>
      photo.src
        ? [
            {
              src: photo.src,
              alt: formatMessage(f.newPhoto, {
                number: existingImageUrls.length + i + 1,
              }),
            },
          ]
        : [],
    ),
  ]
  const viewIndex = (src: string) =>
    viewable.findIndex((item) => item.src === src)

  const rejection = (item: TaskPhotoRejection) =>
    item.reason === 'tooMany'
      ? formatMessage(f.tooManyPhotos, { max: TASK_PHOTOS_MAX })
      : item.reason === 'tooLarge'
        ? formatMessage(f.photoTooLarge, {
            name: item.name,
            size: TASK_PHOTO_MAX_MB,
          })
        : item.reason === 'unsupportedType'
          ? formatMessage(f.photoTypeUnsupported, { name: item.name })
          : formatMessage(f.notAPhoto, { name: item.name })

  return (
    <CreateTaskSection bare={bare} heading={sectionHeading}>
      {/* One field: its label, lead-in and tiles are `labelToControl` (8)
          apart, and a rejected file's reason hangs 4 under the tiles. */}
      <Stack gap="form.controlToHelper">
        <Stack gap="form.labelToControl">
          {labelled || count > 0 ? (
            <HStack gap={2} justify="space-between">
              {labelled ? (
                <HStack gap={2}>
                  <Text
                    fontSize="14px"
                    fontWeight={500}
                    color="text.default"
                    px={1}
                  >
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
          ) : null}
          {helper ? (
            <Text {...formHelperTextStyle} px={1}>
              {f.photosHelper}
            </Text>
          ) : null}

          {/* A photo's remove button hangs 8 above it, so with photos the
              row starts 8 lower: the buttons, not the tiles, are the block's
              visible top, `labelToControl` under the text above. */}
          <Wrap gap={3} align="flex-start" pt={count > 0 ? 2 : 0}>
            {existingImageUrls.map((src, i) => (
              <PhotoThumb
                key={src}
                src={src}
                alt={viewable[i].alt}
                onOpen={() => setPreviewIndex(i)}
              />
            ))}
            {photos.map((photo, i) => {
              const number = existingImageUrls.length + i + 1
              const alt = formatMessage(f.newPhoto, { number })
              const { src } = photo
              return (
                <Box key={photo.key} position="relative">
                  {src ? (
                    <PhotoThumb
                      src={src}
                      alt={alt}
                      onOpen={() => setPreviewIndex(viewIndex(src))}
                    />
                  ) : (
                    <PhotoTile state={photo.state} alt={alt} size={THUMB} />
                  )}
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
              // The back camera, for the job itself.
              <PhotoSourcePicker
                camera="environment"
                multiple
                onFiles={onFilesAdded}
              >
                {(trigger) => (
                  <AddPhotoTile
                    {...trigger}
                    icon={<LuImagePlus size={20} aria-hidden />}
                    label={f.addPhotos}
                  />
                )}
              </PhotoSourcePicker>
            )}
          </Wrap>
        </Stack>

        {rejected.length > 0 ? (
          <Stack gap="form.helperGap" role="alert">
            {rejected.map((item) => (
              <Text
                key={item.reason === 'tooMany' ? 'tooMany' : item.name}
                fontSize="sm"
                lineHeight="20px"
                color="status.danger.fg"
                px={1}
              >
                {rejection(item)}
              </Text>
            ))}
          </Stack>
        ) : null}
      </Stack>

      <ImagePreview
        items={viewable}
        index={previewIndex}
        onIndexChange={setPreviewIndex}
        onClose={() => setPreviewIndex(null)}
      />
    </CreateTaskSection>
  )
}
