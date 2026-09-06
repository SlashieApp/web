'use client'

import {
  Box,
  Center,
  HStack,
  Heading,
  Stack,
  Text,
  chakra,
} from '@chakra-ui/react'
import { useState } from 'react'
import { LuCheck, LuMapPin } from 'react-icons/lu'

import { sdlMotion } from '@/theme/styles'
import { ViewTransition } from '@/ui/ViewTransition'
import { Badge, Card, Link, Rating } from '@ui'

import {
  setWorkerHandoff,
  workerHandoffFor,
  workerVtName,
} from '../helpers/workerCardHandoff'

const MAX_SKILL_CHIPS = 3

function CheckDisc({ size }: { size: number }) {
  return (
    <Box
      as="span"
      aria-hidden
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      boxSize={`${size}px`}
      borderRadius="full"
      bg="action.primary"
      color="text.onGreen"
      flexShrink={0}
    >
      <LuCheck size={Math.round(size * 0.6)} strokeWidth={3.5} />
    </Box>
  )
}

function portraitInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]
  const second = parts[1]
  if (!first) return '?'
  if (!second) return first.slice(0, 2).toUpperCase()
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase()
}

export type WorkerSearchCardProps = {
  workerId: string
  name: string
  avatarUrl?: string | null
  verified?: boolean
  subtitle?: string | null
  ratingLabel?: string | null
  experienceLabel?: string | null
  respondsLabel?: string | null
  serviceAreaLabel?: string | null
  skills?: readonly string[]
  profileHref: string
}

/**
 * Portrait worker directory card: cover photo on top, name and public-safe
 * details stacked below. Arms the listing → profile shared-element morph.
 */
export function WorkerSearchCard({
  workerId,
  name,
  avatarUrl,
  verified,
  subtitle,
  ratingLabel,
  experienceLabel,
  respondsLabel,
  serviceAreaLabel,
  skills = [],
  profileHref,
}: WorkerSearchCardProps) {
  const visibleSkills = skills.slice(0, MAX_SKILL_CHIPS)
  const extraSkillCount = skills.length - visibleSkills.length
  const showPhoto = Boolean(avatarUrl?.trim())
  const [morphing, setMorphing] = useState(
    () => workerHandoffFor(workerId) !== null,
  )

  const armMorph = () => {
    setWorkerHandoff({
      id: workerId,
      name,
      avatarUrl,
      verified,
      subtitle,
      ratingLabel,
      experienceLabel,
      respondsLabel,
      serviceAreaLabel,
      skills,
    })
    setMorphing(true)
  }

  return (
    <Link
      href={profileHref}
      display="block"
      h="full"
      color="text.default"
      _hover={{ textDecoration: 'none', color: 'text.default' }}
      onClick={armMorph}
    >
      <Card
        p={0}
        maxW="full"
        w="full"
        h="full"
        overflow="hidden"
        borderRadius="lg"
        bg="bg.surface"
        boxShadow="card"
        transitionProperty="background-color, border-color, box-shadow"
        transitionDuration={sdlMotion.duration.base}
        transitionTimingFunction={sdlMotion.easing.standard}
        _hover={{ boxShadow: 'e3' }}
      >
        <ViewTransition
          name={morphing ? workerVtName('img', workerId) : undefined}
          share="auto"
          default="none"
        >
          <Box
            position="relative"
            w="full"
            aspectRatio={3 / 4}
            bg="bg.subtle"
            overflow="hidden"
          >
            {showPhoto ? (
              <chakra.img
                src={avatarUrl ?? undefined}
                alt=""
                w="full"
                h="full"
                objectFit="cover"
              />
            ) : (
              <Center h="full">
                <Text
                  fontSize="3xl"
                  fontWeight={700}
                  letterSpacing="-0.03em"
                  color="text.muted"
                >
                  {portraitInitials(name)}
                </Text>
              </Center>
            )}
            {verified ? (
              <Box
                position="absolute"
                right={2}
                bottom={2}
                boxSize="28px"
                borderRadius="full"
                bg="action.primary"
                color="text.onGreen"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderWidth="2px"
                borderColor="bg.surface"
                aria-label="Verified worker"
              >
                <LuCheck size={14} strokeWidth={3.5} aria-hidden />
              </Box>
            ) : null}
          </Box>
        </ViewTransition>

        <Stack gap={1.5} p={3} flex={1} minW={0}>
          <HStack gap={1} minW={0} align="center">
            <ViewTransition
              name={morphing ? workerVtName('name', workerId) : undefined}
              share="vt-text"
              default="none"
            >
              <Heading size="sm" lineHeight="short" lineClamp={1}>
                {name}
              </Heading>
            </ViewTransition>
            {verified ? <CheckDisc size={14} /> : null}
          </HStack>

          {subtitle ? (
            <ViewTransition
              name={morphing ? workerVtName('subtitle', workerId) : undefined}
              share="vt-text"
              default="none"
            >
              <Text
                fontSize="sm"
                color="text.muted"
                lineClamp={2}
                lineHeight="1.4"
              >
                {subtitle}
              </Text>
            </ViewTransition>
          ) : null}

          {ratingLabel || experienceLabel ? (
            <ViewTransition
              name={morphing ? workerVtName('rating', workerId) : undefined}
              share="vt-text"
              default="none"
            >
              <HStack gap={1.5} color="text.muted" fontSize="xs" minW={0}>
                {ratingLabel ? (
                  <Rating value={ratingLabel} size="sm" label="Worker rating" />
                ) : null}
                {ratingLabel && experienceLabel ? (
                  <Text as="span" fontSize="xs" aria-hidden>
                    ·
                  </Text>
                ) : null}
                {experienceLabel ? (
                  <Text fontSize="xs" lineClamp={1}>
                    {experienceLabel}
                  </Text>
                ) : null}
              </HStack>
            </ViewTransition>
          ) : null}

          <ViewTransition
            name={morphing ? workerVtName('area', workerId) : undefined}
            share="vt-text"
            default="none"
          >
            <HStack gap={1} color="text.muted" fontSize="xs" minW={0}>
              <Box as="span" aria-hidden display="inline-flex" flexShrink={0}>
                <LuMapPin size={12} strokeWidth={2} />
              </Box>
              <Text lineClamp={1}>
                {serviceAreaLabel
                  ? `Serves ${serviceAreaLabel}`
                  : 'Service area not set'}
              </Text>
            </HStack>
          </ViewTransition>

          {respondsLabel ? (
            <ViewTransition
              name={morphing ? workerVtName('responds', workerId) : undefined}
              share="vt-text"
              default="none"
            >
              <HStack gap={1.5} fontSize="xs" minW={0}>
                <CheckDisc size={12} />
                <Text color="text.muted" lineClamp={1}>
                  {respondsLabel}
                </Text>
              </HStack>
            </ViewTransition>
          ) : null}

          {visibleSkills.length > 0 ? (
            <ViewTransition
              name={morphing ? workerVtName('skills', workerId) : undefined}
              share="auto"
              default="none"
            >
              <HStack gap={1.5} flexWrap="wrap" pt={0.5}>
                {visibleSkills.map((skill) => (
                  <Badge key={skill} variant="neutral" shape="pill" size="sm">
                    {skill}
                  </Badge>
                ))}
                {extraSkillCount > 0 ? (
                  <Badge variant="neutral" shape="pill" size="sm">
                    +{extraSkillCount}
                  </Badge>
                ) : null}
              </HStack>
            </ViewTransition>
          ) : null}
        </Stack>
      </Card>
    </Link>
  )
}
