import { Preferences } from "@capacitor/preferences";

export async function migrate() {
    const current_semver_version = import.meta.env.VITE_APP_VERSION;
    const previous_semver_version = await Preferences.get({ key: "AppVersion" });
    if (previous_semver_version.value === current_semver_version) {
        return;
    }

    // TODO - FIX MIGRATION
    // Pre-2.0.0, as after this version, we always set the AppVersion.
    /*if (previous_semver_version.value == null) {
        // Migrate from 1.X.Y to 2.0.0
        // All that's required to migrate, is to move bookmark data from localStorage to Capacitor Storage.
        // and to change from { book: string, song: string } to { book: string, number: string }
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") ?? "[]");
        const new_bookmarks = [];
        for (const bookmark of bookmarks) {
            if (bookmark.song) {
                new_bookmarks.push({ book: bookmark.book, number: bookmark.song });
            } else {
                // We've already been migrated.??
                new_bookmarks.push(bookmark);
            }
        }
        await Preferences.set({ key: "bookmarks", value: JSON.stringify(new_bookmarks) });
    }*/
}
