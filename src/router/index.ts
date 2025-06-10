import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import { App } from "@capacitor/app";
import type { URLOpenListenerEvent } from "@capacitor/app";

import { usePostHog } from '@/composables/usePostHog'

const { posthog } = usePostHog();

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    scrollBehavior(to, _, savedPosition) {
        const overriden_routes = ["/selection"];
        if (overriden_routes.some(route => to.path.startsWith(route))) {
            console.log("[VueRouter] ScrollBehavior: overridden");
            return;
        }
        // Otherwise just return to the last saved position after 100ms
        if (savedPosition) {
            return new Promise(resolve => {
                setTimeout(() => resolve(savedPosition), 100);
            });
        }
    },
    routes: [
        {
            path: "/",
            component: HomeView,
        },
        {
            path: "/selection/:book",
            props: true,
            component: () => import("../views/SongSelectionView.vue"),
            children: [
                {
                    path: "",
                    component: () => import("../views/selection/NumericalView.vue"),
                },
                {
                    path: "alphabetical",
                    component: () => import("../views/selection/AlphabeticalView.vue"),
                },
                {
                    path: "topical",
                    component: () => import("../views/selection/TopicalView.vue"),
                },
            ],
        },
        {
            path: "/display/:book/:number",
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
            path: "/settings/help/console",
            component: () => import("../views/SettingsHelpConsoleView.vue"),
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
            path: "/settings/connect",
            component: () => import("../views/SettingsConnect.vue"),
        },
        {
            path: "/:catchAll(.*)",
            component: () => import("../views/404View.vue"),
        },
        {
            path: "/broadcast",
            component: () => import("../views/BroadcastView.vue"),
        },
    ],
});

// Deep Linking for IOS + Android
// https://capacitorjs.com/docs/next/guides/deep-links#vue
App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
    // Example url: https://acchymns.app/tabs/tabs2
    // slug = /tabs/tabs2
    console.log("[Deep Linking] Navigating to:", event.url);
    const slug = event.url.split(".app").pop();

    // We only push to the route if there is a slug present
    if (slug) {
        router.push(slug);
    }
});

export default router;
