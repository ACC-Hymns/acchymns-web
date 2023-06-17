import { fileURLToPath, URL } from "node:url";
import { execSync } from "node:child_process";
import { defineConfig, loadEnv, type ConfigEnv } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
    // Inject the current branch for use with remote books
    const branch_name = execSync("git rev-parse --abbrev-ref HEAD").toString().trimEnd();
    process.env.VITE_GIT_BRANCH = branch_name;

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
        base: env.VITE_BASE_URL,
    };
});
