# Marketplace seeds and fixture listings (FE-142)

Production (`slashie.app` / `api.slashie.app`) must not show fixture, demo, or
placeholder marketplace data. This note is the gate so that cannot regress.

## What went wrong

Closed-beta review found public tasks such as “Test from app”, “starbuck”,
“Hi”, and “Help me with myTV mounted”, plus a thin public worker (“RK k”,
skill `test`). Those rows live in the **Apollo / Mongo** database. The web
app only reads them.

## Two gates (both required)

| Layer | Flag | Production value | Effect |
| --- | --- | --- | --- |
| **Web (this repo)** | `NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS` | **unset / false** | Hide fixture-like tasks and thin junk worker profiles on `/search`, `/workers`, public task/worker detail, and SEO meta |
| **Apollo (API repo)** | `ALLOW_SEED` | **unset / false** | Seed / fixture scripts must refuse to run when `NODE_ENV=production` unless this flag is an explicit truthy value |

Never set either flag on the public hostname.

### Web flag

```bash
# Local / Storybook only — show fixture rows from a dirty API
NEXT_PUBLIC_ALLOW_FIXTURE_LISTINGS=true
```

Truthy values: `true`, `1`, `yes`. Anything else (including unset) hides
fixture-like listings.

Implementation: `src/utils/marketplaceListingQuality.ts`.

Create-task and worker-setup also reject the same placeholder titles / skills
so the app cannot re-seed junk from the UI.

### Apollo flag (contract for the API repo)

Seed scripts in `SlashieApp/apollo` (and any one-off Mongo loaders) must:

1. Exit unless `ALLOW_SEED=true` **and** `NODE_ENV` is not `production`.
2. Never run automatically on the production Render / Atlas process.
3. After a purge, keep `ALLOW_SEED` off on `api.slashie.app`.

Until that API gate lands, the web filter is the public-hostname safety net.

## Purge leftover production rows

Hiding is not the same as deleting. Founders / API operators should cancel or
delete the leftover production tasks and unpublish the thin worker on
`api.slashie.app` (tracked as a Backend follow-up on FE-142).

Known leftover task ids at the time of FE-142:

- `6a612fb50c686c175415cad1` — Test from app
- `6a4943b68a49ac47a59ff109` — starbuck
- `6a7cf04cb46b05fa27122f43` — Test from app
- `6a4984068a49ac47a59ff10e` — Help me with myTV mounted
- `6a63c88e0c686c175415cad4` — Hi

## Spot-check

Against the **production** API (not the Render preview used in some local
envs):

```bash
bun scripts/spot-check-marketplace-listings.ts --url https://api.slashie.app
```

Omit `--url` to use `NEXT_PUBLIC_GRAPHQL_URL`. The script lists fixture-like
tasks and workers and exits `1` when any remain in the API.

After deploy, also open `/search` and `/workers` on `slashie.app` and confirm
those titles / the thin worker card are gone. Direct `/tasks/[id]` and
`/workers/[id]` links for fixture rows should 404 for visitors (owners can
still open their own post to cancel it).
