module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "footer-max-line-length": [0, "always"], // Make sure there is never a max-line-length by disabling the rule
    "header-max-length": [0, "always"],
    "body-max-line-length": [0, "always"],
    "subject-case": [2, "never", ["upper-case", "pascal-case", "start-case"]],
  },
};
