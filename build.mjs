// Build step: render TOML content into static pages with all CSS inlined.
// Output goes to dist/, which Cloudflare serves as static assets.
//
// Landing and the styled CV ship together in one page that swaps views
// client-side (no network calls); /resume is the same page prerendered with
// the CV view visible, so deep links work without JS.
//
//   content/*.toml + src/index.html    ->  dist/index.html + dist/resume/index.html
//   content/*.toml + src/template.html ->  dist/cv/index.html  (ATS CV)
//   tailwind (scanned against dist) + public/*.css -> inlined <style>

import TOML from "@iarna/toml";
import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";

import { renderers } from "./src/render.mjs";

const SECTIONS = [
  "header",
  "about",
  "experience",
  "skills",
  "education",
  "links",
];

// Private contacts (phone, telegram) are kept out of committed content and
// injected from .env only when it exists — so local builds include them and
// the public site (built without .env) does not.
try {
  process.loadEnvFile(".env");
} catch {
  // No .env: public build, private contacts stay out.
}

const data = Object.fromEntries(
  SECTIONS.map((s) => [
    s,
    TOML.parse(readFileSync(`content/${s}.toml`, "utf8")),
  ]),
);
// Position-tailored builds (pdf.mjs) override the header title.
if (process.env.CV_TITLE) data.header.title = process.env.CV_TITLE;
if (process.env.PHONE) data.links.phone = process.env.PHONE;
if (process.env.TELEGRAM) data.links.telegram = process.env.TELEGRAM;

// Function replacement so `$`-sequences in content (e.g. "$1.2M") stay literal.
const fill = (template, values) =>
  Object.entries(values).reduce(
    (html, [key, value]) => html.replaceAll(`{{${key}}}`, () => value),
    template,
  );

const fragments = Object.fromEntries(
  SECTIONS.map((s) => [s, renderers[s](data[s])]),
);
const shared = {
  name_text: data.header.name,
  name_html: data.header.name.split(" ").join("<br />"),
  tagline: `${data.header.title} · ${data.links.location}`,
  description: `${data.header.name} — ${data.header.title}`,
};

// 1. Render all pages (CSS and {{view}} placeholders still present) so
//    Tailwind can scan them.
const site = fill(readFileSync("src/index.html", "utf8"), {
  ...shared,
  ...fragments,
  email: data.links.email,
  github: data.links.github,
  linkedin: data.links.linkedin,
});
const classic = fill(readFileSync("src/template.html", "utf8"), fragments);

// ponytail: overwrite in place, don't rm dist — wrangler dev serves it live and
// deleting the dir mid-serve crashes the server. Deleted/renamed content leaves
// stale files; `rm -rf dist` before a clean build if that ever bites.
mkdirSync("dist/resume", { recursive: true });
mkdirSync("dist/cv", { recursive: true });
writeFileSync("dist/index.html", site);
writeFileSync("dist/cv/index.html", classic);
cpSync("public/images", "dist/images", { recursive: true });

// 2. Compile Tailwind down to only the classes used across the pages, then
//    inline it together with the hand-written styles. Zero CSS requests.
const tailwindBin =
  process.platform === "win32"
    ? "node_modules/.bin/tailwindcss.cmd"
    : "node_modules/.bin/tailwindcss";
execFileSync(
  tailwindBin,
  [
    "-c",
    "tailwind.config.js",
    "-i",
    "src/input.css",
    "-o",
    "dist/.tailwind.css",
    "--minify",
  ],
  { stdio: "inherit" },
);
const tailwindCss = readFileSync("dist/.tailwind.css", "utf8");
rmSync("dist/.tailwind.css");

const inlineStyles = (html, ...cssFiles) =>
  html.replace("/*STYLES*/", () =>
    [tailwindCss, ...cssFiles.map((f) => readFileSync(f, "utf8"))].join("\n"),
  );

const siteFinal = inlineStyles(site, "public/site.css");
writeFileSync("dist/index.html", fill(siteFinal, { view: "" }));
writeFileSync("dist/resume/index.html", fill(siteFinal, { view: "view-cv" }));
writeFileSync("dist/cv/index.html", inlineStyles(classic, "public/styles.css"));

console.log("Built dist/ (/, /resume, /cv)");
