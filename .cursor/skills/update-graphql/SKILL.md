---
name: update-graphql
description: Run codegen to fetch the latest schema, analyze .codegen/schema.ts, and fix GraphQL Document Validation errors by updating operations in src/graphql/ and affected frontend usage. Use when the user asks to update the GraphQL schema, run codegen, or sync GraphQL files.
---

# Update GraphQL Schema

When requested to update the GraphQL schema or run codegen, follow these steps to keep the frontend GraphQL operations in sync with the backend.

## Workflow

0. **Repository policy (default)**
   - Do **not** commit `.codegen/schema.ts` or other files under `.codegen/`, and do **not** add a committed `schema.graphql` snapshot unless the project explicitly opts in.
   - Do **not** change `codegen.ts` unless the user explicitly requests it; schema is fetched from `${NEXT_PUBLIC_GRAPHQL_URL}/schema` with `SCHEMA_ACCESS_TOKEN`.

1. **Run Codegen**
   Execute the codegen script to fetch the latest schema from the backend and generate updated TypeScript definitions:
   ```bash
   bun run codegen
   ```

2. **Use GraphQL Document Validation as the Source of Truth**
   If codegen fails, read the `GraphQL Document Validation failed` errors from the command output and treat them as the required fix list:
   - `Cannot query field ...` -> remove/rename invalid selections.
   - `Unknown type ...` -> update operation variables/types to current schema types.
   - `Cannot query field ... on type Mutation/Query` -> replace deprecated operations with current ones.
   - Use the file/line hints in the error output to patch the exact operation.

3. **Analyze the Generated Schema**
   Read `.codegen/schema.ts` from the latest codegen output and confirm the correct `Query`, `Mutation`, and object field names before editing operations.
   - This file is **generated locally** (typically gitignored); regenerate with `bun run codegen` rather than expecting it in version control.

4. **Update GraphQL Operations (Full Audit)**
   Review **every** operation file in `src/graphql/` (for example: `tasks.ts`, `auth.ts`, `users.ts`, `categories.ts`, `reviews.ts`) and compare each operation against the latest schema inputs/outputs:
   - Add any new queries or mutations that exist in the schema but are missing from the `src/graphql/` folder.
   - Update the fields of existing operations if the schema has changed (e.g., added/removed/renamed fields).
   - Ensure required input fields in schema input types are reflected in FE payload builders/forms (example: required `CreateTaskInput.locationLat` / `locationLng` must be provided by the create-task flow).
   - Ensure the structure strictly follows the generated schema types.

5. **Identify Affected Frontend Components**
   Use the search tools to find where the changed queries or mutations are imported and used across the frontend codebase (e.g., `src/app/`, `src/components/`, etc.).

6. **Update Frontend Code**
   Update the affected frontend components to align with the new GraphQL operation signatures, fields, and TypeScript types. Ensure that variables passed to mutations/queries match the new schema requirements.

7. **Check API and Add New Features**
   Compare API capabilities with the current `src/graphql/` operations and `.codegen/schema.ts`:
   - Identify newly added queries/mutations/types.
   - Add missing operations in `src/graphql/` for APIs that are now available.
   - Wire new operations into frontend flows where relevant (or add TODO notes if UI work is out of scope).

8. **Verification Loop**
   Re-run codegen until it succeeds with no document validation errors:
   ```bash
   bun run codegen
   ```
   Then run the project's linter and type-checker to verify no regressions:
   ```bash
   bun run lint
   ```
