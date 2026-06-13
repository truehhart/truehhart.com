# CLAUDE.md

## Project Overview

Personal CV website deployed on Cloudflare as a static-assets-only deployment.
Content lives in TOML files and is prerendered into a single self-contained
`dist/index.html` at build time — no runtime, no Worker, no client-side fetches.

## Tech Stack

- **TOML** - Content storage
- **Tailwind CSS** - Compiled at build time, scanned against the output, inlined
- **Cloudflare static assets** - Serves the prerendered `dist/`

## Commands

```bash
pnpm run build   # Render content/*.toml -> dist/index.html (run by dev & deploy)
pnpm run dev     # Build, then serve via wrangler dev
pnpm run deploy  # Build, then deploy dist/ to Cloudflare
pnpm run format  # Prettier
```

## Project Structure

```
build.mjs             # Build step: TOML -> dist/index.html, compiles + inlines CSS
src/template.html     # Page shell with {{section}} placeholders
src/render.mjs        # Pure renderers: TOML data -> HTML fragments
src/input.css         # Tailwind entry (@tailwind base/components/utilities)
tailwind.config.js    # Tailwind config (scans dist/index.html)
public/styles.css     # Hand-written CSS + print styles (appended after Tailwind)
public/images/        # SVG icons + favicon (copied to dist/)
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
