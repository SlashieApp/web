'use client'

import { Box, HStack, Stack, Text, chakra } from '@chakra-ui/react'
import { useState } from 'react'
import { LuImageOff, LuLink, LuX } from 'react-icons/lu'

import { sdlFocusRing } from '@/theme/styles'
import { Button, FormField, Input, formControlRootProps } from '@ui'

const MAX_PORTFOLIO_ITEMS = 12

const RemoveButton = chakra('button')

function looksLikeUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

/** Thumbnail that falls back to a link glyph when the URL isn't an image. */
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

/**
 * Portfolio as an add-item list with previews (ticket 1.6). Same
 * `portfolioUrls` string[] wire format as before.
 */
export function WorkerSetupPortfolioInput({
  value,
  onChange,
}: WorkerSetupPortfolioInputProps) {
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | null>(null)

  const atCap = value.length >= MAX_PORTFOLIO_ITEMS

  const addDraft = () => {
    const url = draft.trim()
    if (!url) return
    if (!looksLikeUrl(url)) {
      setDraftError('Enter a full link starting with http:// or https://')
      return
    }
    if (value.includes(url)) {
      setDraftError('That link is already in your portfolio.')
      return
    }
    onChange([...value, url])
    setDraft('')
    setDraftError(null)
  }

  return (
    <FormField
      label="Work photos & links"
      helperText="Workers with photos win more quotes. Add links to photos of finished jobs — two or more works best."
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
                pr={2.5}
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
                <RemoveButton
                  type="button"
                  aria-label={`Remove ${url}`}
                  onClick={() => onChange(value.filter((u) => u !== url))}
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  boxSize="28px"
                  borderRadius="full"
                  cursor="pointer"
                  color="text.muted"
                  _hover={{ bg: 'bg.subtle', color: 'text.default' }}
                  _focusVisible={sdlFocusRing}
                >
                  <LuX size={14} strokeWidth={2.5} aria-hidden />
                </RemoveButton>
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
            placeholder="https://example.com/finished-kitchen.jpg"
            inputMode="url"
            disabled={atCap}
            rootProps={{ ...formControlRootProps, flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            onClick={addDraft}
            disabled={atCap || !draft.trim()}
            flexShrink={0}
          >
            Add
          </Button>
        </HStack>
      </Stack>
    </FormField>
  )
}
