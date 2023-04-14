import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: "/",
            component: HomeView,
        },
        {
            path: "/selection/:book",
            props: true,
            component: () => import("../views/SongSelectionView.vue"),
        },
        {
            path: "/topical/:book",
            props: true,
            component: () => import("../views/TopicalIndexView.vue"),
        },
        // {
        //     path: "/alphabetical/:book",
        //     props: true,
        //     component: () => import("../views/AlphabeticalIndexView.vue"),
        // },
        {
            path: "/display/:book/:song",
            props: true,
            component: () => import("../views/SongDisplayView.vue"),
        },
        {
            path: "/search",
            component: () => import("../views/SearchView.vue"),
        },
        {
            path: "/bookmarks",
            component: () => import("../views/BookmarkedView.vue"),
        },
        {
            path: "/settings",
            component: () => import("../views/SettingsView.vue"),
        },
        {
            path: "/settings/about",
            component: () => import("../views/SettingsAboutView.vue"),
        },
        {
            path: "/settings/about/changelog",
            component: () => import("../views/SettingsAboutChangelogView.vue"),
        },
        {
            path: "/settings/about/attributions",
            component: () => import("../views/SettingsAboutAttributionsView.vue"),
        },
        {
            path: "/settings/help",
            component: () => import("../views/SettingsHelpView.vue"),
        },
        {
            path: "/settings/options",
            component: () => import("../views/SettingsOptionsView.vue"),
        },
        {
            path: "/settings/import",
            component: () => import("../views/SettingsImportView.vue"),
        },
        {
            path: "/:catchAll(.*)",
            component: () => import("../views/404View.vue"),
        },
    ],
});

export default router;
