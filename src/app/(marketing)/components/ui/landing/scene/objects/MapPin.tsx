'use client'

import { useMemo } from 'react'
import { Path, Shape } from 'three'

import { Plastic } from '../materials'

const HEAD_RADIUS = 0.5
const HEAD_Y = 0.28
const TIP_Y = -0.62
const HOLE_RADIUS = 0.2

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
  bevelThickness: 0.09,
  bevelSize: 0.07,
  bevelSegments: 8,
  curveSegments: 64,
}

/** The location pin from the key art: a soft, bevelled teardrop with a hole. */
export function MapPin() {
  const shape = useMemo(pinShape, [])
  return (
    // Centre the extrusion (y spans -0.62..0.78, z spans 0..0.22).
    <mesh position={[0, -0.08, -0.11]}>
      <extrudeGeometry args={[shape, EXTRUDE]} />
      <Plastic />
    </mesh>
  )
}
