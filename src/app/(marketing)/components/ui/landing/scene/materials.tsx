'use client'

import { RoundedBox } from '@react-three/drei'
import type { ComponentProps } from 'react'

import { SCENE_COLORS, type SceneColor } from './scenePalette'

/**
 * The one material of the scene: matte and flat shaded, so every face takes a
 * single tone from the light and a model reads as a handful of planes.
 */
export function Matte({
  color = SCENE_COLORS.neutral200,
}: {
  color?: SceneColor
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={0.85}
      metalness={0}
      flatShading
    />
  )
}

type BevelBoxProps = Omit<
  ComponentProps<typeof RoundedBox>,
  'radius' | 'smoothness' | 'bevelSegments' | 'creaseAngle' | 'color'
> & {
  color?: SceneColor
  /** The bevel's width; keep it small, the box stays a box. */
  bevel?: number
}

/**
 * A plain bevelled box: one chamfer ring of two facets on every edge and
 * square corners, with no smoothing. This is the low-poly building block of
 * every prop.
 */
export function BevelBox({ color, bevel = 0.05, ...props }: BevelBoxProps) {
  return (
    <RoundedBox
      radius={bevel}
      smoothness={1}
      bevelSegments={1}
      creaseAngle={0}
      {...props}
    >
      <Matte color={color} />
    </RoundedBox>
  )
}
