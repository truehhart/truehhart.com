/** @type {import('tailwindcss').Config} */
module.exports = {
  // Scan the built pages so only the utility classes actually used are emitted.
  content: ["./dist/**/*.html"],
  theme: {
    extend: {
      fontFamily: { sans: ["Fira Sans", "system-ui", "sans-serif"] },
      fontWeight: { bold: "500" },
    },
  },
};
