# Slashie marketing landing

`/home`: a scroll story that introduces Slashie. A white page with a
server-rendered narrative: the hero and its scene (the product doing its job,
see Hero scene), then an HTML phone that demos the real app as you scroll
(pinned beside the steps on desktop, inline in each step on a tablet, and on
a phone docked at the screen's foot while each act's steps ride across, see
The sideways story). Lives
inside the production app (Chakra v3 + SDL tokens): **no Tailwind, no
styling-system fork** (FE-205).

> **FE-542.** The page is being redesigned around Stageshow scenes and demos
> that look like the real app. Done: the hero's scene (the real task page) and
> its Post a task action; the sideways story on phones; the 3D props, the map
> panel and their packages (`three`, `@react-three/*`) are removed (11 Nov
> 2026). In hand: the phone demos, rebuilt from the app's own screens.

## Run / build

```bash
bun install
bun run dev        # http://localhost:3000/home
bun run build
```

## Story

| Stage | Copy (`landing.story`) | Phone screen |
| --- | --- | --- |
| `hero` | hero heading + Post a task field + the hero scene, then (until the first step) the bento | Search (customer) |
| `post` · `quotes` · `hire` · `chat` · `review` | customer act | Post · Quotes · Hire · Chat · Review |
| `workerFind` · `workerQuote` · `workerProfile` | worker act | Search (worker) · Quote form · Profile |
| `trust` · `pricing` | the trust row, live pricing | (phone has left) |
| `cta` | Post a task / Become a worker | |

## Architecture

```
home/page.tsx                server shell: metadata, live pricing, section order
components/ui/landing/
  LenisRoot.tsx              smooth scroll (skipped under reduced motion)
  Reveal.tsx · Magnetic.tsx  scroll reveal (fade, 8px rise, 400ms, once) · magnetic CTA
  hero/HeroSection.tsx       the centred hero: h1, body, task pill, trust checks, the worker's Browse tasks line, then the scene
  hero/HeroTaskCta.tsx       the 52px "What do you need done?" pill + green Post a task pill (sign-up, then Post a task with the text as its title)
  stage/
    HeroStage.tsx            the hero scene on the Stageshow kit: a wide design (browser window + a worker's quote card) and a compact one (the app on a phone)
    heroStage.css            its styles, flat (no nesting), colours from the look tokens
    StageMap.tsx             the drawn map behind a task (the art is `stageMapArt.ts`: river, roads, parks, streets)
    REHEARSAL.md             what was filmed and checked, and what was not
  ../../stage/               the vendored Stageshow kit (`kit/`), its entry module and the cascade-layer order (see Hero scene)
  story/
    storyState.ts            module store: active stage, pointer, scene-ready
    StoryTracker.tsx         stage markers + IntersectionObserver on the viewport middle
    LandingStory.tsx         the hero, then how it works: the acts as hairline rows, the pinned phone
    StoryIndex.tsx           the section index (vertical from lg, a sticky row below), driven by the tracker
    StoryRail.tsx            on a phone (below md): an act pinned under the index, its steps as cards that ride across, a docked phone
    storyRail.ts             pure: the rail's scroll maths (each step holds, then moves; where a link lands) (unit-tested)
    storySteps.ts            pure: the steps of each act, the rows' ids, the index's groups (unit-tested)
    storyLayout.ts           header, index row and scroll-margin measures
  phone/
    PhoneFrame.tsx           device chrome; 375x812 screens scaled to the frame width · PhoneCrop, the inline phone's 340px well
    PhoneDemo.tsx            stage -> screen; StickyPhone (desktop) / DockedPhone (the rail's, on a phone) / StepPhone (inline: tablet, reduced motion); a phone is named by its step
    screens/*                one scripted beat per screen (useDemoBeat: tap or autoplay), each with a `compact` layout for the cropped phone
    PhoneMap.tsx             the drawn monochrome map + the app's price pins (white pills)
    phoneParts.tsx           tab bar, hotspot, avatar, card, primary button
  bento/
    BentoSection.tsx         the bento: three hairline-divided cells, each a step and its snippet
    BentoSnippets.tsx        the three live snippets: post form, quote rows, accepted row
    useSnippetEntrance.ts    the snippets' once-only entrance (static | waiting | playing)
  sections/                  TrustSection (the trust row) · PricingTeaser (two plan cards and a pill) · FinalCtaBand (the closing call: heading, body, two pills)
                             FloatingPostPill (the ink "Post a task" pill fixed bottom-centre) · floatingPillWatch.ts (when it shows: pure, unit-tested)
                             landingPricing.ts (the plan cards' lines from live pricing, in the page's language: pure, unit-tested)
```

## Frame and rhythm

The page is white (`bg.surface`).
The shared frame lives in `../layout/MarketingFrame.tsx` and every marketing
section builds on it:

- `MarketingFrame` wraps the sections (not the footer): from `lg` it draws a
  1px `border.default` rail down each side of the page column (`sizes.page`,
  the same measure as `<Container>` and the header) for the full height. The
  rails start one header height above the frame, under the sticky header (like
  the hero glow), so at the top of the landing, over the transparent header,
  they run in from the screen's edge instead of starting in mid-air; the solid
  header covers that stretch and they meet its border.
- `SectionRule` is a full-width 1px rule between two sections; it runs across
  the rails. `home/page.tsx` puts one between each section it assembles (and
  around the bento it passes to `LandingStory`).
- `SectionHead` is the left-aligned section head: a small green 600 icon and
  the eyebrow, then the heading (34/41 on a phone, 44/48 from `lg`, 500) and
  an optional body. Only the hero and the closing call to action are centred.
- `SECTION_PY` is the section's vertical padding: 56px on a phone, 80 on a
  tablet, 96 on a laptop, 128 on a wide screen.
- Motion: `Reveal` fades in with an 8px rise over 400ms on the decelerate
  curve, once. Reduced motion (and no JS) shows the content as it is.
- **One green fill per screen, the header included.** The marketing header's
  Get started (Open in app on a phone) is the green primary only while no
  green action of the page's own is in view. It is secondary while the hero's
  Post a task pill, the closing call's green Post a task (the landing and the foot
  of `/about`) or the paid plan's action on `/pricing` is on screen;
  `layout/pageGreenWatch.ts` watches the buttons that carry
  `data-page-green-action` (the buttons, not the sections around them) and the
  header reads it (`quiet`). The moment none is on screen the header's action
  is the green one again, so no scroll position is left without a green main
  action. On a page with no such button (the legal pages) it is the screen's
  one green button. A button can arrive after the header (the pricing page
  streams in behind its loading frame) or leave with its page: the watch picks
  marked buttons up and drops them as they come and go. A new green action of a
  page's own carries the hook. This is a decision, not an accident: if Ryan
  wants the header's green to stay beside the page's, record that exception on
  FE-471 and drop the `pageGreen` term in `MarketingHeader`.
