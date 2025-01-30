/* eslint-env node */
require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
    root: true,
    extends: [
        "plugin:vue/vue3-essential",
        "eslint:recommended",
        "@vue/eslint-config-typescript",
        "@vue/eslint-config-prettier",
    ],
    ignorePatterns: ["ios/*", "android/*"],
    rules: {
        "prettier/prettier": [
            "error",
            {
                endOfLine: "lf",
                tabWidth: 4,
                useTabs: false,
                printWidth: 150,
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
