import { useRouter } from "vue-router";

// Example back navigation:
// / -> /
// /app -> /
// /settings/about -> /settings
function useNavigator() {
    const router = useRouter();

    function back() {
        const current_route = router.currentRoute.value;
        const last_section = current_route.fullPath.lastIndexOf("/");

        console.log("Current Route:", current_route.fullPath, current_route.path);

        // This route is the root, or a child of the root
        if (last_section == 0) {
            // I don't know whether to use, push or replace
            // Ideally there should be a "pop" version of this
            console.log("Navigating to: /");
            router.push("/");
            return;
        }

        // Otherwise the root we're trying to target, the end index is `last_section`
        const chopped_path = current_route.path.substring(0, last_section);
        console.log("Navigating to:", chopped_path);
        router.push(chopped_path);
    }
    return { back };
}

export { useNavigator };
