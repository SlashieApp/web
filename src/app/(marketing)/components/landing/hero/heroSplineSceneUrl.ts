/**
 * Spline scene URL for the marketing hero 3D human.
 *
 * TODO(FE-80): Replace with a Slashie-branded worker / local-help scene when
 * the production `.splinecode` URL is ready. The URL below is a temporary
 * stand-in so the Spotlight + Spline split layout can ship.
 */
export const HERO_SPLINE_SCENE_URL =
  process.env.NEXT_PUBLIC_HERO_SPLINE_SCENE_URL?.trim() ||
  'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode'
