# truehhart.com

Simple personal CV website, designed to be easy to edit an deploy.

## Features

- Content stored in TOML files for easy editing
- Serverless deployment on Cloudflare Workers
- Dynamic loading via HTMX

## Quick Start

```bash
npm install
npm run dev
```

## Deployment

```bash
npm run deploy
```

Requires Cloudflare account and `wrangler` authentication.

## Editing Content

All CV content lives in the `content/` directory:

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

## Tech Stack

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless runtime
- [HTMX](https://htmx.org/) - HTML-driven interactivity
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [@iarna/toml](https://github.com/iarna/iarna-toml) - TOML parser
