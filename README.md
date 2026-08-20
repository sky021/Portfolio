# Akash Agrawal — Portfolio

An evidence-first engineering portfolio. Rather than describing the systems I have built, it lets
you run them: six case studies covering the problem, architecture, and tradeoffs, four of which
embed an interactive demo you can drive yourself.

> Set `NEXT_PUBLIC_SITE_URL` to the real domain before deploying. Until it is set, metadata, the
> sitemap, and the Open Graph card fall back to a placeholder origin.

## Stack

- **Next.js 15** (App Router) with **React 19** and **TypeScript**
- **Tailwind CSS** for styling, class-based dark mode
- **Zod** for server-side validation, **Resend** for contact delivery
- Zero runtime UI dependencies beyond React — icons, diagrams, syntax highlighting, and the SQL
  engine are all local

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Other scripts:

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint via next lint
npm run verify  # exercise the SQL engine, both simulations, and the crypto
```

### Verifying the engine and simulations

The logic behind every demo is pure TypeScript with no DOM dependency, so it is tested directly by
Node rather than through a browser or a test framework:

```bash
npm run verify:sql    # 61 checks: parsing, joins, aggregates, error cases
npm run verify:sims   # 46 checks: queueing, cold starts, association, re-identification, envelope encryption
```

These use Node's native type stripping and therefore need **Node 22.6 or newer**. `verify:sims`
asserts behavioural properties rather than snapshots — that re-identification outnumbers track
fragmentation, that concurrency never exceeds the worker pool, that a fixed seed is deterministic —
so tuning a simulation constant into dishonest behaviour fails the suite.

There is also a smoke check against a running server, which walks every route and re-requests every
local asset the HTML references. The first version of this site shipped without a `public/`
directory, so broken asset references are a regression worth a guard:

```bash
npm run start                                    # in one shell
npm run verify:routes -- http://127.0.0.1:3000   # in another
```

### Environment variables

All optional — the site runs without any of them. Copy `.env.example` to `.env.local` to set them.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin used for metadata, sitemap, and robots |
| `RESEND_API_KEY` | Enables contact form email delivery; without it submissions are logged |
| `RESEND_FROM_EMAIL` | Verified sender address for Resend |
| `CONTACT_EMAIL` | Destination for contact form submissions |

## The demos

Each demo lives in `components/demos/` and is code-split so it loads only with its case study.

**NL2SQL Agent Playground** — `/work/nl2sql-agent`
Runs real SQL. `lib/sql/engine.ts` is a from-scratch tokenizer, recursive-descent parser, and
evaluator covering joins, aggregates, `GROUP BY`/`HAVING`, `ORDER BY` over output aliases, `LIKE`,
`IN`, `BETWEEN`, and `CASE`. It executes against a seeded in-memory dataset in
`lib/sql/dataset.ts`. One curated question generates a deliberately faulty query so the agent's
bounded repair loop is visible: the validation pass rejects the bad column, the error is fed back,
and the second attempt succeeds. There is also a sandbox for writing arbitrary SQL against the same
engine.

**LambdaLens Pipeline** — `/work/lambdalens`
A discrete-event simulation of the serverless video pipeline: frames arrive into a queue, a bounded
worker pool pulls from it with a cold-start penalty on first use, and cost accrues per frame. The
baseline/optimized toggle swaps the container profile, reproducing the 50% cost reduction.

**Multi-Object Tracking** — `/work/particle-tracking`
Canvas visualizer with real tracker logic: gated greedy nearest-neighbour association with an
appearance check, motion prediction through occlusion, and re-identification on the far side of the
occlusion band.

**Per-User Content Revocation** — `/work/content-protection`
Performs genuine envelope encryption via Web Crypto (`lib/demos/envelope.ts`): the article is
encrypted under a per-article AES-GCM data key, which is itself encrypted under a non-extractable
master key. Revoking a caller stops the flow before key unwrapping, so the response is ciphertext
rather than prose. The verification suite asserts the cryptography is real — that the master key
refuses export and that tampered ciphertext fails authentication.

Every demo carries a badge stating whether it runs real logic, is a simulation, or is an abstracted
representation. Nothing on the site claims to be live production data.

## Project structure

```
app/
  actions/contact.ts     Server action: validation, honeypot, Resend delivery
  work/                  Case study index and dynamic [slug] routes
  opengraph-image.tsx    Social card generated at build time via next/og
  layout.tsx             Metadata, JSON-LD, blocking theme script
components/
  demos/                 The four interactive demos plus shared demo chrome
  icons.tsx              Local inline SVG icon set
  ArchitectureDiagram    Declarative node/edge diagrams rendered as animated SVG
  CommandPalette         Cmd+K navigation
content/
  work.ts                Single source of truth for all copy and case study data
lib/
  hooks.ts               Reduced motion, intersection, animation loop, count-up
  sql/                   SQL engine and demo dataset
  demos/                 NL2SQL agent traces, the pipeline and tracking simulations, envelope crypto
scripts/                 Node verification harnesses for the engine, simulations, and routes
legacy/                  Previous static HTML/SASS site, kept for reference
```

Simulation logic lives in `lib/demos/` rather than inside the components so it can be tested without
a browser; the components under `components/demos/` only render the state those modules produce.

## Editing content

Almost all copy lives in `content/work.ts` — profile, metrics, roles, education, skills,
credentials, and the case studies including their architecture diagrams. Adding a case study means
appending one object to `caseStudies`; the index page, detail route, sitemap, footer, and command
palette all derive from it.

## Accessibility and performance notes

- `prefers-reduced-motion` is respected globally in CSS and independently in JS: the canvas and
  simulation demos skip their animation loops and render a settled state instead.
- Demos pause when scrolled off screen rather than running in the background.
- Static sections are server components; only interactive pieces ship JavaScript.
- The theme is applied by a blocking script before first paint, so there is no flash of the wrong
  theme.

## License

See [LICENSE](LICENSE).
