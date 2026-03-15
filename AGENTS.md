# AGENTS.md

## Cursor Cloud specific instructions

**HandyBox** is a Next.js 16 (App Router) frontend for a UK handyman marketplace. It talks to an external GraphQL API (not in this repo).

### Quick reference

| Action | Command |
|---|---|
| Install deps | `bun install --ignore-scripts` |
| Dev server | `bun run dev` (port 3000) |
| Storybook | `bun run storybook` (port 6006) |
| Lint / format | `bun run lint` |
| Tests (Vitest + Playwright) | `npx vitest run` |
| Codegen (GraphQL types) | `bun run codegen` |

### Non-obvious caveats

- **`bun install` must use `--ignore-scripts`** in the cloud environment because the `prepare` script runs `lefthook install`, which conflicts with Cursor's `core.hooksPath` setting. Dependencies install fine without lifecycle scripts.
- **Playwright browsers** must be installed before running Vitest (`npx playwright install chromium`). Tests use `@vitest/browser-playwright` to run Storybook component tests in headless Chromium.
- **GraphQL codegen** introspects the remote API schema. The URL is baked into `codegen.ts`. If the remote API is unreachable, codegen will fail, but the dev server can still start (the generated types in `.codegen/schema.ts` are only needed at build time or for type-checking).
- The `LandingPage.stories.tsx` test (`Default`) fails because the story renders components that call `useMutation` without an `ApolloProvider` wrapper. This is a pre-existing issue, not an environment problem.
