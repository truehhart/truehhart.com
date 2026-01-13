# CLAUDE.md

## Project Overview

Personal CV website deployed on Cloudflare Workers. Content is stored in TOML files and rendered dynamically via HTMX.

## Tech Stack

- **HTMX** - Dynamic content loading (CDN)
- **Tailwind CSS** - Styling (CDN)
- **TOML** - Content storage

## Commands

```bash
npm run dev      # Local development
npm run deploy   # Deploy to Cloudflare
npm run format   # Prettier
```

## Project Structure

```
src/index.js          # Worker entry point, renders TOML to HTML
public/index.html     # Main HTML with HTMX attributes
public/styles.css     # Custom CSS + print styles
public/favicon.svg    # Site icon
content/*.toml        # CV content (header, about, experience, skills, education, links)
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

## API Routes

Worker serves these endpoints (consumed by HTMX):

- `/api/header`
- `/api/about`
- `/api/experience`
- `/api/skills`
- `/api/education`
- `/api/links`
