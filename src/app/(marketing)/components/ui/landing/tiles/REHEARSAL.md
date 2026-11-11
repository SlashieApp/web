# Rehearsal: CustomerTiles (the landing's customer tiles, FE-542 push 2)

Gold: `bento` (a mixed feature grid: one hero UI tile, a stat, an object, a
component, a diagram; one stage per tile at the tile's width; each tile plays
one beat, once, staggered). Kept: one stage per picture measured to its slot
(`usePictureWidth`), the before and after states with `play="once"`, the
110ms stagger in reading order, the copy as page text above each picture, the
tile owning the crop. Changed: a ruled grid on the page's own white instead
of rounded tiles on a ground (the marketing frame already has rails and
rules); Slashie's look (`stage/stageLook.css`); five tiles that are the
customer's five steps; the product's own chat bubbles and stars instead of
the kit's iMessage thread; no window chrome at all (the hero scene above has
the page's one window).

Plan (written before building):

| Tile | Span | Kind | The one thing | Words |
| --- | --- | --- | --- | --- |
| post | 2 x 1 | Hero UI | the post form, one component | "Post a task in a minute" + one sentence |
| quotes | 1 x 1 | Collection | price chips, one picked | "Compare quotes" + one sentence |
| hire | 1 x 1 | Stat | 0%, Slashie's cut | "Hire and pay directly" + one sentence |
| chat | 1 x 1 | Component | two messages | "Message once you accept" + two sentences |
| review | 1 x 1 | Component | five stars | "Leave a review" + one sentence |

Checked against the grid rules: three of five tiles show product UI; the form
is the one hero; no tile is a window; every neighbour is a different kind,
across and down; no string, person or price repeats from tile to tile, or
from the hero scene.

Beats: one each, once, as the grid scrolls in, 110ms apart: the form's button
settles from Post task to Posted … the chips arrive in turn, the lowest price
picked … the reply lands … the stars fill, one after another. The stat holds
still. About 2 seconds for the set.

Captured: the real `/home` on a production build, widths 1440, 1024, 768 and
390, the set's beats (10 frames, 0.25s apart) with `--gate`; stills in
English and zh-HK.

Gate (the last line of `film.mjs --gate`, 11 Nov 2026): see the ticket
comment for the run on the pushed commit. Runs print `film: inconclusive`
with sampling gaps: the machine that filmed could not sample every frame.

Film: each line the tool printed, and what was done.

- `loose stack` (a label 10.8px of ink above its field) → fixed: a label sits
  4px above its field.
- `near-tangent` (the form 2px short of its stage's foot) → fixed: the stage
  is the form's own height, to the pixel.
- `uneven gutters` (on a phone the form had 16px beside it and 34 under it) →
  fixed: under its picture a tile keeps the gutter it has beside it.
- `steps in its box` (a field's text moving by layout as the page loaded) →
  fixed: before it is measured a picture is its desktop width, so a desktop
  page loads with its pictures already the right size.
- `translucent icon` (the empty stars) → fixed: an empty star is filled with
  the surface, so the icon is opaque at both ends of its change.
- Found by eye: a quote chip cut by the tile's edge mid-price (a tile now
  shows only the chips that fit whole).

Review: no separate reviewer was run (the owner asked for a lean, low-cost
run). The builder went through `references/bento.md`, `review.md` and
`verify.md` against the frames, which is weaker than a fresh eye.

Assumptions:

- The tiles' copy is the five steps' existing titles and bodies; the stat's
  figure (0%) is Slashie's real cut of the job.
- Reduced motion and no JS show each picture's finished state.

Unresolved:

- Row 2's tiles are as tall as the tallest (the chat tile's two-sentence
  body), which leaves air under the figure and the stars on a desktop.
- Narrower than a desktop column, a picture is re-laid out once when the page
  hydrates (its width is measured in the browser). It is below the fold.

Not checked:

- A real phone, Safari and Firefox (filmed in Chromium only).
- Motion inside the tool's sampling gaps.
- Between pushes 2 and 3 the customer's steps appear twice on the page (the
  tiles and the phone story's first act): known, and ends with push 3.
