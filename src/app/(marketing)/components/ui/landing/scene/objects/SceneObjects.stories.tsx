import { Box } from '@chakra-ui/react'
import { Center } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import type { ComponentType } from 'react'
import { expect, waitFor } from 'storybook/test'
import { NeutralToneMapping } from 'three'

import { SceneLights } from '../SceneLights'
import { type SceneObjectId, poseFor } from '../formations'
import { Boxes as BoxesModel } from './Boxes'
import { MapPin as MapPinModel } from './MapPin'
import { Toolbox as ToolboxModel } from './Toolbox'

/**
 * Story-only: one object alone on the page's white (`bg.surface`), centred, in
 * the angle it has in the hero formation, lit and tone mapped like the landing
 * scene.
 */
function ObjectStage({
  id,
  Model,
  distance,
}: {
  id: SceneObjectId
  Model: ComponentType
  /** Camera distance: larger objects sit further back. */
  distance: number
}) {
  const { rx, ry, rz } = poseFor(id, 'hero', false)
  return (
    <Box
      w="full"
      maxW="32rem"
      h="26rem"
      borderRadius="lg"
      borderWidth="1px"
      borderColor="border.default"
      overflow="hidden"
      bg="bg.surface"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, distance], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.toneMapping = NeutralToneMapping
        }}
        aria-hidden
      >
        <SceneLights />
        <group rotation={[rx, ry, rz]}>
          <Center>
            <Model />
          </Center>
        </group>
      </Canvas>
    </Box>
  )
}

/** Gallery of the three procedural landing objects, each alone and centred. */
const meta = {
  title: 'Marketing/Landing/SceneObjects',
  parameters: { layout: 'padded' },
  // Each model draws a canvas.
  play: ({ canvasElement }) =>
    waitFor(
      () => expect(canvasElement.querySelector('canvas')).not.toBeNull(),
      { timeout: 15000 },
    ),
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Toolbox: a zinc body with a white rim, a carry handle with a green grip, a hammer and a spanner in the tray. */
export const Toolbox: Story = {
  render: () => (
    <ObjectStage id="toolbox" Model={ToolboxModel} distance={5.2} />
  ),
}

/** Boxes: a small stack of three white and zinc boxes, the top one strapped in green. */
export const Boxes: Story = {
  render: () => <ObjectStage id="boxes" Model={BoxesModel} distance={5.6} />,
}

/** Map pin: the faceted zinc teardrop with a green disc in its hole. */
export const MapPin: Story = {
  render: () => <ObjectStage id="pin" Model={MapPinModel} distance={5} />,
}
