# HandyBox (web MVP)

## Deployments (Render)

- Web: https://web-e7kl.onrender.com/
- Storybook: https://storybook-3hlt.onrender.com/
- API (GraphQL): https://handyman-apollo.onrender.com/graphql

## Requirements

- Node.js 20+
- pnpm

## Setup

```bash
pnpm install
```

## Run the web app

```bash
pnpm dev
```

Then open <http://localhost:3000>.

## Run Storybook

```bash
pnpm storybook
```

Then open <http://localhost:6006>.

## Environment

```bash
# Full GraphQL endpoint (include /graphql)
NEXT_PUBLIC_GRAPHQL_URL=https://handyman-apollo.onrender.com
```

## Lint / Format

```bash
pnpm lint
pnpm format
```
