'use client'

import { useMemo } from 'react'
import { Path, Shape } from 'three'

import { Matte } from '../materials'
import { SCENE_COLORS } from '../scenePalette'

const HEAD_RADIUS = 0.5
const HEAD_Y = 0.28
const TIP_Y = -0.62
const HOLE_RADIUS = 0.2
/** Sides round the hole and the disc in it: few enough to see the facets. */
const SIDES = 8

/** Teardrop outline: a circle with tangent lines down to the tip, plus a hole. */
function pinShape(): Shape {
  const spread = Math.acos(HEAD_RADIUS / (HEAD_Y - TIP_Y))
  const right = -Math.PI / 2 + spread
  const left = -Math.PI / 2 - spread
  const shape = new Shape()
  shape.moveTo(0, TIP_Y)
  shape.lineTo(
    Math.cos(right) * HEAD_RADIUS,
    HEAD_Y + Math.sin(right) * HEAD_RADIUS,
  )
  shape.absarc(0, HEAD_Y, HEAD_RADIUS, right, left + Math.PI * 2, false)
  shape.lineTo(0, TIP_Y)
  const hole = new Path()
  hole.absarc(0, HEAD_Y, HOLE_RADIUS, 0, Math.PI * 2, true)
  shape.holes.push(hole)
  return shape
}

const EXTRUDE = {
  depth: 0.22,
  bevelEnabled: true,
  bevelThickness: 0.07,
  bevelSize: 0.06,
  bevelSegments: 1,
  // Three.js cuts an arc into twice this many segments, so a full turn (the
  // hole) gets SIDES and the head's arc a few more.
  curveSegments: SIDES / 2,
}

/**
 * The location pin: a faceted, bevelled teardrop in zinc with a green disc
 * seated in its hole (the selected pin of the product's map).
 */
export function MapPin() {
  const shape = useMemo(pinShape, [])
  return (
    // Centre the extrusion (y spans -0.62..0.78, z spans 0..0.22).
    <group position={[0, -0.08, -0.11]}>
      <mesh>
        <extrudeGeometry args={[shape, EXTRUDE]} />
        <Matte color={SCENE_COLORS.neutral200} />
      </mesh>
      <mesh position={[0, HEAD_Y, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[HOLE_RADIUS, HOLE_RADIUS, 0.3, SIDES]} />
        <Matte color={SCENE_COLORS.accent} />
      </mesh>
    </group>
  )
}
