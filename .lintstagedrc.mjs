// .lintstagedrc.js
/**
 * Configuration for lint-staged
 * This runs various code quality tools on files that are staged for commit
 */
export default {
  // Run ESLint on TypeScript files
  "*.{ts,tsx}": [
    "eslint --fix",
    // Run tests related to changed files if possible
    (files) => {
      const testableFiles = files
        .filter((file) => !file.includes(".d.ts"))
        .filter((file) => !file.includes("types.ts"))
        .join(" ");
      return testableFiles ? `vitest related --run ${testableFiles}` : "";
    },
  ],

  // Format all supported files with Prettier
  "*.{js,jsx,ts,tsx}": ["prettier --write"],

  // Run type checking on the project
  // This runs once per commit, not per file
  //   "**/*.ts?(x)": () => "pnpm type-check",

  // Lint configuration files
  //   "*.config.{js,cjs,mjs}": ["eslint --fix"],
};
