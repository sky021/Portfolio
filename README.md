# Akash Agrawal

**Software Engineer - AI**

Live site: [akashagrawal.dev](https://akashagrawal.dev)

I work backward from real customer problems to build reliable AI products, backend services, and cloud systems. This site shows that work: products I am building now, plus case studies you can run in the browser.

## What I am building now

**[Regalia Pass On](https://github.com/sky021/regalia-pass-on)**  
A marketplace for students to pass academic regalia on to the next class. Graduation attire is expensive and used once. Deployment is coming soon.

**[ReFocus.AI](https://github.com/sky021/FocusWhisper)**  
A productivity app that uses real-time, psychology-informed nudges to help people recover from distraction. I built the prototype at InnovationHacks 2025 and I am rebuilding it for a public launch. [Hackathon page](https://devpost.com/software/refocus-ai).

## What you can run here

Four case studies include an in-browser demo. Each one starts with the problem, then shows the architecture and the tradeoffs.

| Case study | Demo | What it does |
| --- | --- | --- |
| [NL2SQL Agent](https://akashagrawal.dev/work/nl2sql-agent) | Real SQL | Turns a question into verified SQL, then repairs bad queries |
| [Content protection](https://akashagrawal.dev/work/content-protection) | Real encryption | Encrypts an article and revokes access in under a second |
| [LambdaLens](https://akashagrawal.dev/work/lambdalens) | Simulation | Runs a serverless video pipeline and shows the cost cut |
| [Particle tracking](https://akashagrawal.dev/work/particle-tracking) | Simulation | Keeps identity on thousands of particles through occlusion |

Demos are labeled as real logic, simulation, or an abstracted model. None of them use live production data.

## Run it locally

You need **Node 22.6 or newer**.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build          # production build
npm run start          # serve the production build
npm run lint           # lint
npm run verify         # check the SQL engine, simulations, and encryption
npm run verify:sql     # 61 SQL engine checks
npm run verify:sims    # 46 simulation and crypto checks
```

To check every route and every local asset against a running server:

```bash
npm run start
npm run verify:routes -- http://127.0.0.1:3000
```

## Environment variables

The site runs with none of these set. Copy `.env.example` to `.env.local` if you want to change them.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap, and social cards |
| `RESEND_API_KEY` | Sends contact form email. Without it, submissions are logged |
| `RESEND_FROM_EMAIL` | Verified sender address |
| `CONTACT_EMAIL` | Where contact form messages go |

## Stack

- Next.js 15, React 19, TypeScript
- Tailwind CSS, class-based dark mode
- Zod for form validation, Resend for email
- No extra UI libraries. Icons, diagrams, highlighting, and the SQL engine live in this repo.

## How the repo is organized

```
app/           Pages, metadata, and the contact form
components/    Site UI and the four demos
content/       All copy: profile, roles, current projects, case studies
lib/           SQL engine, simulations, and encryption
scripts/       Verification checks
legacy/        Previous static site, kept for reference
```

Edit `content/work.ts` to change profile copy, current projects, experience, or case studies. The home page, work index, sitemap, footer, and search palette all read from that file.

Demo logic lives in `lib/` so Node can test it without a browser. The components only render that state.

## Notes

- Reduced-motion settings stop canvas loops and show a settled frame.
- Demos pause when they leave the screen.
- Only interactive pieces ship JavaScript. The rest is server-rendered.
- A small script sets the theme before first paint, so the page does not flash.

## License

See [LICENSE](LICENSE).
