'use client'

import { Box, Grid, HStack, Stack, Text } from '@chakra-ui/react'
import { LuEyeOff, LuHeart } from 'react-icons/lu'

import { ReportControl } from '@/content/trust/ReportControl'
import { useI11n } from '@/i18n/useI11n'
import { PAGE_GUTTER_X } from '@/theme/pageContainer'
import { HEADER_MIN_HEIGHT } from '@/ui/Header/shell/headerShell'
import { Button, Link } from '@ui'

import { contactHref } from '../helpers/publicProfileLinks'
import {
  type PublicProfileModel,
  profileStats,
  visibleSections,
} from '../helpers/publicProfileModel'
import bag from '../i11n.json'
import {
  PUBLIC_PROFILE_VIEWS,
  type PublicProfilePageConfig,
  type PublicProfileViewName,
} from '../views'
import { PublicProfileAchievements } from './ui/PublicProfileAchievements'
import {
  ProfileContactBar,
  ProfileContactCard,
  ProfileTrustCard,
} from './ui/PublicProfileContact'
import { PublicProfileHero } from './ui/PublicProfileHero'
import { ProfileSection } from './ui/PublicProfileSections'
import {
  PublicProfileSkeleton,
  PublicProfileStatus,
} from './ui/PublicProfileStatus'

const WIDTH = { wide: '1080px', narrow: '720px' } as const
const GAP = { base: 4, md: 6 } as const

export type PublicProfileScreenProps = {
  view: PublicProfileViewName
  /** Null until the profile loads, and for the status views. */
  model: PublicProfileModel | null
  saved?: boolean
  /** Review form for the newest finished job together; null hides the button. */
  reviewHref?: string | null
  excludeTaskId?: string | null
  onSave?: () => void
  onRetry?: () => void
  onBack?: () => void
  /** Fixed clock for the owner's activity stories. */
  now?: Date
}

/** Renders the named view's config; no viewer or status logic of its own. */
export function PublicProfileScreen({
  view,
  model,
  saved = false,
  reviewHref = null,
  excludeTaskId = null,
  onSave,
  onRetry,
  onBack,
  now,
}: PublicProfileScreenProps) {
  const config = PUBLIC_PROFILE_VIEWS[view]

  if (config.layout === 'status') {
    return <PublicProfileStatus config={config} onRetry={onRetry} />
  }
  if (config.layout === 'skeleton' || !model) {
    return (
      <Page width="wide">
        <PublicProfileSkeleton />
      </Page>
    )
  }

  return (
    <ProfilePage
      config={config}
      model={model}
      saved={saved}
      reviewHref={reviewHref}
      excludeTaskId={excludeTaskId}
      onSave={onSave}
      onBack={onBack}
      now={now}
    />
  )
}

function Page({
  width,
  barSpace = false,
  children,
}: {
  width: PublicProfilePageConfig['width']
  /** Room under the content for the phone contact bar. */
  barSpace?: boolean
  children: React.ReactNode
}) {
  return (
    <Box
      px={PAGE_GUTTER_X}
      pt={{ base: 4, md: 8 }}
      pb={barSpace ? { base: 44, lg: 12 } : { base: 10, lg: 12 }}
    >
      <Stack gap={GAP} maxW={WIDTH[width]} mx="auto">
        {children}
      </Stack>
    </Box>
  )
}

