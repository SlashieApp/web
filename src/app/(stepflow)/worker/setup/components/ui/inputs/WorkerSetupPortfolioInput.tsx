'use client'

import { Box, HStack, Stack, Text, Wrap } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'
import { LuImagePlus, LuLink, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { apolloClient } from '@/utils/apolloClient'
import { getGraphQLErrorCode } from '@/utils/graphqlErrors'
import { type PhotoRejection, acceptPhotos } from '@/utils/photoPick'
import { uploadPortfolioImage } from '@/utils/portfolioImageUpload'
import {
  AddPhotoTile,
  FormField,
  IconButton,
  PhotoSourcePicker,
  PhotoTile,
} from '@ui'

import {
  PORTFOLIO_PHOTO_MAX_MB,
  PORTFOLIO_URLS_MAX,
  isUploadedPortfolioPhoto,
} from '../../../helpers/workerSetupPortfolio'
import bag from '../../../i11n.json'
import { WorkerSetupOptionalLabel } from '../shared/WorkerSetupOptionalBadge'

const THUMB = '88px'

/** What the API can say about one upload, worded in `serverErrors`. */
const UPLOAD_ERROR_CODES = [
  'UPLOAD_NOT_FOUND',
  'IMAGE_TOO_LARGE',
  'UNSUPPORTED_IMAGE',
  'TOO_MANY_PORTFOLIO_UPLOADS',
] as const

export type WorkerSetupPortfolioInputProps = {
  /** The saved portfolio: uploaded photos, and any links from before uploads. */
  value: string[]
  onChange: (urls: string[]) => void
  /** A form-level error (e.g. more photos than the API keeps). */
  errorText?: string
  /** Hears when photos start and finish uploading: Continue or Save waits meanwhile. */
  onUploadingChange?: (uploading: boolean) => void
  /** Uploads one photo and returns its public URL. Stories pass their own. */
  upload?: (file: File) => Promise<string>
}

const uploadToApi = (file: File) => uploadPortfolioImage(apolloClient, file)

/**
 * Optional photos of finished jobs (`portfolioUrls`, BE-120). A photo is
 * uploaded as soon as it is picked and joins the list once it is on our
 * storage; the list is saved with the step or the form. A link to another
 * host, saved before uploads existed, is never shown on the profile: it is
 * listed apart, as text, with a way to remove it.
 *
 * Form spacing (FE-481): one field. Its tiles, any problems and the old
 * links are `labelToControl` (8) apart; lines of one message block are
 * `helperGap` apart.
 */
export function WorkerSetupPortfolioInput({
  value,
  onChange,
  errorText,
  onUploadingChange,
  upload = uploadToApi,
}: WorkerSetupPortfolioInputProps) {
  const t = useI11n(bag)
  const copy = t.portfolio
  const [pending, setPending] = useState<number[]>([])
  const [problems, setProblems] = useState<string[]>([])
  const nextIdRef = useRef(0)
  // Uploads finish one by one: each adds to the list as it is then.
  const valueRef = useRef(value)
  valueRef.current = value
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const busyRef = useRef(onUploadingChange)
  busyRef.current = onUploadingChange

  const uploading = pending.length > 0
  useEffect(() => {
    busyRef.current?.(uploading)
  }, [uploading])
  // Leaving mid-upload must not leave Continue or Save waiting.
  useEffect(() => () => busyRef.current?.(false), [])

  const photos = value.filter(isUploadedPortfolioPhoto)
  const links = value.filter((url) => !isUploadedPortfolioPhoto(url))
  const count = value.length + pending.length
  const full = count >= PORTFOLIO_URLS_MAX

  const rejection = (item: PhotoRejection) =>
    item.reason === 'tooMany'
      ? formatMessage(copy.full, { max: PORTFOLIO_URLS_MAX })
      : item.reason === 'tooLarge'
        ? formatMessage(copy.photoTooLarge, {
            name: item.name,
            size: PORTFOLIO_PHOTO_MAX_MB,
          })
        : item.reason === 'unsupportedType'
          ? formatMessage(copy.photoTypeUnsupported, { name: item.name })
          : formatMessage(copy.notAPhoto, { name: item.name })

  const failure = (file: File, error: unknown) => {
    const code = getGraphQLErrorCode(error)
    const known = UPLOAD_ERROR_CODES.find((item) => item === code)
    return known
      ? t.serverErrors[known]
      : formatMessage(copy.uploadFailed, { name: file.name })
  }

  const add = async (picked: File[]) => {
    const { accepted, rejected } = acceptPhotos(picked, count, {
      max: PORTFOLIO_URLS_MAX,
      maxMb: PORTFOLIO_PHOTO_MAX_MB,
    })
    setProblems(rejected.map(rejection))
    if (accepted.length === 0) return
    const ids = accepted.map(() => nextIdRef.current++)
    setPending((current) => [...current, ...ids])
    // One at a time: each photo is decoded in memory to shrink it.
    for (let i = 0; i < accepted.length; i += 1) {
      try {
        const url = await upload(accepted[i])
        if (!valueRef.current.includes(url)) {
          const next = [...valueRef.current, url]
          valueRef.current = next
          onChangeRef.current(next)
        }
      } catch (error) {
        const message = failure(accepted[i], error)
        setProblems((current) => [...current, message])
      } finally {
        setPending((current) => current.filter((id) => id !== ids[i]))
      }
    }
  }

  const remove = (url: string) => {
    setProblems([])
    onChange(value.filter((item) => item !== url))
  }

  const hasTiles = photos.length > 0 || pending.length > 0

  return (
    <FormField
      label={<WorkerSetupOptionalLabel>{copy.label}</WorkerSetupOptionalLabel>}
      helperText={
        full
          ? formatMessage(copy.full, { max: PORTFOLIO_URLS_MAX })
          : copy.helper
      }
      errorText={errorText}
    >
      <Stack gap="form.labelToControl" w="full">
        {/* A photo's remove button hangs 8 above it, so with photos the row
            starts 8 lower (the task photos' rule). */}
        <Wrap gap={3} align="flex-start" pt={photos.length > 0 ? 2 : 0}>
          {photos.map((url, i) => (
            <Box key={url} position="relative">
              <PhotoTile
                state="ready"
                src={url}
                alt={formatMessage(copy.photo, { number: i + 1 })}
                size={THUMB}
              />
              {/* 44px target hangs off the corner to cover less of the photo. */}
              <IconButton
                type="button"
                aria-label={formatMessage(copy.removePhoto, { number: i + 1 })}
                position="absolute"
                top={-2}
                right={-2}
                bg="bg.surface"
                boxShadow="e2"
                onClick={() => remove(url)}
              >
                <LuX aria-hidden />
              </IconButton>
            </Box>
          ))}
          {pending.map((id, i) => (
            <PhotoTile
              key={id}
              state="uploading"
              alt={formatMessage(copy.photo, {
                number: photos.length + i + 1,
              })}
              size={THUMB}
            />
          ))}
          {full ? null : (
            // The back camera, for the work itself.
            <PhotoSourcePicker
              camera="environment"
              multiple
              onFiles={(files) => void add(files)}
            >
              {(trigger) => (
                <AddPhotoTile
                  {...trigger}
                  tileSize={THUMB}
                  icon={<LuImagePlus size={20} aria-hidden />}
                  label={copy.add}
                />
              )}
            </PhotoSourcePicker>
          )}
        </Wrap>

        {hasTiles || links.length > 0 ? (
          <Text fontSize="sm" color="text.muted" px={1}>
            {formatMessage(copy.count, { count, max: PORTFOLIO_URLS_MAX })}
          </Text>
        ) : null}

        {problems.length > 0 ? (
          <Stack gap="form.helperGap" role="alert">
            {problems.map((problem) => (
              <Text key={problem} fontSize="sm" color="status.danger.fg" px={1}>
                {problem}
              </Text>
            ))}
          </Stack>
        ) : null}

        {links.length > 0 ? (
          <Stack
            gap="form.labelToControl"
            p={3}
            borderWidth="1px"
            borderColor="border.default"
            borderRadius="lg"
            bg="bg.subtle"
            data-old-links=""
          >
            <Stack gap="form.helperGap">
              <Text fontSize="sm" fontWeight={500}>
                {copy.oldLinksTitle}
              </Text>
              <Text fontSize="sm" color="text.muted">
                {copy.oldLinksBody}
              </Text>
            </Stack>
            <Stack gap="form.alternativesGap">
              {links.map((url) => (
                <HStack
                  key={url}
                  gap={2}
                  pl={3}
                  borderWidth="1px"
                  borderColor="border.default"
                  borderRadius="lg"
                  bg="bg.surface"
                >
                  <Box
                    as="span"
                    display="inline-flex"
                    flexShrink={0}
                    color="text.muted"
                    aria-hidden
                  >
                    <LuLink size={14} strokeWidth={2} />
                  </Box>
                  {/* Text only: an old link is never loaded as an image. */}
                  <Text
                    fontSize="sm"
                    color="text.muted"
                    flex={1}
                    minW={0}
                    truncate
                  >
                    {url}
                  </Text>
                  <IconButton
                    type="button"
                    variant="ghost"
                    aria-label={formatMessage(copy.removeLink, { item: url })}
                    onClick={() => remove(url)}
                  >
                    <LuX size={16} aria-hidden />
                  </IconButton>
                </HStack>
              ))}
            </Stack>
          </Stack>
        ) : null}
      </Stack>
    </FormField>
  )
}