- **Focus and the cookie banner.** `globals.css` gives `<html>` a
  `scroll-padding-bottom` of the open cookie banner's height
  (`--cookie-banner-height`, published while the banner is open) plus 16px, 0
  when it is closed. A control that takes keyboard focus, or a pin that scrolls
  its card into view, stops above the banner instead of under it (WCAG 2.4.11
  Focus Not Obscured); the banner's own buttons are the last stops on the page.
- `SectionHead` takes `size`: `display` (default) is 34/41 on a phone and 44/48
  from `lg`; `title` is 34/41 at every width, for a section that sits under a
  page title of its own (the page header's title is 34/41), so the section's
  head never out-sizes the page's h1.

## Hero

The one centred section (`hero/HeroSection.tsx`), built from tokens only:

- The h1 is `display-2xl` (72/72 at 500, -0.045em; 44/46 on a phone) with
  `text-wrap: balance`; the body is `text-lg` in `text.muted`, also balanced.
- **The action is Post a task** (FE-542; it was a search). One 52px pill
  (`HeroTaskCta`, the `Input` primitive with `pill`: a 1px `border.strong`
  hairline, `border.focus` ring on focus, a `text.subtle` placeholder) asks
  "What do you need done?", with the green Post a task pill inside it.
  Submitting goes to `/register?next=/tasks/create?title=<text>`: sign-up
  first (a new visitor has no account), then Post a task, which starts with
  the text as the task's title (`createTaskStartTitle.ts`, in the create flow:
  one line, at most 120 characters, a draft's own title wins). Empty goes to
  the same place with no title. A visitor who already has a session skips
  sign-up and goes straight to the form; so do the closing call's and the
  floating pill's links (`sections/landingCtaPath.ts`, from the session
  cookie the page reads, as `/about` and `/pricing` do). The pill is the
  hero's only green fill; the
  header's Get started stays secondary while it is on screen (the pill carries
  `data-page-green-action`, the header watches the button, not the hero, so
  once it has scrolled away the header's Get started is the green one).
- The trust row is a list: a green 600 check (`accent.active`) and the text in
  `text.muted`.
- **A worker's way in** is one quiet line under the checks: "Looking for
  work?" in `text.muted`, then Browse tasks, a `text.link` text action to the
  public search (`/search`) that underlines on hover and focus (never green
  400). Its line is 20px tall, too small to tap, so the link is a 44px target:
  padding round the text, with the extra 24px given back as a negative margin
  (FE-288's rule, on the link that replaced "See how it works": the scene
  right below now shows how it works).
