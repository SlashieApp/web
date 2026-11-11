# Rehearsal: HeroStage (the landing's hero scene, FE-542)

Gold: `subscriptions` (a system story: rows arrive in a list, a count rolls, a
second scene is the reset). Kept: a window pinned at the top and running off
the bottom, two scenes stacked, `Collapse` rows, `Count` on the quotes,
`States` on the actions, the loop's shape.

Rebuilt on 11 Nov 2026 after the owner's review of push 1 ("the task details
layout is way off; the demo and the app should be similar"). The scene is now
the real task page, not a made-up one:

- **Wide (from 1024px):** the web task page at desktop width in a browser
  window. The map header with the task's own price pin, the title and its
  chips (area, date, category, the poster), Preview on the right. Below, the
  summary card (status pill, the owner's headline and subline, Budget, When,
  Location) and the Quotes card, beside the rail (Help & actions, Analytics).
  Every label is the task page's own string (`heroStageCopy.ts` reads the task
  page's bag and the accept dialog's), so the scene changes when the page's
  copy does.
- **Compact (below 1024px):** the same page as the app draws it, on the kit's
  `Phone`: the taller map, the title over it, borderless cards, the pinned
  Preview button across the screen's foot, and the accept dialog as a bottom
  sheet. Each quote is announced by a notification first.

Beats: 1 the customer scrolls down to the quotes (the page's bar turns solid
and takes the title, as the real header does) … 2 a quote arrives at the top
of the list (newest first, the older rows move down) … 3 a second, lower quote
arrives, marked Best match … 4 the customer taps Accept, the accept dialog
asks for the time, they confirm … payoff: the page scrolls back to the top,
the status rolls Open to Awarded, the summary says Worker booked with the
schedule, the worker and the agreed total, and Preview becomes Your worker
with Message. Held 2.4s. Then a second task gets its first quote, which is the
reset. Loop about 22s.

Captured: `/home` and `/zh-hk/home` on a production build (`next build`,
`next start`), widths 1440 and 390, the whole loop (20 frames, 1.15s apart)
with `--gate`; the swap and the payoff filmed frame by frame; stills at 1440
(English, zh-HK, reduced motion), 1280, 390 (English, zh-HK) and 320.

Gate (the last line of `film.mjs --gate` on each loop, 11 Nov 2026):

- en 1440, en 390, zh-HK 1440, zh-HK 390: `rehearsal passed (necessary, not
  sufficient: references/verify.md and the fresh eye in review.md still
  stand)`.

Film: the lines the tool printed, and what was done.

- `framing` and `uneven gutters` (the phone) → fixed: the phone sits one
  32px gutter in from the stage's sides and top and runs 28px off its foot,
  so the pinned button and the accept sheet stay whole above the crop.
- `small text` (Best match, the worker card's label at 8 to 9px) → fixed: the
  phone's screen is laid out at 402 points and scaled to 0.76, so its type is
  set in points with a 14pt floor.
- `clipped` (the summary card wider than the phone's screen) → fixed: the
  subline was a one-line `Roll`; it is a paragraph that wraps, as on the page,
  and changes in place with `States`.
- `tight inset`, `uneven padding` (Your worker and Message) → fixed: Message is
  the kit's `Button` inside the card, inset as far as the card pads.
- `uneven inset` (the poster's chip) → fixed: the avatar sits as far from the
  chip's edge as from its top.
- `uneven padding` (the bar, the sheet, the pinned bar) → fixed: the bar's
  round buttons sit as far in as from its foot; the sheet has no grabber; the
  pinned button has no backdrop, as in the app.
- `covers` (the cursor on Accept's label) → fixed: the taps land beside the
  label.
- `tight control` (Preview under the accept sheet) → fixed: the pinned button
  hides while the sheet covers it.
- The page did not scroll on the phone → fixed: `rect()` gives `x` and `y`,
  not `top`; the scroll target was NaN. It now stops with the Quotes card just
  under the bar, so the newest quote and its Accept are always in view.
- The kit's reset removes every `data-scrolled` attribute (its own scroll
  flag), which the bar used → renamed `data-solid`.
- `near-empty frames` (the payoff) → fixed: the booking, the quotes closing
  and the scroll back all began together, so the scrolled page was blank for
  0.2s. The page now returns to the top first and the booking lands there,
  in view; the cursor leaves while the page moves, not over another quote's
  Accept. The scene swap fades the new page in over the old, which stays
  whole beneath it.
- Left, with reasons:
  - `layout` (the grid ending past the window's foot) and `hard edge` (the
    budget and a pill cut by the bar while the page scrolls): it is a page
    that scrolls under its header, as the real one does.
  - `settle snap` (quote rows, 1.8px, wide only) and `appears, then moves`
    (a `States` item): not visible in the frames; the parts are the kit's.
  - `appears with no entrance` (`.ss-count`) at the swap, as in push 1.
  - `near-tangent` (the notification under the island): the kit's own
    placement.
  - `clipped` (the poster's chip at the screen's edge): the chips run off the
    edge in the app too.

Review: no separate reviewer was run (the owner asked for lean runs). The
builder held the frames against the real page at 1366 and 390
(`fe542/ref/owner-quotes-*`, `owner-booked-1366`): same order, sections,
labels and actions; simplified where the scene needs less (no photos, no
description, no sort menu, no Activity card).

Not checked:

- A real iPhone or Android device, Safari and Firefox (filmed in Chromium).
- Motion inside the tool's sampling gaps, and past the loop's second round.
- Dark mode: the site's theme is forced light.
