// Pure render functions: TOML-parsed data -> HTML fragments.
// Shared by the build step (build.mjs). No runtime/Worker dependency.

export function formatText(text) {
  if (!text) return "";
  return text
    .replace(/\\textbf\{([^}]+)\}/g, '<span class="font-bold">$1</span>')
    .replace(/\\textit\{([^}]+)\}/g, '<span class="italic">$1</span>')
    .replace(/\\&/g, "&");
}

export const renderers = {
  header: (data) => `
    <h1 class="cv-name">${data.name}</h1>
    <p class="cv-title">${data.title}</p>
  `,

  about: (data) => `<p class="about-content">${data.text}</p>`,

  experience: (data) => {
    // One entry per role: title, company, dates, then bullets — the linear
    // Title/Company/Date order ATS parsers expect.
    const entry = (job) => `
    <div class="job-entry">
      <div class="job-header">
        <h3 class="job-title">${formatText(job.title)}</h3>
        <span class="job-period">${job.period}</span>
      </div>
      <p class="job-company">${job.company}</p>
      <blockquote class="job-description">${formatText(job.description)}</blockquote>
      ${job.achievements?.length ? `<ul class="job-achievements">${job.achievements.map((a) => `<li>${formatText(a)}</li>`).join("")}</ul>` : ""}
    </div>`;

    return (data.jobs ?? []).map(entry).join("");
  },

  skills: (data) =>
    data.categories
      .map(
        (cat) => `
    <p class="skill-line"><span class="skill-category-name">${cat.name}:</span> ${cat.skills.join(", ")}</p>`,
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
      ${deg.details ? `<p class="education-details">${deg.details}</p>` : ""}
    </div>`,
      )
      .join(""),

  // Plain-text contact line. URLs are rendered as visible text (not icons) so
  // an ATS can actually extract them.
  links: (data) => {
    const strip = (u) => u.replace(/^https?:\/\//, "");
    const primary = [];
    const online = [];
    if (data.phone)
      primary.push(
        `<a href="tel:${data.phone.replace(/\s/g, "")}" class="header-link">${data.phone}</a>`,
      );
    if (data.email)
      primary.push(
        `<a href="mailto:${data.email}" class="header-link">${data.email}</a>`,
      );
    if (data.location) primary.push(`<span>${data.location}</span>`);
    if (data.website)
      online.push(
        `<a href="${data.website}" class="header-link" target="_blank">${strip(data.website)}</a>`,
      );
    if (data.github)
      online.push(
        `<a href="${data.github}" class="header-link" target="_blank">${strip(data.github)}</a>`,
      );
    if (data.linkedin)
      online.push(
        `<a href="${data.linkedin}" class="header-link" target="_blank">${strip(data.linkedin)}</a>`,
      );
    if (data.telegram)
      online.push(
        `<a href="${data.telegram}" class="header-link" target="_blank">${strip(data.telegram)}</a>`,
      );
    const separator = ' <span class="contact-sep">·</span> ';
    return [primary, online]
      .filter((group) => group.length)
      .map((group) => group.join(separator))
      .join("<br />");
  },
};
