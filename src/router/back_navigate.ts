import router from "@/router/index";

// Example back navigation:
// / -> /
// /app -> /
// /settings/about -> /settings
function navigateBack() {
    const current_route = router.currentRoute.value;
    const last_section = current_route.path.lastIndexOf("/");

    // This route is the root, or a child of the root
    if (last_section == 0) {
        // I don't know whether to use, push or replace
        // Ideally there should be a "pop" version of this
        console.log("navigating from", current_route.fullPath, "to", "/");
        router.push("/");
        return;
    }

    console.log("navigating from", current_route.fullPath, "to", current_route.path.substring(0, last_section));
    // Otherwise the root we're trying to target, the end index is `last_section`
    router.push(current_route.path.substring(0, last_section));
}

export { navigateBack };
