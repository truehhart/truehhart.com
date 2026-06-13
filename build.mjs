// Build step: render TOML content into a single static HTML file with all CSS
// inlined. Output goes to dist/, which Cloudflare serves as static assets.
//
//   content/*.toml + src/template.html  ->  dist/index.html
//   tailwind (scanned against dist) + public/styles.css  ->  inlined <style>

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

// 1. Render each TOML section to an HTML fragment and fill the template.
let html = readFileSync("src/template.html", "utf8");
for (const section of SECTIONS) {
  const data = TOML.parse(readFileSync(`content/${section}.toml`, "utf8"));
  const fragment = renderers[section](data);
  // Function replacement so `$`-sequences in content (e.g. "$1.2M") stay literal.
  html = html.replace(`{{${section}}}`, () => fragment);
}

// 2. Write the page (CSS placeholder still present) so Tailwind can scan it.
rmSync("dist", { recursive: true, force: true });
mkdirSync("dist", { recursive: true });
writeFileSync("dist/index.html", html);
cpSync("public/images", "dist/images", { recursive: true });

// 3. Compile Tailwind down to only the classes used on the page, then inline
//    it together with the hand-written styles. Result: zero CSS requests.
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
const customCss = readFileSync("public/styles.css", "utf8");
rmSync("dist/.tailwind.css");

// Function replacement so `$`-sequences in the CSS stay literal.
html = html.replace("/*STYLES*/", () => `${tailwindCss}\n${customCss}`);
writeFileSync("dist/index.html", html);

console.log("Built dist/index.html");
