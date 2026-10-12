'use client'

import { SCENE_COLORS } from './scenePalette'

/** Glossy toy plastic: the look of the reference key art. */
export function Plastic({
  color = SCENE_COLORS.plastic,
}: {
  color?: string
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={0.32}
      clearcoat={1}
      clearcoatRoughness={0.18}
    />
  )
}

export function Metal() {
  return (
    <meshStandardMaterial
      color={SCENE_COLORS.metal}
      metalness={0.85}
      roughness={0.28}
    />
  )
}

export function Cardboard({
  color = SCENE_COLORS.cardboard,
}: {
  color?: string
}) {
  return <meshStandardMaterial color={color} roughness={0.88} />
}

export function Wood() {
  return <meshStandardMaterial color={SCENE_COLORS.wood} roughness={0.55} />
}

export function Fabric() {
  return <meshStandardMaterial color={SCENE_COLORS.fabric} roughness={0.95} />
}
