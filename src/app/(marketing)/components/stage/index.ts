/**
 * The Stageshow kit, as the landing uses it (FE-542): the stage, its frames
 * and the motion parts, vendored under `./kit` (see `./kit/README.md`).
 *
 * Import the kit from here, never from `./kit/...`: this module states the
 * cascade layers' order first (`./layers.css`), so the kit's styles sit above
 * Chakra's reset wherever a scene is used (`stageLayers.test.ts`).
 */
import './layers.css'

export type { Act } from './kit/act'
export { Badge } from './kit/controls/Badge'
export { Button } from './kit/controls/Button'
export type { Rect } from './kit/measure'
export { Collapse } from './kit/motion/Collapse'
export { Count } from './kit/motion/Count'
export { Fly } from './kit/motion/Fly'
export { Roll } from './kit/motion/Roll'
export { States } from './kit/motion/States'
export { Avatar } from './kit/parts/Avatar'
export { Spinner } from './kit/parts/Spinner'
export { Notification, Phone } from './kit/phone'
export { Stage } from './kit/stage'
export { Bar, Window } from './kit/window'
