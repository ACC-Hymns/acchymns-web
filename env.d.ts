/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GIT_BRANCH: string;
    readonly VITE_FULL_PROGRAM_VERSION: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
