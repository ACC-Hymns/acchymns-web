/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    extends: ["plugin:vue/vue3-essential", "eslint:recommended", "@vue/eslint-config-typescript", "@vue/eslint-config-prettier"],
    ignorePatterns: ["ios/*", "android/*"],
    rules: {
        "prettier/prettier": [
            "error",
            {
                // Override all options of `prettier` here
                // @see https://prettier.io/docs/en/options.html
                tabWidth: 4,
                printWidth: 200,
                arrowParens: "avoid",
            },
        ],
        // Ignore all unused variables that start with an underscore
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn", // or "error"
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
            },
        ],
    },
    parserOptions: {
        ecmaVersion: "latest",
    },
};
