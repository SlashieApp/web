import {
  MAP_MAJOR_ROADS,
  MAP_MINOR_STREETS,
  MAP_PARKS,
  MAP_RIVER,
  MAP_VIEWBOX,
} from './stageMapArt'

/** The whole sketch: a box of any shape takes the middle of it. */
const WHOLE = `0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`

/**
 * A phone's map header (306 by 216): a crop with streets, a bridge and the
 * river, and no park in its top band, where the phone's clock and signal sit
 * (a grey block behind them reads as a fault, not as a park).
 */
const PHONE_HEADER = '350 160 600 424'

/**
 * The drawn map behind a task in a stage scene: the landing's quiet,
 * monochrome city sketch (`stageMapArt`), cropped to its box. The colours
 * are set in the scene's stylesheet, from the look tokens.
 */
export function StageMap({ phone = false }: { phone?: boolean }) {
  return (
    <svg
      className="sh-map__art"
      viewBox={phone ? PHONE_HEADER : WHOLE}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect
        width={MAP_VIEWBOX.width}
        height={MAP_VIEWBOX.height}
        className="sh-map__land"
      />
      {MAP_MINOR_STREETS.map((d) => (
        <path key={d} d={d} className="sh-map__street" />
      ))}
      {MAP_PARKS.map((park) => (
        <rect
          key={`${park.x}-${park.y}`}
          x={park.x}
          y={park.y}
          width={park.width}
          height={park.height}
          rx={park.radius}
          className="sh-map__park"
        />
      ))}
      <path d={MAP_RIVER} className="sh-map__river" />
      {MAP_MAJOR_ROADS.map((d) => (
        <path key={`casing-${d}`} d={d} className="sh-map__casing" />
      ))}
      {MAP_MAJOR_ROADS.map((d) => (
        <path key={d} d={d} className="sh-map__road" />
      ))}
    </svg>
  )
}
