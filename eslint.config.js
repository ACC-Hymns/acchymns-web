import pluginVue from "eslint-plugin-vue";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import prettierConfig from "@vue/eslint-config-prettier";

export default defineConfigWithVueTs(
    {
        name: "app/files-to-lint",
        files: ["**/*.{ts,mts,tsx,js,jsx,vue}"],
    },
    {
        name: "app/files-to-ignore",
        ignores: ["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "ios/**", "android/**"],
    },

    pluginVue.configs["flat/essential"],
    vueTsConfigs.recommended,
    prettierConfig,

    {
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
            "no-unused-vars": "off",
            // Ignore all unused variables that start with an underscore
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
        },
    },
);
