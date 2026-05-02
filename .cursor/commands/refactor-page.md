# refactor-page

When the user types `/refactor-page` (or asks to audit/refactor page(s) to current repo rules and design), execute the **`page-refactor-audit`** skill.

## Default steps

1. Identify the target path(s) under `src/app/` (from the user message or open file). If unclear, ask once which file(s) to update.
2. Read **`/.cursor/skills/page-refactor-audit/SKILL.md`** and run its audit checklist on those files.
3. Refactor to satisfy **`@ui`** usage, **Chakra + Next `Link`**, **avoid-new-useEffect**, **thin `page.tsx` / colocation**, **AGENTS.md** language, and **slashie-design** where UI changes.
4. Run **`bun run lint`** (and **`bunx tsc --noEmit`** if imports/types changed). Run **`bun run exports-gen`** only if registered barrel folders were affected.

## Notes

- Prefer minimal, focused diffs; do not expand scope to unrelated routes.
- For codegen/schema updates tied to the page, use the **`update-graphql`** skill separately when needed.
