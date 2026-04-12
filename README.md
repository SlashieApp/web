# Slashie (web)

Next.js front end for a local task marketplace: task hunters browse open work on the home page; customers post tasks and review quotes; workers run quotes and earnings from the dashboard. Backed by a GraphQL API.

## How Slashie works

Slashie ([slashie.app](https://slashie.app)) is a **two-sided local task marketplace**: **customers** post work they need done; **workers** find tasks, send **quotes**, get chosen, complete the job, and build reputation.

### As a customer (getting work done)

You **post a task** with a short description of what you need, when you want it, and a budget you are comfortable with. That budget is a starting point—you and workers can still agree changes before work starts.

Once the task is live, **nearby workers** respond with **quotes**. Each quote typically shows price, the worker’s profile, reviews, completion signals, and sometimes portfolio-style context so you can compare options.

When you **accept a quote**, the amount you agreed is handled **on-platform** (held until release). The worker does the job; when you are satisfied, you **release payment** and can **leave a rating and review** to help the next customer.

### As a worker (earning)

You sign up as a **worker**, add skills and profile details, then **browse tasks** (with notifications when available). You **send quotes** with your price and a short pitch. If the customer chooses you, you complete the work; after completion, **payment is released** according to the platform flow.

### Connections and membership

Unlike marketplaces that charge a **service fee on every job**, Slashie lets workers **reach customers for free within a monthly time-limited allowance** (the allowance **renews each month**, measured in **UTC**; the free tier currently allows **3 quote connections per calendar month** unless you have paid membership or Worker Pro). Workers who need more volume can **subscribe to a membership** for **unlimited connections**.

### Map-first discovery

Slashie is **map-focused**: **map search and browse** are first-class so people can discover and reason about **local work** quickly, alongside list-style views and filters.

---

# Project brief: Slashie web MVP

**Document version:** 1.0
**Date:** 14 March 2025
**Author(s):** Product / engineering (update as needed)
**Stakeholder(s):** Engineering, design, operations (update as needed)

---

## 1. Executive summary

- **What is this project?** A web MVP that connects people who need help (“customers”) with **workers** who browse open tasks, send quotes, and track work. The **default homepage experience** is the task hunter view: a filterable task list plus a map-style browse page (`/map`). **Without authentication**, users can read tasks and open details; **quoting and account-only views require sign-in.**
- **Why are we doing it?** To validate demand for a lightweight marketplace for local handyman-style work without committing to native apps or a full product suite upfront.
- **Desired outcome:** A shippable web experience backed by a live GraphQL API, with clear separation between **customer** routes (quotes on your tasks, posted requests, profile) and the **worker dashboard** (quotes you sent, earnings, worker setup)—so we can learn from real usage and iterate.

## 2. Problem statement / opportunity

- **User problem:** Homeowners and small businesses struggle to find reliable local help quickly; workers need visible, actionable leads without heavy platform friction.
- **Business problem:** We need a credible MVP to test positioning, conversion from browse → quote, and repeat use.
- **Opportunity:** Local services marketplaces remain fragmented; a focused “post a task / receive quotes” loop can differentiate if execution is fast and trustworthy.
- **Evidence / data:** *TBD—add bounce rates, interview quotes, or pilot metrics when available.*

## 3. Goals & objectives (SMART)

| Goal | SMART sketch |
|------|----------------|
| **Primary** | Ship a stable web MVP on Render with core task and quote flows within the agreed programme milestone. |
| **Measurable** | Track task posts, quotes submitted, and sign-ups (e.g. via PostHog); define numeric targets *TBD*. |
| **Achievable** | Scope is web-only, single API, no mobile app in this phase. |
| **Relevant** | Supports validation of marketplace liquidity and UX before larger investment. |
| **Time-bound** | Align milestone dates with your roadmap *TBD*. |

## 4. Target audience

- **Primary — task hunters / workers:** People looking for paid work; they land on `/` (and `/map`), filter tasks, open details, and **log in to submit a quote** (after worker setup in the dashboard). The **`/dashboard`** area is the **worker workspace** (quotes, earnings, history as a worker, worker registration).
- **Primary — customers (task posters):** People who need a task done; they use **Post a task** (`/tasks/create`), then **Quotes** (`/quotes`), **Requests** (`/requests`), and **Profile** (`/profile`)—all **without** the `/dashboard` prefix. They review quotes on their tasks and track posted work.
- **Secondary:** Internal team using Storybook and deployments for QA and design review.

## 5. Proposed solution / high-level scope

Web app (Next.js, Chakra UI, Apollo Client) talking to **Handyman Apollo** GraphQL.

**In scope (MVP-level):**

- **Home (`/`):** Task browse for task hunters (filters, sort, pagination); read-only until sign-in for quoting. **`/tasks` redirects to `/`.**
- **Map browse (`/map`):** Same data as the home list with a list + illustrative map column (real geocoding when the API supports it).
- **Global nav:** **Post a task**, **Become a worker** (dashboard, or login with `next=/dashboard`). When signed in: **Quotes**, **Requests**, **Profile**, **Log out**.
- **Customer account (auth required):** `/quotes` (quotes on tasks you posted), `/requests` (your posted tasks / status), `/profile` (customer profile; session-local until profile APIs exist).
- **Worker dashboard (auth required):** `/dashboard` — quotes you sent, earnings, worker-side history, worker setup, placeholder messages. **Not** the place for “my posted tasks as a customer” (that is `/requests`).
- Task detail and **submit a quote** (auth + worker setup).
- Auth: register, login, forgot/reset password, `me` query
- Component library documentation in Storybook
- Analytics hook-up (PostHog)

**How it meets goals:** Delivers discover → send quote **or** post → receive quotes → manage each role in the right surface, against a single deployed API.

## 6. Out of scope (this phase)

- Native iOS/Android apps
- In-app payments settlement UI (beyond what the API already exposes)
- Full admin/back-office product
- Full SEO/content programme beyond MVP pages
- *Add further exclusions as the team agrees.*

## 7. Key metrics & KPIs

- **Activation:** Tasks created per week; quotes submitted per week.
- **Engagement:** Return visits; dashboard refreshes; task detail views.
- **Quality:** GraphQL error rate; failed auth flows.
- **Baselines & targets:** *TBD once instrumentation and launch window are set.*

## 8. Risks & assumptions

**Risks**

- API schema or auth behaviour changes break the client (mitigation: GraphQL codegen + staged deploys).
- Cold starts / latency on free-tier hosting affect perceived quality.
- Trust & safety not fully covered in MVP (moderation, disputes).

**Assumptions**

- GraphQL API remains the system of record for tasks, quotes, and related entities.
- Users accept email/password (and any configured OAuth) for workers/customers.
- *List any legal/regional assumptions (e.g. UK-only) as you formalise.*

## 9. High-level timeline / phases (optional)

- **Discovery / alignment:** Requirements and API contract *TBD*
- **MVP build:** Core pages + auth + dashboard *TBD*
- **Hardening:** Accessibility, error handling, monitoring *TBD*
- **Launch & learn:** Render production URLs, iterate on metrics *TBD*

## 10. Dependencies

- **Backend:** Apollo GraphQL service (schema, auth, rate limits).
- **Infrastructure:** Render (web + Storybook); env vars and secrets configured per environment.
- **Tooling:** Bun for installs/scripts; GraphQL codegen for typed operations.
- **Design / content:** Brand, copy, and illustration *as allocated*.

**Next steps**

- Review this brief with engineering and design.
- Replace *TBD* items with agreed numbers, dates, and owners.
- Prioritise any post-MVP backlog from section 6 (out of scope).

---

## Deployments (Render)

- **Web:** https://web-e7kl.onrender.com/
- **Storybook:** https://storybook-3hlt.onrender.com/
- **API (GraphQL):** https://handyman-apollo.onrender.com/graphql

## Requirements

- [Bun](https://bun.sh) (recommended) or Node.js 20+ compatible with Next.js 16

## Setup

```bash
bun install
```

## GraphQL codegen

Types are generated from the remote schema (SDL) when you run codegen locally or in CI. **Production `bun run build` does not run codegen** (see `prebuild` in `package.json`); run `bun run codegen` when the API schema changes.

```bash
bun run codegen
```

Ensure `.env` includes:

- `NEXT_PUBLIC_GRAPHQL_URL` — API **base** (no `/graphql` suffix; the app appends `/graphql`).
- `SCHEMA_ACCESS_TOKEN` — value for the `X-Schema-Token` header when fetching `/schema` (see `codegen.ts`).

## Run the web app

```bash
bun run dev
```

Then open <http://localhost:3000>.

## Run Storybook

```bash
bun run storybook
```

Then open <http://localhost:6006>.


## Lint / format

```bash
bun run lint
```

(Biome is configured with `--write` for fix/format in this script.)
