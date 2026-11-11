# Rehearsal: HeroStage (the landing's hero scene, FE-542)

Gold: `subscriptions` (a system story: a chip flies into a list, a total rolls,
a second scene is the reset). Kept: a window pinned at the top and running off
the bottom, a satellite card on the window's edge, two scenes stacked, the
`Fly held` chip from the card's button into a `Collapse` row, `States` on the
button, `Count` on the total, the loop's shape. Changed: Slashie's look from
the SDL tokens (one green, ink on green, Geist, pill buttons); the content (a
customer's task page with the drawn map and its quotes); one gesture (the
customer accepts a quote, the status rolls Open to Booked, the worker's card
answers); and the compact design, which is its own design (the app on the
kit's `Phone`, each quote announced by a `Notification`, a touch cursor), not
the window squeezed.

Beats: 1 a worker's quote arrives (the price rides from the card into a new
row) … 2 a second, lower quote arrives … 3 the customer accepts it … payoff:
Booked, the row's button says Accepted, the worker's card says "Accepted, Sat
9:00", held 2s … then a second task plays one arrival, which is the reset.
Loop about 21s.

Captured: the real `/home` on a production build (`next build`, `next start`),
widths 1440 and 390, the whole loop (20 frames, 1.15s apart) with `--gate`;
stills at 1440 (English, zh-HK, reduced motion), 1280, 1024, 900, 768, 390
(English, zh-HK) and 320. Reduced motion shows the poster (the booked state),
with no cursor.

Gate (the last lines of `film.mjs --gate` on the loop, 10 Nov 2026):

- 1440: `rehearsal passed (necessary, not sufficient: references/verify.md
  and the fresh eye in review.md still stand)`, no film lines.
- 390: `rehearsal passed (…)`, no film lines.
- Both runs also print `film: inconclusive` with about 150 sampling gaps over
  27ms: the machine that filmed could not sample every frame, so motion inside
  those gaps was not judged by the tool.

Film: each line the tool printed on the host, and what was done.

- `kit override` (six lines, `.ss-avatar`, `.ss-phone__*`) → every frame → not
  a fault of the scene. The tool tells the kit's CSS from a scene's by the
  stylesheet's path, and Next bundles both into one file. The film was run
  with one line changed in a scratch copy of the tool (rules inside
  `@layer stageshow` are the kit's own); the kit parts' computed geometry was
  also compared with the playground's, part by part, and matched.
- `half-pixel glyph` (the star in the worker card's rating, the tick in
  "Quote sent") → fixed: the rating has a whole, even width; a ticked label is
  widened to the next even pixel (`Done`).
- `steps in its box` (the map's price pin) → fixed: the scene's entrance on
  the page is a fade, not the 8px rise the copy uses.
- `unclipped` and `uneven gutters` (the phone) → fixed: the phone design is a
  phone screen wide and the stage is the crop. An earlier try let the shadow
  out with `clip-path`, which the tool does not read as a crop.
- `drift` (the phone's map and task on the page swap) and `handoff shift`
  (the status, the Quotes label and the buttons, 0.6px, on the wide swap) →
  fixed: the page swap is a fade in both designs. The 8px rise of the new
  task slid it against its own map on a phone, and moved the parts both pages
  share on a desktop.
- `layout` (the task column ending 5px short of the window's unseen bottom
  edge once the page's filler was extended) → fixed: the window is tall
  enough to hold the page with three quotes and its padding, so the stage's
  foot is the only crop.
- `steps in its box` (the chips beside the status, pushed along as Open
  becomes Booked) → fixed: each chip keeps a layer.
- `appears with no entrance` (`.ss-count`, the kit's digit roll) → printed in
  some runs and not in others, at the page swap → left: the swap's fade takes
  0.38s and the tool's sampling gaps on this machine reach 0.4s, so in those
  runs it sees the new page whole on its first sample. The part is the kit's.
- `handoff shift` (a filler bar, 3px, on the phone's page swap) → printed
  once → left: two unrelated filler bars of the two pages happen to sit 3px
  apart; they cross-fade.
- Found by eye, not by the tool: grey park shapes under the phone's clock and
  signal (the phone's map now has its own crop); the phone's shadow cut into a
  grey plate at the stage's sides (see `unclipped`); a blank band under a
  short list of quotes (the page's filler now runs off the foot in every
  state); the kit unstyled by Chakra's reset layer (`stage/layers.css`).

Review: no separate reviewer was run (the owner asked for a lean, low-cost
run). The builder went through `references/review.md` and `verify.md` against
the frames instead, which is weaker than a fresh eye. From that pass: the
composition is the product's own (a two-sided quote, the approximate-area map,
no cut), the eye lands on the accepted quote, the window fills 73% of the
stage and the phone 84%, only filler runs off, and nothing rewinds in view.

Assumptions:

- A phone's first screen shows the copy and the top of the phone; the story
  plays once the visitor scrolls (the stage starts when it is in view).
- Below 1024px the phone design is shown, tablets included: the wide design
  scaled under four fifths has text under 10px.
- The second task (one arrival) is enough of a reset; it adds about 6s.

Unresolved:

- Between 1024 and 1279px the wide design is scaled to the column (0.79 at
  1024): legible, but its smallest text is about 9.5px there.

Not checked:

- A real iPhone or Android device, Safari and Firefox (filmed in Chromium
  only). The stylesheet has no nested rules and the kit needs cascade layers
  (Safari 15.4 and later) and `color-mix` (Safari 16.2 and later) for a few
  translucent fills.
- Motion inside the tool's sampling gaps, and the loop past its first two
  rounds.
- The scene with the cookie banner open on a phone, where the banner covers
  the lower part of the first screen.
- Dark mode: the site's theme is forced light.
