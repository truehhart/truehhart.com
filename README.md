# truehhart.com

Simple personal CV website, designed to be easy to edit and deploy.

Content lives in TOML files and is **prerendered at build time** into
self-contained static pages (all CSS inlined, no client-side fetches),
served as static assets on Cloudflare:

| Path      | Page                                                               |
| --------- | ------------------------------------------------------------------ |
| `/`       | Landing / profile card                                             |
| `/resume` | Styled CV — same page as `/`, prerendered with the CV view visible |
| `/cv`     | Plain ATS-friendly CV, also the source for the PDF export          |

The landing and styled CV ship together in one HTML file; switching between
them transforms the card in place (staggered CSS grid-row transitions + the
History API for the URL),
so no network calls after the initial load.

## Features

- Content stored in TOML files for easy editing, rendered into every page
- Prerendered to static HTML — no runtime, no client-side requests
- Animated landing ↔ CV switch with zero network traffic
- Tailwind CSS compiled at build time, tree-shaken, and inlined

## Prerequisites

Tool versions are pinned with [mise](https://mise.jdx.dev/):

```bash
mise install        # installs the pinned node + pnpm (see mise.toml)
```

No mise? Use any Node 26 / pnpm 11 install instead.

## Quick Start

```bash
pnpm install
pnpm run dev        # builds, then serves via wrangler dev
```

## Build

```bash
pnpm run build      # content/*.toml -> dist/ (/, /resume, /cv)
```

`pnpm run dev` and `pnpm run deploy` run this automatically.

## Deployment

```bash
pnpm run deploy
```

Requires a Cloudflare account and `wrangler` authentication.

## Editing Content

All CV content lives in the `content/` directory. Edit a file and re-run the
build (or `pnpm run dev`) to see changes.

| File              | Content            |
| ----------------- | ------------------ |
| `header.toml`     | Name, title        |
| `about.toml`      | Short bio          |
| `experience.toml` | Work history       |
| `skills.toml`     | Skills by category |
| `education.toml`  | Degrees            |
| `links.toml`      | Contact links      |

### Example: Adding a job

```toml
[[jobs]]
title = "Software Engineer"
company = "Company Name"
period = "Jan 2020 - Present"
description = "Brief role description."
achievements = [
  "First achievement",
  "Second achievement with \\textit{italic} text"
]
```

### Text Formatting

Use LaTeX-style markup in TOML strings:

- `\textbf{bold}`
- `\textit{italic}`
- `\&` for ampersand

## How It Works

`build.mjs` parses each `content/*.toml`, renders it to HTML fragments via
`src/render.mjs`, and injects them into the `{{placeholder}}`s of the two
templates: `src/index.html` (the combined landing + styled CV page, written to
both `/` and `/resume` with the matching view prerendered visible) and
`src/template.html` (`/cv`). It then compiles Tailwind (scanned against the
rendered pages so only used classes ship), inlines it together with the
per-page CSS (`public/site.css`, `public/styles.css`),
copies `public/images/`, and writes everything to `dist/`.

## Tech Stack

- [Cloudflare static assets](https://developers.cloudflare.com/workers/static-assets/) - Edge hosting
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS, compiled at build time
- [@iarna/toml](https://github.com/iarna/iarna-toml) - TOML parser
- [mise](https://mise.jdx.dev/) - Tool version management
