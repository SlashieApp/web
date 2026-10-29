import { Box } from '@chakra-ui/react'
import type { Decorator, Meta, StoryObj } from '@storybook/nextjs-vite'

import messages from '@/app/(marketing)/i11n.json'

import { PhoneMap, PricePin } from './PhoneMap'

const { tasks } = messages.en.landing.phone

/** Story-only: pin spots as fractions of the map, as on the search screen. */
const PINS = [
  { id: 'move', x: 0.47, y: 0.2 },
  { id: 'wardrobe', x: 0.76, y: 0.27 },
  { id: 'paint', x: 0.2, y: 0.5 },
  { id: 'hedge', x: 0.6, y: 0.63 },
  { id: 'clean', x: 0.86, y: 0.49 },
] as const

/** Story-only: price pins laid over the map, `selected` one highlighted. */
function MapWithPins({ selected }: { selected?: (typeof PINS)[number]['id'] }) {
  return (
    <>
      <PhoneMap />
      {PINS.map(({ id, x, y }) => (
        <Box
          key={id}
          position="absolute"
          left={`${x * 100}%`}
          top={`${y * 100}%`}
          transform="translate(-50%, -100%)"
          zIndex={id === selected ? 2 : 1}
        >
          <PricePin price={tasks[id].price} selected={id === selected} />
        </Box>
      ))}
    </>
  )
}

/** Story-only: a phone-screen-sized box, since the map fills its parent. */
const withMapBox: Decorator = (Story) => (
  <Box
    position="relative"
    w="300px"
    h="612px"
    overflow="hidden"
    borderWidth="1px"
    borderColor="border.default"
    borderRadius="lg"
  >
    <Story />
  </Box>
)

/** Story-only: a small window, as the map sits in the post-task location card. */
const withMapWindow: Decorator = (Story) => (
  <Box
    position="relative"
    w="300px"
    h="118px"
    overflow="hidden"
    borderWidth="1px"
    borderColor="border.default"
    borderRadius="10px"
  >
    <Story />
  </Box>
)

/** Story-only: pins sit on a map-coloured patch. */
const withPinBackdrop: Decorator = (Story) => (
  <Box display="inline-block" p={6} borderRadius="lg" bg="bg.subtle">
    <Story />
  </Box>
)

const meta = {
  title: 'Marketing/Landing/PhoneMap',
  component: PhoneMap,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof PhoneMap>

export default meta
type Story = StoryObj<typeof meta>

/** Bare map: the monochrome sketch (neutral parks and river, roads with a hairline casing) and district labels, no pins. */
export const Default: Story = {
  decorators: [withMapBox],
}

/** Zoomed window: a small crop of the map, as in the location card of the post screen. */
export const Zoomed: Story = {
  decorators: [withMapWindow],
  render: () => (
    <PhoneMap
      css={{
        '& svg': { transform: 'scale(1.3)', transformOrigin: '70% 85%' },
      }}
    />
  ),
}

/** Map with five price pins, one highlighted as the selected task. */
export const MapWithPinsSelected: Story = {
  decorators: [withMapBox],
  render: () => <MapWithPins selected="wardrobe" />,
}

/** Map with five price pins and none highlighted. */
export const MapWithPinsUnselected: Story = {
  decorators: [withMapBox],
  render: () => <MapWithPins />,
}

/** Price pin at rest: a white pill with a hairline, the price in green 800 at 600, a grey dot. */
export const Pin: Story = {
  decorators: [withPinBackdrop],
  render: () => <PricePin price={tasks.move.price} selected={false} />,
}

/** Selected price pin: green 400 fill with an ink price, slightly larger, a green dot. */
export const PinSelected: Story = {
  decorators: [withPinBackdrop],
  render: () => <PricePin price={tasks.move.price} selected />,
}
