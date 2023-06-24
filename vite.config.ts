import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";
import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// Unsolved issue with vite + ionic pwa elements.
// https://github.com/ionic-team/pwa-elements/issues/109
// This is the solution I decided on: https://github.com/ionic-team/pwa-elements/issues/109#issuecomment-1472349295

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
    const env = loadEnv(mode, process.cwd());

    if (!env.VITE_GIT_BRANCH) {
        // Inject the current branch for use with remote books
        process.env.VITE_GIT_BRANCH = execSync("git branch --show-current").toString().trimEnd();
    }

    process.env.VITE_APP_VERSION = process.env.npm_package_version;

    // Pass the package version to the program from the package.json file
    // Customize it for staging and feature branches
    if (process.env.VITE_GIT_BRANCH == "main") {
        process.env.VITE_FULL_PROGRAM_VERSION = process.env.npm_package_version;
    } else if (process.env.VITE_GIT_BRANCH == "staging") {
        process.env.VITE_FULL_PROGRAM_VERSION = "Beta " + process.env.npm_package_version;
    } else {
        process.env.VITE_FULL_PROGRAM_VERSION = "Alpha " + process.env.npm_package_version;
    }

    console.log("Current App Version:", process.env.VITE_APP_VERSION);
    console.log("Current Version:", process.env.VITE_FULL_PROGRAM_VERSION);
    console.log("Branch:", process.env.VITE_GIT_BRANCH);

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        // We use this to factor in for github hosting, as for github, it's not served at the root, it's at the root + repository name
        // https://vitejs.dev/guide/static-deploy.html#github-pages
        // This parameter is pretty much always expected to end in a "/"
        base: env.VITE_BASE_URL,
    };
});