- **One no-fee sentence** (FE-288). The body ends "Slashie takes no cut of the
  job", the trust row's first point is the same sentence and the hero's first
  check is its short form, "No cut of the job"; the phone's accepted card and
  the page description use the sentence too, in both languages. It was said
  four ways ("No platform cut of the job", "No job fee", "No platform cut from
  the job", "no platform fee"), which read as four promises.
- **Rhythm.** The h1 sits `SECTION_PY` under the header (56px on a phone up to
  128px). Under the last line the copy keeps 24px on a phone and 32 from a
  tablet (`HERO_PB`); the scene adds its own gutter above its window (16 on a
  phone, 44 on a desktop), so the product sits 40 or 76px under the copy: one
  group. The scene runs down to the section's foot, and the rule under the
  hero is the edge its window runs off. (With no scene the hero closes with
  the old foot, `HERO_PB_BARE`: 56 / 64 / 80 / 96px.)
- A faint radial grey (`bg.subtle` fading to nothing, `data-hero-glow`) sits
  behind the top of the page. It starts under the sticky header so there is no
  seam.
- The entrance is the `fade-rise` keyframe (a fade with an 8px rise, 400ms on
  the decelerate curve, once, staggered 60ms); the scene fades in after the
  copy with no rise (a moving box would carry its small text across half
  pixels). Reduced motion turns both off.

## Hero scene

`stage/HeroStage.tsx` (FE-542): a picture of the product doing its job, built
with the Stageshow kit and filmed with its tools (`stage/REHEARSAL.md`). It
replaced the grey map panel and the 3D props (removed 11 Nov 2026), which
showed nothing of the product.

- **It is the real task page (11 Nov rebuild).** The owner's review of push
  1: the demo must look like the app. The scene is the customer's own task
  page, with the page's layout and the page's strings (`heroStageCopy.ts`
  reads the task page's bag and the accept dialog's, so the scene follows the
  page's copy). From `lg` (1024px, the site's desktop split) it is the web
  page in a browser window: the map header, the title and chips, Preview, the
  summary card and Quotes beside Help & actions and Analytics. Below `lg` it
  is the same page as the app draws it, on a phone: the taller map, borderless
  cards, the pinned Preview button, the accept dialog as a bottom sheet, and
  a notification for each quote.
- **One story.** The customer scrolls down to the quotes; two quotes arrive
  at the top of the list; they accept the Best match and confirm its time;
  the page goes back to the top, where the status is Awarded, the summary
  says Worker booked, and Preview has become Your worker with Message. A
  second task then gets its first quote, which is how the loop starts again
  without anything rewinding in view. About 22 seconds a loop.
- **Framing.** The wide stage is the page column (1216 by 600) on the page's
  own white, no plate: the window is pinned near the top and runs off the
  bottom. The phone stage is a phone screen wide (390 by 690, the host takes
  back the page's 16px gutters): the phone sits a 32px gutter in from the
  sides and top and runs off the foot. Only the page's lower parts run off;
  the quotes being acted on, their buttons and the sheet are whole.
- **It is one picture.** `role="img"` with one label (`heroStage.label`);
  nothing in it takes focus (the kit's buttons are spans) and its markup has
  no headings or landmarks. Its words are real copy (`landing.heroStage`, en
  and zh-HK), and `heroStage.test.ts` holds the copy to what the script plays.
- **It plays only on screen.** The kit's stage starts its script when it is in
  view and stops it when it is not (and when the tab is hidden). Reduced
  motion shows the still poster instead (the booked state, the frame that
  tells the story on its own); no JS shows the first frame (the task with one
  quote).
- **The kit is vendored** under `(marketing)/components/stage/kit` (38 files,
  MIT, React only; `kit/README.md` says where it came from and how to refresh
  it). Scenes import it through `(marketing)/components/stage` (the entry
  module), never from `kit/` directly.
- **Cascade layers.** The kit's styles live in `@layer stageshow`, so a scene
  restyles a part with a plain class. Chakra's reset lives in a layer too and
  zeroes every margin, padding and border; a layer named first sits lowest,
  and the kit's stylesheet loads before Chakra's style tags. So the entry
  module first states the order (`stage/layers.css`: Chakra's four layers,
  then `stageshow`). Without it the window's bar and the badges lose their
  padding. `stageLayers.test.ts` checks the names against Chakra's, that the
  entry states the order before any kit module, and that nothing imports the
  kit past the entry.
- **Styles are flat and tokenised.** `heroStage.css` has no nested rules
  (Safari before 17.2 drops them whole) and no raw colours: the kit's look
  tokens are set from the SDL's (`--chakra-colors-*`), the label on green is
  ink, never white. Biome skips the vendored `kit/` folder only.

## Bento

The bento (`bento/BentoSection.tsx`) is the customer's first three steps as
three cells divided by hairlines: "Post a task in a minute", "Compare quotes"
and "Hire and pay directly" (`landing.story.customer.steps`, title and body as
they are). `home/page.tsx` passes it to `LandingStory` in the `showcase` slot,
with a `SectionRule` on each side, so the order is hero, bento, then how it
works (on both layouts). It belongs to no story stage, and it is opaque
(`bg.surface`).

- **Layout.** From `lg` the three cells sit side by side across the page column
  (`sizes.page`), divided by 1px `border.default` lines that run from rule to
  rule; the first cell has none, because the frame's rail is on that edge. The
  cells share their rows (a CSS subgrid: `gridTemplateRows: subgrid`), so the
  three panels start on one line whatever the length of the copy above them;
  where subgrid is missing they simply start at the top of each cell. The
  panels of a row are one height, and a snippet sits at the top of its panel
  (FE-288): the short Hire snippet used to be centred in its panel, so its
  first row was out of line with the other two. Below
  `lg` the cells stack with a hairline between them; from `md` each sets its
  text beside its snippet. A cell's vertical padding is the section rhythm
  (`BENTO_CELL_PY`: 56px on a phone and a tablet, 96 from `lg`, 128 from
  `xl`; the first and last cell are the section's padding).
- **No head of its own.** Only the how-it-works index's labels are new strings,
  so the section has no heading: each cell's title is an `h2`, and the section
  landmark is named by the three of them (`aria-labelledby` with three ids).
  Each snippet is a `figure` named by its cell's title.
- **The snippets** (`BentoSnippets.tsx`) are lightweight replicas of the
  product's own rows on a `bg.canvas` panel (hairline, 16px corners), fed from
  `landing.phone`, so they add no copy. They keep to neutral tokens; green is
  used only as state: the selected "When" chip (success tint, green 800 label),
  the focus colour of the title field while it types, and the accepted row
  (success tint, green 400 check with an ink glyph). Prices are ink at 600 with
  tabular figures. There is no button to press in them that is green.
  - *Post a task:* what, where, when and budget as the product's fields (8px
    corners, `border.strong`). The title types itself; "When" is a real radio
    group (native radios, so the arrow keys work).
  - *Compare quotes:* three quote rows (avatar, name, rating, price, message).
    The name is a `button` with `aria-expanded` (named by `phone.quotes.expand`)
    and a pseudo-element stretches it over the card; opening one closes the
    others, the first starts open. The rating is the `Rating` component with
    its accessible name set to the score alone ("4.9", as the phone demo reads
    "4.9 (32)"): its default name is the English "Rating: 4.9", which the zh-HK
    page would read out, and there is no string for a label.
  - *Hire and pay directly:* the chosen quote with its booking, then the
    accepted row. The check scales in on `sdlMotion.easing.emphasis`, the
    easing the SDL keeps for confirmations.
- **Motion.** `useSnippetEntrance` has three phases: `static` (server HTML, no
  JS, reduced motion, or a snippet already on screen or behind the visitor at
  hydration: the finished state, no inline styles), `waiting` (hydrated, below
  the fold: rows held back with opacity and an 8px rise, so nothing shifts) and
  `playing` (in view: the rows fade in with the `Reveal` rise, 70ms apart, once;
  the title types; the check lands). The cell text uses `Reveal`.

## How it works

The customer act, then the worker act (`story/LandingStory.tsx`), in the page
column under the bento's rule. `id="how-it-works"` is on the section (a link to it lands
it under the sticky header).

- **Layout from `lg`.** Two halves (text on the left, the phone on the right; from `xl` they are equal
  halves, from `lg` the right one is 22rem). The left half is the index (9rem,
  10rem from `xl`) beside the steps; the right half is the phone, pinned. Below
  `lg` it is one column.
- **An act** is a `SectionHead` (a small green 600 icon and the eyebrow, "For
  customers" or "For workers", then the h2 at 34/41, 44/48 from `lg`) over its
  steps. Its head belongs to the act's first step, so the phone and the index
  move to the act as soon as its head is mid-screen.
- **Steps are hairline rows** (an `ol`, as are the section index's list; each is
  a `List.Root`, which states `role="list"` again because `list-style: none`
  drops the list in Safari with VoiceOver; each row is an `li` with a 1px
  `border.default` on top, the last also below). The number is Geist Mono 12 in
  `text.subtle` (never green), the title is an h3 at 18/500 (`heading-sm`) and
  the body is 14 in `text.muted`. The first step keeps the tap hint (a green 600
  pointer icon, the text muted). From `lg` a row is at least 240px tall
  (`STORY_STEP_MIN_H`; it was `max(300px, 42vh)`, 378px on a 900px screen, so
  the eight steps ran to more than three screens that were mostly white), with
  its text at the top: the phone changes as the row's top crosses the middle of
  the screen, so the new text arrives just under that line, and the row is
  still tall enough that a fast scroll cannot skip it (the tracker watches one
  line). Below `lg` a row is its text and its own phone (on a phone, unless
  the visitor asks for reduced motion, the act plays sideways instead: The
  sideways story). Every row has 72px
  under it (`STORY_STEP_PB`, at every width), so a step's last line, or its
  phone, is clear of the next step's rule.
- **The story runs on under its last step from `lg`** (`STORY_END_ROOM`, half
  of what the phone is taller than a row: 194px with the 628px phone). The
  pinned phone is centred on the screen and cannot leave its column, and a
  240px row ends well above the phone's foot, so without the room the phone was
  pushed up under the header as soon as the last step turned active (on a
  768px screen the taller rows did that too, by 46px). With it the phone stays
  pinned until the last row is centred, which covers where the index's link
  lands that row (story `DesktopLastStep`).
- **The order is the product's** (FE-288): Post, Quotes, Hire, Chat, Review. A
  customer and a worker can message once a quote is accepted, so the chat step
  follows Hire and is titled "Message once you accept" (it was third, "Chat
  before you choose", which the product does not allow). Its demo thread opens
  on the accepted quote ("Quote accepted", the price and the slot, then "You
  and Alex can message here now"), not on a new quote. The order lives in
  `CUSTOMER_STAGES` (`storySteps.ts`) and `STORY_STAGES` (`storyState.ts`); the
  index, the phone and the scene follow them.
- **The section index** (`StoryIndex`) lists one short label per step, the two
  acts apart: a list in the left column from `lg` (a 1px `border.default`
  hairline with the active label's 2px green 600 bar over it), a row below it
  that sticks right under the header, full width, scrolls sideways when the
  labels do not fit and keeps the active label in view (the bar is then an
  underline). The row's right edge fades out over 2.5rem (a mask), so a label
  that runs off it reads as more to scroll, not as cut; a spacer as wide as the
  fade follows the last label, so at the row's end no label is under it. Below
  `lg` the first act's head has 32px of room under the row.
  The active label is `text.default` and the rest `text.subtle`, all
  at 500. In Windows high contrast (forced colours) the bar's background would be
  painted Canvas and the active label would look like the rest, so the bar takes
  the system `Highlight`. It reads the stage from the story tracker (`useStoryStage`), so it
  always agrees with the phone, and each label links to its row
  (`#how-it-works-<stage>`; `scroll-margin-top` lands the row across the middle
  of the screen from `lg`, and under the index row below it, so the linked step
  is the active one). It is a `nav` named by `landing.story.index.label`, the
  active link carries `aria-current="location"`, and it must be a direct child
  of the box that spans both acts, so that `position: sticky` runs along them.
- **Copy:** the only new strings are the index's: `landing.story.index` (a name
  for the nav and the eight short labels), in English and Traditional Chinese.
  The group names are not new strings: the index has none (a gap, or a hairline
  in the row, separates the acts).
- **The sideways story (on a phone, below `md`, FE-542).** Ryan's review of
  push 1: on a phone, the steps scroll sideways as the visitor scrolls down, with the phone
  stuck at the bottom showing the step in view. `StoryRail` does it per act:
  the act pins under the index row (its head, its steps as cards in one row,
  the next card peeking 36px), and the scroll carries the cards across. Each
  step first holds still for 45% of its scroll (70% of the screen's height a
  step), then moves on, eased (`storyRail.ts`); the last holds too before the
  act lets go. One phone per act is docked at the screen's foot
  (`DockedPhone`, the cropped phone without its well, its foot faded out over
  the 32px it has under the compact layout's action) and slides to the step
  in place, in the direction the cards went. The index row, the story's stage
  and the phone's name follow that step. Every step keeps its link target: an
  empty block where the step's card holds in place, so the index row lands on
  the step. The floating Post a task pill steps aside while an act is on
  screen (the phone is where it sits). Reduced motion keeps the one-column
  story below; so does the server's first paint, and the switch happens after
  hydration, far below the fold. A tablet keeps the one-column story too: its
  screen is too wide for one card and too tall for one phone (the rail left a
  band of white between them). A short screen (under about 700px) crops the
  docked phone more, never the cards; it always keeps 160px of it.
- **The inline phone (a tablet, or a phone with reduced motion) is cropped** (`PhoneCrop`, FE-288): the top of
  a phone in a well 340px tall and as wide as the step's text (38rem at most),
  drawn like the bento's figures (canvas ground, a hairline, 16px corners). A
  whole phone was about 566px tall at 390 wide, so a step was longer than the
  screen, and its screen was scaled to two thirds, so 12px text was 8px. The
  cropped phone is drawn at 1:1 (326px wide at most, never scaled), so its
  text is the size it is written at, 11px or more; it sits 16px from the
  well's top and sides and runs off the bottom. Only filler is cut: every
  screen has a `compact` layout, a second design that keeps its action and
  every word in the 274px the well shows under the status bar
  (`PHONE_CROP_SCREEN_H`), and a list that runs past the crop fades out over
  its last 56px (`phoneCropFade`) instead of being sliced. Each screen's
  stories show both layouts, and the compact ones check that nothing to read
  or tap is under the crop and no text is under 11px
  (`screens/screenStoryDecorator.tsx`).
- **A phone is named by its step** (FE-288): "Slashie app demo: Post" and so on
  (`landing.phone.demoStepLabel` with the index's label), so the eight inline
  phones are not eight figures with one name, and the pinned phone's name
  follows the step it shows; the hero's search screen keeps the plain name. A
  demo's button says what it shows: its name changes with its label when the
  beat ends ("Post task", then "Task posted").
- **The phone** is plain CSS: a `position: sticky` box in the right half, so the
  server HTML already has it in place and reduced motion changes nothing. The
  old sideways slide (the phone travelled from the hero's centre into the right
  column) and the empty spacer it started in are gone: the hero no longer holds
  a phone. The phone starts on the search screen (`hero` stage) until the first
  step is under the middle line.
- **Motion in the phone.** Every entrance in the phone is the 8px `fade-rise`
  (the screens' own CSS animations) or `enterStyle` (a transition of opacity and
  an 8px rise, staggered 70ms; the explicit longer distances are the app's own
  sheets and nav). `PhoneFrame` zeroes every transition and animation inside it
  under `prefers-reduced-motion` (`animation-duration: 0ms !important`, one
  iteration), so no screen needs its own guard: nothing in the phone moves under
  reduced motion. The post screen's finished state swaps its app bar for the
  "Task posted" toast: the toast takes the bar's place (46px in the 52px bar,
  over the close button and the title) and ends above the first field, so no
  field is ever covered, with or without motion (a story measures it). Under
  reduced motion the post screen still rests in its starting state, with the form
  showing and the hotspot a still green 600 ring (not a pulse), rather than on
  the finished state; a tap plays the result (`useDemoBeat(active, intro,
  false)`). Every other screen jumps to its finished state.
- **The phone's screens** follow the product after Train 1: neutral tiles and
  avatars (no mint), the drawn map in neutral tokens, price pins as pills
  (hairline, green 800 price; the selected one green 400 with an ink price),
  pill buttons and chips, 8px fields on `border.strong`, 12px cards, prices in
  ink at 600 with tabular figures, a bottom bar whose active tab is ink (the
  green Post button is its only green), a tab underline in green 600 and the
  tap ring in green 600. Green stays for state: the selected "When" chip and the
  success cards (task posted, quote accepted, quote sent).

## Trust

The trust row (`sections/TrustSection.tsx`) is the four reassurance points
(`landing.trust.points`, today's strings) as a hairline row between the two
section rules that `home/page.tsx` puts round it. It is the stage `trust` and
it has no card: no tint, radius or shadow.

- **Layout.** From `lg` the four points sit side by side across the page column
  (`sizes.page`), divided by 1px `border.default` lines that run from rule to
  rule; the first has none, because the frame's rail is on that edge. From `md`
  they flow into two columns with a hairline before the right-hand column and
  above the second row; below `md` they stack with a hairline between them. The
  points are a plain list (`ul`), so a screen reader announces a list of four.
- **A point** is a green 600 check (`accent.active`, 20px, hidden from assistive
  technology) beside the text at 16/500 in `text.default`; the check sits level
  with the first line, so a point that wraps keeps it at the top. Green is the
  state icon here, never a fill (the old green 400 disc is gone).
- **Rhythm.** Cells touch the rules (the dividers run from rule to rule), so a
  cell's padding is the section's. The section's edges take the frame's
  `SECTION_PY` like every other section (56px on a phone, 80 on a tablet, 96 on
  a laptop, 128 on a wide screen), and the padding between points that sit above
  one another is tighter (20px stacked, 32px in the 2 x 2 grid) so four short
  lines do not become a block of white (`trustCellPadding`, unit-tested). From
  `lg`, where the four sit in one row, every cell is `SECTION_PY`. The first
  build had them a step tighter all round (a row 177px tall at 1366), below the
  spec's "generous section padding (96 to 128px desktop, 56 to 64px phones)".
- **Opaque.** The section is `bg.surface`, like the bento.
- **No head.** The only new strings the train allows are the how-it-works index's
  labels, so the row has no eyebrow or heading, and so it is not a named
  landmark. Its wrapper is a `div`, not a `section`: a landmark needs a name and
  a name needs a string (none of today's fits), and an unnamed `section` claims a
  structure it cannot have. The spec's "each section is a landmark with a
  heading" does not hold for this one section until Ryan allows a heading string
  (a visually hidden one would do); this is a recorded deviation, not an
  accident.
- **Motion.** Each point is a `Reveal` (a fade with an 8px rise, 400ms, once),
  staggered 70ms; reduced motion and no JS show them as they are.

## Pricing teaser

The pricing teaser (`sections/PricingTeaser.tsx`) is the worker side of the price
in two plain cards and one pill to `/pricing`, between the two section rules that
`home/page.tsx` puts round it. It is the stage `pricing`. The cards' lines come
from live pricing, in the page's language (`sections/landingPricing.ts`, pure
and unit-tested), and arrive as `pricing` (`LandingPricing`); the section only
sets them. Only what the API backs is claimed (FE-288):

- **A trial** leads the paid plan. It is built from the API's `trialDays` with
  the pricing page's own strings (`plans.trial`, as `/pricing` builds it: "6
  months free", "免費 6 個月"), never from the API's `trialLabel`, which is
  English whatever the page's language (the Chinese card read "6 months
  free"). No API change.
- **No trial:** the price leads.
- **No pricing** (the API reports none, or the fetch failed): no card carries a
  number. The free plan reads "Free quotes every month"
  (`pricingTeaser.freeHeadlineFallback`, the one new string) instead of a
  made-up "3 quotes a month", and the paid plan says "Unlimited quotes" once,
  over the pricing page's "For active workers" (the line under it used to say
  it again).

The heading, the body, the two plan labels, the free body, the pill label and
the eyebrow are as they were.

- **Head.** `SectionHead` with an eyebrow: the nav's "Pricing"
  (`header.nav.pricing`, "收費" in zh-HK, passed from `home/page.tsx`: an existing
  string, so no copy is added) and a small green 600 tag icon, then the h2 at
  34/41, 44/48 from `lg`, 500, and the body in `text-lg` muted. The section is a
  landmark named by that heading (`aria-labelledby`). The eyebrow icon is the
  section's only green (an eyebrow icon is green 600 by the spec; never a fill).
  Of the other heads with no eyebrow, this is the one an existing string fits;
  the rest are an open decision (see Deliberate calls).
- **Layout.** From `lg` the head and the pill sit in the left column (5fr) and
  the two cards in the right one (7fr), the cards spanning both rows, so the
  pill sits right under the head. Below `lg` the order is the head, the cards
  (two columns from `md`, one on a phone) and the pill, which is also the DOM
  order, so the reading order never changes.
- **A plan card** is the product's card recipe (`sdlCardSurface`: `bg.surface`,
  a 1px `border.default` hairline, 12px corners, `e1`), left-aligned, with
  `p` 20 / 24 / 28 by breakpoint. In it: a label (14 at 500; `text.muted` for the
  free plan), the headline as an h3 (`heading-lg`, 24/30, balanced) and a
  `text-sm` muted line. Both cards stretch to one height. The headline is a
  figure (a trial, a price or "3 quotes a month"), so it is 600 with tabular
  figures (`sdlFigure`), as the price is on the pricing page's cards, which
  follow this card (the type rule: "prices, counts and other figures are 600
  with tabular figures"). The first build set it at 500 and the pricing page at
  600.
- **Plum** (`accent.premium`) is the worker subscription's colour and it is
  kept for the paid plan only: its label with the sparkle and its 1px hairline
  (instead of `border.default`; it was a 2px line). Nothing else is plum and
  nothing here is a green fill or text: the page's one green action is the
  hero's, and the closing call has its own. The pill to `/pricing` is the outline
  pill (`variant="secondary"`: white, a 1px `border.strong` hairline, an ink
  label), not a plum fill: it goes to the pricing page, not to the paid plan, and
  a solid second accent beside the page's green (on a phone the pill shares a
  screen with the floating Post a task) is what the spec leaves out ("any second
  accent beside green"). The first build and the round 1 build had it plum.
- **Opaque** (`bg.surface`), like the bento and the trust row.
- **Motion.** The head, each card (staggered 120ms) and the pill are `Reveal`s (a
  fade with an 8px rise, 400ms, once); reduced motion and no JS show them as they
  are.
- **The pricing page** follows this recipe (the spec: "the pricing cards follow
  the teaser"): the same hairline-and-`e1` card, plum only for the paid plan. See
  Pricing page.

## Final call to action

The closing call (`sections/FinalCtaBand.tsx`) is one centred line, one sentence
and two ways in, under the section rule that `home/page.tsx` puts above it
(the footer is its own band below). It is the stage `cta`. No string is added:
the heading, the body and the two labels (`ctas.postTask`, `ctas.becomeWorker`)
are today's, and the hrefs arrive localized from the page.

- **Head.** The h2 is `display-lg` (44/48 at 500, -0.035em) from `md` and
  `heading-xl` (34/41) on a phone, the same step down as `SectionHead`, with
  `text-wrap: balance`; the body is `text-lg` in `text.muted`, also balanced.
  Both are centred inside a 40rem measure. There is no eyebrow and no icon (an
  eyebrow needs a string first): this and the hero are the only centred sections.
  The section is a landmark named by its heading (`aria-labelledby`).
- **The two pills.** Post a task is the primary Button: green 400 with an ink
  label, 52px (`size="lg"`, the height of the hero's task pill). Become a
  worker is the outline pill (`variant="secondary"`: white, a 1px `border.strong`
  hairline, an ink label, the hairline steps to `border.hover`). The primary
  keeps the `Magnetic` pull (fine pointers only, off under reduced motion). The
  pills sit in one centred row and wrap onto their own rows when the width
  cannot hold both (below about 330px of content, so 320px phones). Post a task
  carries `data-page-green-action`, the hook the header watches (the button, not
  the section: the header's Get started stays quiet only while the pill is on
  screen, so no scroll position near the foot is left without a green action).
  Post a task is the section's only green; nothing else here is green or heavier than 600.
- **Transparent.** Unlike the panels above it (bento, trust, pricing) the
  section has no background: the page's white shows through. The text block
  never grows past 40rem.
- **Rhythm.** `SECTION_PY` on the section (56px on a phone up to 128px on a wide
  screen), 32px between the text and the pills on a phone and 40px from `md`.
- **Motion.** The text and the pills are `Reveal`s (a fade with an 8px rise,
  400ms, once; the pills 120ms later); reduced motion and no JS show them as
  they are.

## Floating Post a task pill

The floating pill (`sections/FloatingPostPill.tsx`) is an ink pill fixed to the
bottom centre of the screen: the page's post label and an arrow, linking to the
page's post action. `home/page.tsx` renders it last, after the footer, with
`ctas.postTask` and `hrefs.postTask`. No string is added. The hero has no post
button of its own (its action is the search), so the pill goes where the closing
call's Post a task goes: register, then on to `/tasks/create`.

- **When it shows** (`sections/floatingPillWatch.ts`, pure rules plus one
  IntersectionObserver): once the hero is out of view (scrolled past, above the
  screen: `heroIsAbove`), and not while the final call to action or the footer is
  in view. The page's hooks are `data-landing-hero` (on `HeroSection`),
  `data-final-cta` (on `FinalCtaBand`) and the `footer` element; the watched
  selectors are props with those as defaults. A hero below the screen does not
  count, so it never shows before the visitor has seen the hero. A reload part
  way down the page is right at once, because the observer reports every target
  when it starts. The pill is hidden from the server render and after hydration
  the visitor's scroll shows it, so there is no flash.
- **Where it sits.** `position: fixed`, centred, `16px` above the bottom edge
  and above the phone's safe area (`calc(env(safe-area-inset-bottom, 0px) +
  16px)`). The row spans the screen with `pointer-events: none`, so only the pill
  takes a tap.
- **It waits for the cookie banner.** While the banner is open (a first visit)
  the pill is held back: the banner takes about 180px of a phone's foot, and
  the pill above it sat on the step titles and body text at most scroll
  positions (headings such as "Find work nearby" were unreadable under it). The
  banner marks `<html>` with `data-cookie-banner-open` while it is open (and
  publishes `--cookie-banner-height`, `src/app/cookieBannerLayout.ts`, set by
  `CookieConsentBanner` with a ref callback and a ResizeObserver), and the pill's
  shown state is `:not(html[data-cookie-banner-open] *)`, so this is CSS alone:
  the pill stays out of sight and out of the tab order, and fades in once the
  visitor has answered, if they are past the hero. The design is unchanged
  (ink pill, bottom centre); the page's own green Post a task is the way in
  until then. While the pill is shown `globals.css` also gives `<html>` 76px of
  bottom scroll padding (the pill's 44px, its 16px gap and 16px of air), so a
  control that takes keyboard focus is not left under it; the open banner has its
  own padding (see Frame and rhythm). The row is above the sections' stacking
  (`zIndex` 2) and below the banner (`banner`, 1200).
- **The pill.** A `Button` (`asChild`, so one `a`): 44px, fully round, a 500 label
  and an 18px arrow (decorative, `aria-hidden`), `e3` for floating chrome. Ink is
  `text.default` with a `bg.surface` label, the pair the app already uses for an
  ink fill, so it also reads in dark mode. Hover steps the fill to `text.muted`;
  focus is the usual green 600 ring. Nothing here is green but that ring, so the
  hero's Search and the close's Post a task stay the page's greens (one green
  action per screen). No counters, no social proof.
- **Accessibility.** One link named by its label ("Post a task"). While hidden
  it is `visibility: hidden` (after the fade-out), so it is out of the tab order
  and the accessibility tree and a keyboard never lands on something invisible;
  shown, it is a normal tab stop. It stays shown while it holds focus, so
  scrolling on never pulls it from under the keyboard. It is the last element of
  the page in the DOM, outside the sections' landmarks, so a keyboard reaches it
  after the page's own controls; the closing call offers the same action in the
  reading flow.
- **Motion.** In: a fade with a 16px rise, 400ms on the decelerate curve. Out: a
  200ms fade. Reduced motion (read with `matchMedia`, so a story can set it): it
  fades without any rise (no `transform` at all). It is not printed.

## Pricing page

`/pricing` (`src/app/(marketing)/pricing/`) takes the same frame as the landing
(the spec: "the same frame, rules, eyebrows and type; the pricing cards follow
the teaser"). `components/PricingPageView.tsx` assembles it (frame, page header,
the plans section, the questions); `page.tsx` loads the data and adds the footer
and the view's analytics. The views (who sees which button) are unchanged:
`pricing/views/README.md`.

- **Frame.** A white page (`MarketingFrame bg="bg.surface"`), the rails from `lg`,
  and a `SectionRule` under the title and one between the plans and the
  questions. The marketing header turns white on `/pricing` (`FRAMED_ROUTES` in
  `MarketingHeader.tsx`: a route goes in that list when its page takes the frame).
  The page header's bar is opaque and sits 10 deep, so the page passes
  `railsZIndex={11}` and the rails run unbroken from the site header.
- **Page header (FE-458) stays.** The big "Membership" is the page's one h1 and
  collapses into the bar as before. The header now sits outside the page container
  (so the rules can run edge to edge) and says its colour: `MarketingPageHeader`
  takes `background`, and brings the container's measure and gutters itself
  (FE-493: Back and the title start on the logo line and span the container, R2).
- **Sections** are `PricingSection`: a landmark named by its h2 (`aria-labelledby`),
  `SECTION_PY`, the page column. Below `xl` the head sits over the content; from
  `xl` the head is the left column (4fr) and the content the right one (8fr),
  as the teaser sets its head and cards (`PRICING_SPLIT`; the cards need about
  300px each, which the right column only has from `xl`). The plans section is
  `SectionHead` (the h2, the body), the two cards and the purchases note; the
  questions are `SectionHead` ("Questions") and the rows. The plans head has the
  teaser's eyebrow: the nav's "Pricing" (`i11n.chrome.json`, "收費" in zh-HK,
  an existing string that `page.tsx` hands to `PricingPageView`) with a small green
  600 tag icon. "Questions" has none: no existing string fits it. Both heads are
  `size="title"` (34/41 at every width), because the page's own title is 34/41 and
  a section head under it must not out-size it (the 44/48 display head was larger
  than the h1); the landing and `/about` keep the display size.
- **Plan cards** are the teaser's card: `sdlCardSurface` (white, a 1px hairline,
  12px corners, `e1`), `p` 20 / 24 / 28, left-aligned, one height. In order, as
  before: the plan's name (an h3, a 14/500 label, muted on Free), its line, the
  price as a figure (`heading-xl` at 600 with tabular figures: "£0 / month",
  "6 months free"), the "Then" line, a hairline, the features with green 600
  checks and the pill. The icon tiles are gone (the teaser has none). "Your plan"
  is still the `success` tag, because it is a state.
- **Plum** is the paid plan's: its name with the sparkle and its 1px hairline (it
  was a 2px green one). Its button is the green primary, not plum: the main action
  stays Slashie green everywhere, marketing included, one per screen, and plum
  covers the card's label and hairline only (round 2 review; the first build and
  round 1 had a plum pill, which left a signed-in worker with no green main
  action beside a plum Start free trial, since the header's Get started has no
  session check). Free's pill is outline. The paid plan's action (the links and
  `PricingCheckoutButton`) carries `data-page-green-action`, so the marketing
  header's Get started is the outline pill while it is on screen and the green
  one again when it is not (`layout/pageGreenWatch.ts`; the page streams in
  behind its loading frame, which the watch follows).
- **Questions** are hairline rows, not cards: an h3 at 18/500 (`heading-sm`) over
  the answer at 14 in `text.muted`, a hairline above each and under the last, and
  the Terms line under them. The Terms link is underlined at rest (green 800 is
  1.1:1 against the muted line, which axe reports as a Level A failure, WCAG
  1.4.1, once the page has plans to show: found on the production build run with
  a stubbed pricing query).
- **Headings.** One h1 (the title), h2 for the plans head and "Questions", h3
  for the plan names, the questions and the "Pricing isn't loading" card (the plan
  names were h2 before the plans section had a head of its own).
- **Loading and unavailable.** `loading.tsx` draws the same frame, rules and grid
  with skeletons. With no plans from the API the plans section shows the card
  (left-aligned now) and the questions are left out, as before.
- **Without JavaScript (recorded, not changed).** `page.tsx` awaits its two fetches
  under `loading.tsx`, so React streams the page into a hidden block that only its
  inline swap script reveals: with JavaScript off `/pricing` shows the loading frame
  and the footer, where the landing, `/about` and the legal pages render in full
  (the copy is in the HTML, inside the hidden block). This predates the branch, and
  the loading frame is what keeps the layout from jumping while the plans arrive. If
  the spec's "all copy stays server-rendered" is to hold here too, drop
  `pricing/loading.tsx`: the page then waits for its fetches and sends complete
  HTML. Ryan's call.
- **Motion.** The head and the content of each section are `Reveal`s; reduced
  motion and no JS show them as they are.

## About page

`/about` (`src/app/(marketing)/about/`) takes the same frame, rules and type as the
landing. `components/AboutScreen.tsx` renders the page inside `MarketingFrame`
(`bg="bg.surface"`) from the copy and the view; `page.tsx` adds the footer under the
frame. The views (who sees which closing button) are unchanged: `about/views/README.md`.

- **Frame.** A white page, the rails from `lg`, and a `SectionRule` between each of the
  five sections (the title, how it works, what it costs, the mission with the open
  source note, the closing band). The marketing header is white on `/about`
  (`FRAMED_ROUTES`). Each section is a landmark named by its heading (`aria-labelledby`),
  in the page column with `SECTION_PY`.
- **Title.** The h1 "About Slashie" is left-aligned (only the landing hero and the
  closing band are centred): `display-xl` (56/58) from `md`, `display-lg` (44/48) on a
  phone, the body in `text-lg` muted with `text-wrap: balance`.
- **Heads.** Every section head is `SectionHead` (left-aligned, an h2 at 34/41, 44/48 from
  `lg`, 500). They have no eyebrow: an eyebrow needs a string and this page adds none.
  The eyebrow style (12/16 caps, 500, +0.08em, `text.subtle`, with a small green 600
  icon) is on the two step groups' names instead, which are today's strings ("If you
  need a hand", "If you do the work"; the same user and hard hat icons as the landing's
  acts). They stay h3s.
- **Steps** follow the landing's: hairline rows in an `ol` (a 1px `border.default` above
  each, the last also below). The number is Geist Mono 12 in `text.subtle`, as "01", "02",
  "03", never green and no disc behind it (it was a filled circle); the step is `text-md`
  in ink. The two groups sit side by side from `md` (a 32px gap, 64px from `lg`) and stack
  on a phone.
- **What it costs** is three hairline-topped columns from `md` (each an h3 at 18/500 over a
  14px muted line; stacked on a phone, with the last row closing the list). "See pricing"
  is the `emphasis` link (green 800), set close under the points.
- **Mission and open source** are two sections side by side from `md`, each a
  `SectionHead` with its text as the head's body (`text-lg` muted, 60ch). The GitHub and
  LinkedIn buttons are outline pills.
- **Closing band** is `FinalCtaBand` unchanged (the landing's close), under a rule. On
  this page it is the same band. Green is the group icons and its Post a task
  pill; the marketing header's Get started is secondary here while the close is on screen
  (one green fill per screen, as at the foot of the landing) and green higher up the page.
- **Motion.** The heads and the content of each section are `Reveal`s (the title is not:
  it is the first thing on the page); reduced motion and no JS show them as they are.

## Legal pages

`/terms`, `/privacy`, `/cookies` and `/help/safety` (`src/app/(marketing)/<route>/`) take the
same frame, rules and type as the landing (the spec: "the legal pages keep their reading
column (65 to 75 characters) inside the frame"). `components/layout/LegalPageLayout.tsx`
renders all four from their copy (`src/content/legal/*` and each route's `i11n.json`);
each `page.tsx` only loads the copy and adds the footer under the frame.

- **Frame.** A white page (`MarketingFrame bg="bg.surface"`), the rails from `lg`, and one
  `SectionRule` under the page header. The marketing header is white on these routes
  (`FRAMED_ROUTES`). The page header's bar is opaque and 10 deep, so the layout passes
  `railsZIndex={11}` and the rails run unbroken from the site header, as on `/pricing`.
- **Page header (FE-458) stays.** The title is the page's one h1 and collapses into the bar
  as before, with "Last updated" under it. The header sits outside the page container and says
  its colour (`background`), as on `/pricing`; it brings the container's column itself.
- **Eyebrow.** The title carries the footer's column name over it, with a small green 600
  icon: "Legal" (法律) on `/terms`, `/privacy` and `/cookies`, "Support" (支援) on
  `/help/safety`, which sits under Support in the footer (`LegalEyebrow`, a client
  component reading the footer's own bag, so no string is added; the page passes
  `column="support"`). `StickyHeader` takes an optional `eyebrow` for it (`MarketingPageHeader`
  passes it on): the eyebrow is part of the page, so it scrolls away, and the title
  collapses into the bar once it has reached it (the collapse reads where the title rests,
  so a title under an eyebrow starts later, as one under a map does). The eyebrow is the
  shared `Eyebrow` of `MarketingFrame`, which `SectionHead` uses too.
- **The policy** is one landmark (`section`, named by the title with `aria-label`: no new
  string) with `SECTION_PY` under it (56px phone to 128px wide) and none above. Inside, the
  page's column (`<Container>`) holds the intro, then each section as a hairline row: a 1px
  `border.default` above it (the first row takes none when there is no intro, the page's
  rule does that), 32px (phone) or 40px (`lg`) above and below its content, the first row
  and the intro included. The rule under the page header is the first row's hairline, so
  the document opens 40px under it like every row, not on a 128px void (the first build
  put the section's 128px above the intro, against 40px between the rows). The footer
  stays under the frame as its own band.
- **Rows.** From `lg` the heading is the left column (4fr) and the text the right one
  (8fr, a 48px gap), as the teaser sets its head and content; below `lg` they stack,
  heading first. The intro sits in the text's column with the heading's cell empty. Each
  section's `id` (the app links to `/help/safety#report`) is on the row, with a
  scroll margin that clears the marketing header and the bar (130px phone, 138px).
- **Type.** The section heading is an h2 at `heading-lg` (24/30, 500, -0.02em, ink), the
  text `text-md` (16/24) in `text.muted`, the intro `text-lg` (18/28) in ink. Email
  addresses are links (the content files stay markup-free), underlined at rest: the link
  colour (green 800) is 1.1:1 against the grey body text and 2.7:1 against the ink intro,
  under the 3:1 that would let colour alone tell a link in a sentence from the text (WCAG
  1.4.1, a Level A failure axe reported on all four pages), so the underline does it.
- **Reading column.** `LEGAL_MEASURE` is `32em`, set on every paragraph, so the text
  holds about 70 characters of English per line (65 to 75; the stories measure the real
  copy of all four documents) and about 32 of Chinese. It is in `em`, not `ch`: the width
  of a "0" in Geist is 1.4 times the average letter, so `65ch` would run to about 95
  characters. A phone is narrower than the measure, so the text fills it inside the 16px
  gutters (about 46 characters a line); that is as it must be.
- **Motion.** None: a policy is read, not revealed, and a link to a section (`#report`)
  must land on text that is already there. The page header's collapse is its own.

## Behaviour by device

- **Desktop (`lg`+):** the index, the steps and one phone (see How it works).
  The phone is sticky in the right half: it starts at the top of the steps,
  pins at mid-screen and lets go when the last step ends.
- **Tablets (`md` to `lg`):** no pinned phone. The index is a row under the
  header; each step is its text followed by its own phone, cropped to its top
  in a 340px well (see How it works), which plays once a third of it is on
  screen and resets only after it has left.
- **Phones (below `md`):** the sideways story (see How it works): each act
  pins, its steps ride across as the page scrolls, and one phone is docked at
  the screen's foot.
- **Reduced motion / no JS:** the one-column layout with a phone per step;
  phone screens show their finished state (the post screen rests as its form,
  with a still ring on its hotspot). Every transition inside the phone is
  zeroed by `PhoneFrame`; the index does not animate. The hero scene shows
  its poster frame.

## Brand tokens

UI references SDL semantic tokens only (`src/theme/chakraSystem.ts`).
**Green-ink rule:** green fills use dark ink text, never white.

## Deliberate calls

- Phone screens are lightweight replicas styled with SDL tokens, not the app
  components (those pull in Apollo, auth and routing). Keep them close to the
  real UI when the app changes: bottom bar, price pins, task detail, thread.
- Demo people, tasks and prices are fictional and live in the i11n bag
  (`landing.phone`), in English and Traditional Chinese.
- **Eyebrows: partly done, the rest needs Ryan.** The spec wants every
  left-aligned section head to carry an eyebrow with a green 600 icon, and also
  allows no new strings beyond the how-it-works index's labels. Heads with an
  eyebrow today: the two acts (`landing.story.*.eyebrow`), the pricing teaser and
  `/pricing`'s plans head (the nav's "Pricing", an existing string both times) and
  the legal pages (the footer's "Legal", an existing string: see Legal pages).
  Heads without: the bento (no head of its own, its cells' titles are the h2s),
  the trust row (no head), `/pricing`'s "Questions",
  `/about`'s four section heads (its two step groups have a group label, placed
  under the h2) and the legal rows. No existing string fits any of them ("For
  customers" over the bento would repeat the act's eyebrow right below it). The options for Ryan: (a) keep
  reusing existing strings where one fits and accept the rest, (b) allow a few
  new eyebrow strings in en and zh-HK, or (c) amend the spec to "eyebrows where
  a string exists". Decide before another round, so the sections are not
  reworked twice; if (b), each head only needs `eyebrow` and `icon` on its
  `SectionHead`.