function ProfilePage({
  config,
  model,
  saved,
  reviewHref,
  excludeTaskId,
  onSave,
  onBack,
  now,
}: {
  config: PublicProfilePageConfig
  model: PublicProfileModel
  saved: boolean
  reviewHref: string | null
  excludeTaskId: string | null
  onSave?: () => void
  onBack?: () => void
  now?: Date
}) {
  const t = useI11n(bag)
  const name = model.name || t.fallbackName
  const firstName = name.split(/\s+/)[0] || name
  const contact = config.contact
  const contactProps = contact
    ? {
        contact,
        firstName,
        href: contactHref(contact.action, {
          profileUserId: model.id,
          excludeTaskId,
          relatedTaskId: model.viewer?.relatedTaskId ?? null,
        }),
      }
    : null
  const sections = visibleSections(config, model).map((section) => (
    <ProfileSection
      key={section}
      section={section}
      model={model}
      excludeTaskId={excludeTaskId}
    />
  ))
  const reviewLink = config.heroActions.includes('review') ? reviewHref : null
  const actions =
    config.heroActions.includes('save') || reviewLink || config.report ? (
      <>
        {config.heroActions.includes('save') ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            minH="44px"
            onClick={onSave}
            aria-pressed={saved}
            aria-label={saved ? t.hero.savedAria : t.hero.saveAria}
          >
            <Box as="span" display="inline-flex" aria-hidden>
              <LuHeart size={15} fill={saved ? 'currentColor' : 'none'} />
            </Box>
            {saved ? t.hero.saved : t.hero.save}
          </Button>
        ) : null}
        {reviewLink ? (
          <Button asChild variant="secondary" size="sm" minH="44px">
            <Link href={reviewLink} _hover={{ textDecoration: 'none' }}>
              {t.hero.leaveReview}
            </Link>
          </Button>
        ) : null}
        {config.report ? (
          <ReportControl
            kind="user"
            targetId={model.reportTargetId}
            targetTitle={name}
            variant="overflow"
          />
        ) : null}
      </>
    ) : null

  return (
    <Page width={config.width} barSpace={Boolean(contactProps)}>
      {config.ownerBar === 'public' ? (
        <HStack
          justify="space-between"
          gap={3}
          flexWrap="wrap"
          bg="status.success.soft"
          borderWidth="1px"
          borderColor="status.success.border"
          borderRadius="xl"
          px={4}
          py={2}
        >
          <Text fontWeight={600} color="status.success.fg">
            {t.owner.bar}
          </Text>
          <Button asChild size="sm" minH="44px" variant="secondary">
            <Link href="/profile" _hover={{ textDecoration: 'none' }}>
              {t.owner.edit}
            </Link>
          </Button>
        </HStack>
      ) : null}
      {config.ownerBar === 'hidden' ? (
        <HStack
          justify="space-between"
          gap={3}
          flexWrap="wrap"
          bg="status.warning.soft"
          borderWidth="1px"
          borderColor="border.default"
          borderRadius="xl"
          px={4}
          py={3}
        >
          <HStack gap={2} align="flex-start" flex="1" minW="14rem">
            <Box as="span" color="status.warning.fg" mt={0.5} aria-hidden>
              <LuEyeOff size={18} />
            </Box>
            <Stack gap={0.5}>
              <Text fontWeight={700} color="text.default">
                {t.owner.hidden.title}
              </Text>
              <Text fontSize="sm" color="text.muted">
                {t.owner.hidden.body}
              </Text>
            </Stack>
          </HStack>
          <Button asChild size="sm" minH="44px" variant="secondary">
            <Link
              href="/profile?section=visibility"
              _hover={{ textDecoration: 'none' }}
            >
              {t.owner.visibility}
            </Link>
          </Button>
        </HStack>
      ) : null}

      <PublicProfileHero
        model={model}
        stats={profileStats(config.stats, model)}
        actions={actions}
        onBack={onBack}
      />

      {config.width === 'wide' ? (
        <Grid
          templateColumns={{
            base: 'minmax(0, 1fr)',
            lg: 'minmax(0, 1fr) minmax(0, 340px)',
          }}
          gap={GAP}
          alignItems="start"
        >
          <Stack gap={GAP} minW={0}>
            {sections}
          </Stack>
          <Stack
            gap={GAP}
            minW={0}
            position={{ lg: 'sticky' }}
            top={{ lg: `calc(${HEADER_MIN_HEIGHT.md} + 1rem)` }}
          >
            {contactProps ? <ProfileContactCard {...contactProps} /> : null}
            {config.trust ? <ProfileTrustCard model={model} /> : null}
          </Stack>
        </Grid>
      ) : (
        <Stack gap={GAP}>{sections}</Stack>
      )}

      {config.activity ? (
        <PublicProfileAchievements model={model} now={now} />
      ) : null}

      {contactProps ? <ProfileContactBar {...contactProps} /> : null}
    </Page>
  )
}
