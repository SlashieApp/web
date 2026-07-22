# Project Overview: Slashie Web MVP

## Agent workflow (required)

Before changing this repo, follow the canonical playbook in the **wiki**:
[`00-Meta/Agent-Instructions.md`](https://github.com/SlashieApp/wiki/blob/main/00-Meta/Agent-Instructions.md).

Short rules for **web**:

1. Read relevant wiki notes + the Linear **`FE-*`** ticket (create or **reuse/update** — do not duplicate).
2. Implement here; keep product truth and decisions in the wiki.
3. Open a **PR** against `main` and mark it **ready for review**; set Linear to **In Review**.
4. Sync roadmap / domain wiki notes when scope or delivery status changes.

Wiki docs ship on **`main`** directly; do not treat this file as the only source of process truth.

## 1. Project Mission

Slashie is a high-trust local task marketplace connecting people who need work done with **workers** who can do it. The product goal is to make hiring and earning straightforward: post a task, compare **quotes**, complete the work, and leave feedback—with **map-first discovery** as a core experience.

## 2. Primary Personas

### Customer (Client)

- Need: fast and reliable help with clear status tracking.
- Core flow: post task -> receive quotes -> choose pro -> complete task -> review.
- App surfaces: `/requests`, and `/profile` (client point of view).

### Worker

- Need: discover nearby tasks and manage work as a business.
- Core flow: browse tasks -> open detail -> send quote -> deliver work -> build reputation.
- App surfaces: `/dashboard/*` for worker-focused tools and analytics.

## 3. Product Behavior in MVP

- Homepage defaults to the task-hunter experience.
- Users can browse tasks on map/list and apply filters to find relevant tasks.
- Task detail is publicly readable.
- Unauthenticated users are read-only; login is required to submit **quotes** or perform account actions.
- The app supports two intents:
  - become a worker (worker flow and dashboard), or
  - post a task (client flow for requesting help and managing quotes/requests).

## 4. Core Feature Areas

- Marketplace discovery: map-based browsing and task filters.
- Job lifecycle: post, quote, status progression, completion.
- Trust signals: worker profile details, ratings, endorsements, and review history.
- Role-based navigation: lightweight client pages vs full worker dashboard.

## 5. Technical Foundation

- Frontend: Next.js 16 (App Router).
- API: external GraphQL backend (schema synced into `.codegen/schema.ts`).
- UI system: reusable primitives and shell chrome (`Header`, `Dock`) in `src/ui` (`@ui`) with Chakra UI as base layer; copy bags colocated as `i11n.json` next to the owner.

## 6. Engineering conventions (wiki)

**Start here:** [`docs/coding-guidebook.md`](docs/coding-guidebook.md) — layers, route colocation, `page.tsx` contract, i11n, Link locale, GraphQL, Storybook, checklists.

Also: [`docs/ui-consistency.md`](docs/ui-consistency.md) · [`docs/README.md`](docs/README.md) · Cursor rules in [`.cursor/rules/`](.cursor/rules/) (especially `ui-layer-boundaries`, `i11n-colocation`, `repo-structure-and-exports`, `chakra-next-link`).

## 7. Current Product Direction

- Implement and iterate the redesign page-by-page, starting from homepage flows.
- Keep UX aligned to Stitch design output while preserving role-based app behavior.

## Cursor Cloud specific instructions

### Architecture

Single Next.js 16 frontend app (no local backend/DB). All data comes from an external GraphQL API. Standard dev commands are documented in `README.md` (Setup / Run / Lint).

### Key gotchas

- **Bun is the package manager.** The lockfile is `bun.lock`. Always use `bun install` and `bun run <script>`.
- **`lefthook install` fails** if `core.hooksPath` is set by the agent environment. Use `bun install --ignore-scripts` when you only need dependencies, then run `lefthook install --force` separately if git hooks are needed.
- **`.codegen/schema.ts` is gitignored** and the `.codegen/` directory ships empty. The remote codegen endpoint requires an `apollo-require-preflight` header that the current `codegen.ts` config does not send, so `bun run codegen` may fail with a CSRF error. Workaround: restore the schema from git history (`git show 7c39d98:.codegen/schema.ts > .codegen/schema.ts`). When codegen is fixed upstream, prefer running `bun run codegen`.
- **`.env` is gitignored.** The update script recreates it from injected environment secrets (`NEXT_PUBLIC_GRAPHQL_URL`, `SCHEMA_ACCESS_TOKEN`, `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`). See `.env.example` for the full list.
- **`bun run dev`** runs `exports-gen` (barrel file generation) automatically before starting Next.js, so you don't need to run it separately for dev.
- **`bun run lint`** runs Biome with `--write` (auto-fix + format). It modifies files in place.

### Running services

| Service | Command | Port |
|---------|---------|------|
| Next.js dev | `bun run dev` | 3000 |
| Storybook | `bun run storybook` | 6006 |

### Testing

- Vitest + Playwright for Storybook-driven browser tests (run via `npx vitest` or through Storybook addon).
- No standalone backend tests — this is a frontend-only codebase.
