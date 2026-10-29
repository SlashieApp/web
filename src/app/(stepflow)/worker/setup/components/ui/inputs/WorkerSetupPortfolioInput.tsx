'use client'

import { Box, HStack, Stack, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { LuImageOff, LuLink, LuX } from 'react-icons/lu'

import { formatMessage } from '@/i18n/loadPageI11n'
import { useI11n } from '@/i18n/useI11n'
import { Button, FormField, IconButton, Input, formControlRootProps } from '@ui'

import {
  PORTFOLIO_URLS_MAX,
  PORTFOLIO_URL_MAX_LENGTH,
  portfolioUrlProblem,
} from '../../../helpers/workerSetupPortfolio'
import bag from '../../../i11n.json'
import { WorkerSetupOptionalLabel } from '../shared/WorkerSetupOptionalBadge'

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
  /** A form-level error (e.g. a saved link the rules now refuse). */
  errorText?: string
}

/**
 * Optional links to photos of finished jobs (`portfolioUrls`).
 *
 * Form spacing (FE-481): one composite field. The saved links (8 apart) and the
 * add row are `labelToControl` (8) apart, and the input and Add sit `inlineGap`
 * (12) apart, both 48 tall.
 */
export function WorkerSetupPortfolioInput({
  value,
  onChange,
  errorText,
}: WorkerSetupPortfolioInputProps) {
  const copy = useI11n(bag).portfolio
  const [draft, setDraft] = useState('')
  const [draftError, setDraftError] = useState<string | null>(null)
  const atCap = value.length >= PORTFOLIO_URLS_MAX

  const addDraft = () => {
    const url = draft.trim()
    if (!url || atCap) return
    const problem = portfolioUrlProblem(url)
    if (problem) {
      setDraftError(
        problem === 'tooLong'
          ? formatMessage(copy.tooLong, { max: PORTFOLIO_URL_MAX_LENGTH })
          : copy.notALink,
      )
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
          ? formatMessage(copy.full, { max: PORTFOLIO_URLS_MAX })
          : copy.helper
      }
      errorText={draftError ?? errorText}
    >
      <Stack gap="form.labelToControl" w="full">
        {value.length > 0 ? (
          <Stack gap="form.alternativesGap">
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

        <HStack gap="form.inlineGap" align="stretch">
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
            maxLength={PORTFOLIO_URL_MAX_LENGTH}
            type="url"
            inputMode="url"
            disabled={atCap}
            rootProps={{ ...formControlRootProps, flex: 1 }}
          />
          <Button
            type="button"
            variant="secondary"
            size="form"
            onClick={addDraft}
            disabled={atCap || !draft.trim()}
            flexShrink={0}
          >
            {copy.add}
          </Button>
        </HStack>
      </Stack>
    </FormField>
  )
}
