'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuImageOff, LuLink, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, IconButton, Input, formControlRootProps } from '@ui'

import bag from '../../../i11n.json'
import { WorkerSetupOptionalLabel } from '../shared/WorkerSetupOptionalBadge'

const MAX_PORTFOLIO_ITEMS = 12

/** https only: an http image is blocked or flagged on an https page. */
function isHttpsLink(value: string): boolean {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

/** Thumbnail that falls back to a glyph when the link isn't an image. */
function PortfolioThumb({ url }: { url: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <Box
      boxSize="52px"
      borderRadius="md"
      overflow="hidden"
      bg="bg.subtle"
      borderWidth="1px"
      borderColor="border.default"
      display="flex"
      alignItems="center"
      justifyContent="center"
      color="text.subtle"
      flexShrink={0}
      aria-hidden
    >
      {failed ? (
        <LuImageOff size={18} strokeWidth={2} />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      )}
    </Box>
  )
}

export type WorkerSetupPortfolioInputProps = {
  value: string[]
  onChange: (urls: string[]) => void
}

/** Optional links to photos of finished jobs (`portfolioUrls`). */
export function WorkerSetupPortfolioInput({
  value,
  onChange,
}: WorkerSetupPortfolioInputProps) {
  const copy = useI11n(bag).portfolio
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | null>(null)
  const atCap = value.length >= MAX_PORTFOLIO_ITEMS

  const addDraft = () => {
    const url = draft.trim()
    if (!url) return
    if (!isHttpsLink(url)) {
      setDraftError(copy.notALink)
      return
    }
    if (value.includes(url)) {
      setDraftError(copy.duplicate)
      return
    }
    onChange([...value, url])
    setDraft('')
    setDraftError(null)
  }

  return (
    <FormField
      label={<WorkerSetupOptionalLabel>{copy.label}</WorkerSetupOptionalLabel>}
      helperText={
        atCap
          ? formatMessage(copy.full, { max: MAX_PORTFOLIO_ITEMS })
          : copy.helper
      }
      errorText={draftError ?? undefined}
    >
      <Stack gap={3} w="full">
        {value.length > 0 ? (
          <Stack gap={2}>
            {value.map((url) => (
              <HStack
                key={url}
                gap={3}
                p={2}
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="lg"
                bg="bg.surface"
              >
                <PortfolioThumb url={url} />
                <HStack gap={1.5} flex={1} minW={0} color="text.muted">
                  <Box
                    as="span"
                    display="inline-flex"
                    flexShrink={0}
                    aria-hidden
                  >
                    <LuLink size={13} strokeWidth={2} />
                  </Box>
                  <Text fontSize="sm" truncate>
                    {url}
                  </Text>
                </HStack>
                <IconButton
                  type="button"
                  variant="ghost"
                  aria-label={formatMessage(copy.removeItem, { item: url })}
                  onClick={() => onChange(value.filter((u) => u !== url))}
                >
                  <LuX size={16} aria-hidden />
                </IconButton>
              </HStack>
            ))}
          </Stack>
        ) : null}

        <HStack gap={2} align="stretch">
          <Input
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              if (draftError) setDraftError(null)
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter') return
              e.preventDefault()
              addDraft()
            }}
            placeholder={copy.placeholder}
            type="url"
            inputMode="url"
            disabled={atCap}
            rootProps={{ ...formControlRootProps, flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={addDraft}
            disabled={atCap || !draft.trim()}
            minH="44px"
            flexShrink={0}
          >
            {copy.add}
          </Button>
        </HStack>
      </Stack>
    </FormField>
  )
}
