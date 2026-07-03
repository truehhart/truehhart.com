// Render the CV to a PDF, optionally tailored to a position:
//
//   pnpm run pdf                             # default title
//   pnpm run pdf "Senior Platform Engineer"  # header title overridden
//
// Prints dist/cv/index.html to "<name>.pdf" via headless Chromium.

import TOML from "@iarna/toml";
import { execFileSync } from "node:child_process";
import { existsSync, globSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// Optional: without a position the CV renders with its default title.
const position = process.argv[2];

// ponytail: reuses the Playwright-cached Chromium instead of adding puppeteer;
// set CHROME_BIN if neither cache nor Chrome exists.
const chrome = [
  process.env.CHROME_BIN,
  ...globSync(
    join(
      homedir(),
      "Library/Caches/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-*/chrome-headless-shell",
    ),
  ),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
]
  .filter(Boolean)
  .find(existsSync);
if (!chrome) {
  console.error("No Chromium found. Set CHROME_BIN to a Chrome binary.");
  process.exit(1);
}

execFileSync("node", ["build.mjs"], {
  stdio: "inherit",
  env: position ? { ...process.env, CV_TITLE: position } : process.env,
});

const { name } = TOML.parse(readFileSync("content/header.toml", "utf8"));
const out = resolve(`${name}.pdf`);
execFileSync(chrome, [
  "--headless",
  // Let the Google Fonts webfont load before printing.
  "--virtual-time-budget=10000",
  `--print-to-pdf=${out}`,
  "--no-pdf-header-footer",
  pathToFileURL("dist/cv/index.html").href,
]);

console.log(`Wrote ${out}`);
