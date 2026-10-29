# About views

`/about` is the same page for everyone: what Slashie is, how it works for
customers and workers, what it costs, why we're building it, and where the
code lives. Only the closing buttons depend on the reader, so there are two
views. `getAboutView({ session })` picks one from the session cookie (read on
the server, so the buttons never flash), and `index.ts` maps names to configs.
`components/AboutScreen.tsx` renders the page from the copy and the config, in
the marketing frame (FE-471: `components/ui/landing/README.md`, About page);
`AboutScreen.stories.tsx` has a story per view, tablet, phone width and zh-HK.

Copy lives in `../i11n.json` (en + zh-HK); button labels come from
`common.ctas` in the marketing bag. The page has no data, so there is no
loading, empty or error state.

| View | Who / when | Primary | Secondary |
|---|---|---|---|
| `guest` | No session cookie. | Post a task: sign up, then /tasks/create | Become a worker: sign up, then /worker/setup |
| `signedIn` | Session cookie (customer or worker; the page doesn't load the profile). | Post a task: /tasks/create | Browse tasks: /search |

## Sections

The same for both views, in order:

1. **About Slashie** (h1): one paragraph on the map-first local marketplace.
2. **How it works**: three steps for customers, three for workers.
3. **What it costs**: free for customers, free quotes for workers (Slashie
   Unlimited removes the limit), no cut of the job; links to /pricing.
4. **Why we're building it**: the mission.
5. **Built in the open**: GitHub and LinkedIn (new tab).
6. Closing band with the view's two buttons.
