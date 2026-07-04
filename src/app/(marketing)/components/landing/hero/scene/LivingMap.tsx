'use client'

import { useFrame } from '@react-three/fiber'
import { useMemo } from 'react'
import * as THREE from 'three'

import { LANDING_INK, LANDING_ON_INK } from '../../landingPalette'

/**
 * The "living map": a subtly undulating dark terrain with faint topographic
 * contour lines and a map grid. All tones are ink neutrals — green is reserved
 * for the pins/signals so the brand color reads as the scene's light source.
 */

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying float vElevation;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.55;
    for (int i = 0; i < 4; i++) {
      value += amplitude * valueNoise(p);
      p *= 2.03;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vUv = uv;
    vec3 transformed = position;
    float elevation = fbm(position.xy * 0.34 + uTime * 0.025);
    elevation += 0.45 * fbm(position.xy * 0.85 - uTime * 0.018);
    vElevation = elevation;
    transformed.z += elevation * uAmp;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uLow;
  uniform vec3 uHigh;
  uniform vec3 uLine;
  varying float vElevation;
  varying vec2 vUv;

  void main() {
    vec3 color = mix(uLow, uHigh, smoothstep(0.1, 1.35, vElevation));

    // Topographic contour bands.
    float band = fract(vElevation * 7.0);
    float contour = smoothstep(0.0, 0.05, band) * smoothstep(0.11, 0.05, band);
    color = mix(color, uLine, contour * 0.16);

    // Faint survey grid for the map feel.
    vec2 grid = abs(fract(vUv * 36.0) - 0.5);
    float gridLine = smoothstep(0.47, 0.5, max(grid.x, grid.y));
    color = mix(color, uLine, gridLine * 0.05);

    // Radial fade so the terrain melts into the hero background.
    float edge = distance(vUv, vec2(0.5));
    float alpha = smoothstep(0.52, 0.3, edge);

    gl_FragColor = vec4(color, alpha);
  }
`

export function LivingMap({ segments }: { segments: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: 0.6 },
      uLow: { value: new THREE.Color(LANDING_INK.surface) },
      uHigh: { value: new THREE.Color(LANDING_INK.raised) },
      uLine: { value: new THREE.Color(LANDING_ON_INK.muted) },
    }),
    [],
  )

  useFrame((_, delta) => {
    uniforms.uTime.value += delta
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[15, 15, segments, segments]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={VERTEX_SHADER}
        fragmentShader={FRAGMENT_SHADER}
        transparent
        depthWrite={false}
      />
    </mesh>
  )
}
