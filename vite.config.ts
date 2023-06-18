import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";
import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
    // Inject the current branch for use with remote books
    const branch_name = execSync("git rev-parse --abbrev-ref HEAD").toString().trimEnd();
    process.env.VITE_GIT_BRANCH = branch_name;

    // Pass the package version to the program from the package.json file
    // Customize it for staging and feature branches
    if (branch_name == "main") {
        process.env.VITE_PROGRAM_VERSION = process.env.npm_package_version;
    } else if (branch_name == "staging") {
        process.env.VITE_PROGRAM_VERSION = "Beta " + process.env.npm_package_version;
    } else {
        process.env.VITE_PROGRAM_VERSION = "Alpha " + process.env.npm_package_version;
    }

    const env = loadEnv(mode, process.cwd());

    return {
        plugins: [vue()],
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url)),
            },
        },
        optimizeDeps: {
            // Unsolved issue with vite + ionic pwa elements, this is the workaround.
            // https://github.com/ionic-team/pwa-elements/issues/109
            exclude: [`@ionic/pwa-elements/loader`],
        },
        // We use this to factor in for github hosting, as for github, it's not served at the root, it's at the root + repository name
        // https://vitejs.dev/guide/static-deploy.html#github-pages
        // This parameter is pretty much always expected to end in a "/"
        base: env.VITE_BASE_URL,
    };
});
