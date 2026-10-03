# Glen Monteiro — Portfolio Website

Personal portfolio for **Glen Monteiro**, Full Stack Developer (Web & Mobile Apps) & Digital Visibility Specialist, based in Bengaluru and working worldwide.

Built with **Next.js 16**, **React 19**, **Tailwind CSS 4**, **TypeScript**, and **Drizzle ORM** (PostgreSQL). Content (profile, services, projects) lives in [`src/data/portfolio.json`](src/data/portfolio.json) and can be edited through a local-only admin dashboard.

## Sections

- **Hero** — animated name marquee behind a transparent portrait cutout, booking CTA
- **Value strip** — Web & mobile apps · Business systems & e-commerce · Digital visibility & growth
- **Tools dock** — infinite marquee of the tools shipped with (payments, automation, domains, hosting)
- **About** — bio, education, portrait
- **Services** — 7 offerings (web/mobile apps, SEO/GEO/AEO, NFC/QR review cards, hosting & social, CRM systems, e-commerce, AI automations)
- **Selected work** — project marquee with live screenshots
- **Contact** — free-consultation booking via [Cal.com](https://cal.com/glen-monteiro/15-min-meeting), email, LinkedIn

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Command            | What it does                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`      | Start the dev server                      |
| `npm run build`    | Production build (keeps API routes)       |
| `npm run start`    | Serve the production build                |
| `npm run lint`     | ESLint                                    |
| `npm run typecheck`| `tsc --noEmit`                            |

### Environment

`DATABASE_URL` is required by `src/db/index.ts` (used by `/api/health`). Without it, the homepage still runs, but the health check fails:

```bash
# .env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

Drizzle config: [`drizzle.config.json`](drizzle.config.json) → schema at [`src/db/schema.ts`](src/db/schema.ts).

## Editing content

**Option A — admin dashboard (dev only):** run `npm run dev` and open `/admin`. Edit profile, services, and projects (with URL preview), import the portrait photo, then save — it writes back to `src/data/portfolio.json`. The API backing it (`/api/local-admin/*`) is blocked in production.

**Option B — edit [`src/data/portfolio.json`](src/data/portfolio.json) directly**, following the types in [`src/data/types.ts`](src/data/types.ts).

## Portraits

- `public/images/glen-portrait.jpg` — original photo (about section)
- `public/images/glen-cutout.webp` — transparent cutout (hero)

Regenerate the hero cutout from any photo on a plain light backdrop:

```bash
node scripts/make-cutout.mjs <photo> [output]
# default output: public/images/glen-cutout.webp
```

## Deploying (Cloudflare Pages, static)

A static export can't include server routes, so the build script moves `/api` and `/admin` aside, builds, and restores them:

```bash
node scripts/build-static.mjs   # output → ./out
```

> **Windows:** stop `npm run dev` first — the dev server's file watcher locks
> `src/app/api`, and the stash step fails with `EPERM` while it's running.

Deploy the `out/` folder to Cloudflare Pages.

## Other scripts

- `scripts/verify-dock.cjs <url>` — headless check that the tech-dock marquee loops seamlessly at 1920/1440/1024/390px widths
- `scripts/audit-light-contrast.cjs <url> [shots]` — headless contrast audit of the light theme

## Contact

- Email: contact@glenmonteiro.dev
- LinkedIn: https://www.linkedin.com/in/glen-monteiro
- Book a call: https://cal.com/glen-monteiro/15-min-meeting
