# CLAUDE.md

## Project Overview

Personal CV website deployed on Cloudflare as a static-assets-only deployment.
Content lives in TOML files and is prerendered into self-contained static pages
at build time — no runtime, no Worker, no JS, no client-side fetches.

Three paths, all rendered from the same TOML content:

- `/` and `/resume` (`src/index.html` + `public/site.css`) — one combined page
  with a single card that transforms in place between the landing and the
  styled CV: rows (document bar, landing nav, CV sections) grow open/closed
  via staggered CSS grid-row transitions while a tiny inline script toggles
  `body.view-cv` and drives the History API (no network calls). `/resume` is
  the same page prerendered with the CV view visible so deep links work
  without JS.
- `/cv` (`src/template.html` + `public/styles.css`) — plain ATS-friendly CV,
  also the source for the PDF export

## Tech Stack

- **TOML** - Content storage
- **Tailwind CSS** - Compiled at build time, scanned against the output, inlined
- **Cloudflare static assets** - Serves the prerendered `dist/`

## Commands

```bash
pnpm run build   # Render content/*.toml -> dist/ (/, /resume, /cv) (run by dev & deploy)
pnpm run dev     # Build, then serve via wrangler dev
pnpm run deploy  # Build, then deploy dist/ to Cloudflare
pnpm run format  # Prettier
pnpm run pdf "Position Title"  # Build with header title overridden, print to "Dmitrii Parshenkov.pdf"
```

## Project Structure

```
build.mjs             # Build step: TOML -> dist/ pages, compiles + inlines CSS
hack/pdf.mjs          # Render /cv page to PDF via headless Chromium (pnpm run pdf)
src/index.html        # Combined landing + styled CV page (/, /resume) with view-swap script
src/template.html     # Plain ATS CV template (/cv, {{section}} placeholders)
src/render.mjs        # Pure renderers: TOML data -> HTML fragments
src/input.css         # Tailwind entry (@tailwind base/components/utilities)
tailwind.config.js    # Tailwind config (scans dist/**/*.html)
public/site.css       # Combined page: shared card, both views, transform animation
public/styles.css     # Plain CV CSS + print styles (inlined into /cv)
public/images/        # Portrait, SVG icons + favicon (copied to dist/)
content/*.toml        # CV content (header, about, experience, skills, education, links)
dist/                 # Build output served by Cloudflare (gitignored)
```

## Content Files

Edit these to update CV content:

- `content/header.toml` - Name and title
- `content/about.toml` - Short bio
- `content/experience.toml` - Work history
- `content/skills.toml` - Skill categories
- `content/education.toml` - Degrees
- `content/links.toml` - Email, GitHub, LinkedIn

## Text Formatting

In TOML content, use LaTeX-style markup:

- `\textbf{text}` → bold
- `\textit{text}` → italic
- `\&` → ampersand

## Rendering

Each section is rendered by a function in `src/render.mjs` and injected into the
matching `{{section}}` placeholder in `src/template.html`. To change content,
edit the TOML and re-run `pnpm run build`.
