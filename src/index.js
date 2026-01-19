import TOML from "@iarna/toml";

import headerToml from "../content/header.toml";
import aboutToml from "../content/about.toml";
import experienceToml from "../content/experience.toml";
import skillsToml from "../content/skills.toml";
import educationToml from "../content/education.toml";
import linksToml from "../content/links.toml";

const contentSources = {
  header: headerToml,
  about: aboutToml,
  experience: experienceToml,
  skills: skillsToml,
  education: educationToml,
  links: linksToml,
};

function formatText(text) {
  if (!text) return "";
  return text
    .replace(/\\textbf\{([^}]+)\}/g, '<span class="font-bold">$1</span>')
    .replace(/\\textit\{([^}]+)\}/g, '<span class="italic">$1</span>')
    .replace(/\\&/g, "&");
}

const renderers = {
  header: (data) => `
    <h1 class="text-5xl font-bold mb-2 text-gray-900">${data.name}</h1>
    <p class="text-xl text-gray-600">${data.title}</p>
  `,

  about: (data) => `<p class="about-content">${data.text}</p>`,

  experience: (data) =>
    data.jobs
      .map(
        (job) => `
    <div class="job-entry">
      <div class="job-header">
        <h3 class="job-title">${formatText(job.title)}</h3>
        <span class="job-period">${job.period}</span>
      </div>
      <p class="job-company">${job.company}</p>
      <blockquote class="job-description">${formatText(job.description)}</blockquote>
      ${job.achievements?.length ? `<ul class="job-achievements">${job.achievements.map((a) => `<li>${formatText(a)}</li>`).join("")}</ul>` : ""}
    </div>`,
      )
      .join(""),

  skills: (data) =>
    data.categories
      .map(
        (cat) => `
    <div class="skill-category">
      <h3 class="skill-category-name">${cat.name}</h3>
      <div class="flex flex-wrap">${cat.skills.map((s) => `<span class="skill-tag">${s}</span>`).join("")}</div>
    </div>`,
      )
      .join(""),

  education: (data) =>
    data.degrees
      .map(
        (deg) => `
    <div class="education-entry">
      <div class="education-header">
        <span class="education-degree">${deg.degree}</span>
        <span class="education-year">${deg.year}</span>
      </div>
      <p class="education-institution">${deg.institution}</p>
      ${deg.details ? `<p class="text-base text-gray-900 mt-2">${deg.details}</p>` : ""}
    </div>`,
      )
      .join(""),

  links: (data) => {
    const items = [];
    if (data.email)
      items.push(
        `<a href="mailto:${data.email}" class="header-link">${data.email}</a>`,
      );
    if (data.linkedin)
      items.push(
        `<a href="${data.linkedin}" class="header-icon" target="_blank" title="LinkedIn"><img src="images/linkedin.svg" alt="LinkedIn" width="24" height="24"></a>`,
      );
    if (data.github)
      items.push(
        `<a href="${data.github}" class="header-icon" target="_blank" title="GitHub"><img src="images/github.svg" alt="GitHub" width="24" height="24"></a>`,
      );
    if (data.telegram)
      items.push(
        `<a href="${data.telegram}" class="header-icon" target="_blank" title="Telegram"><img src="images/telegram.svg" alt="Telegram" width="24" height="24"></a>`,
      );
    return items.join("");
  },
};

export default {
  async fetch(request) {
    const path = new URL(request.url).pathname;

    if (path.startsWith("/api/")) {
      const section = path.slice(5);
      const source = contentSources[section];
      const render = renderers[section];

      if (!source || !render) {
        return new Response("Not Found", { status: 404 });
      }

      try {
        const html = render(TOML.parse(source));
        return new Response(html, {
          headers: { "Content-Type": "text/html" },
        });
      } catch (err) {
        return new Response("Error: " + err.message, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
