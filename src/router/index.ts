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
            path: "/display/:book/:song",
            props: true,
            component: () => import("../views/SongDisplayView.vue"),
        },
        {
            path: "/settings/import_songs",
            component: () => import("../views/ImportSongsView.vue"),
        },
    ],
});

export default router;
