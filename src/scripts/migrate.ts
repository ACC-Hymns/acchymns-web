import { Preferences } from "@capacitor/preferences";
import { loadBookSources } from "./book_import";
import { BookSourceType, type BookDataSummary } from "./types";

export async function migrate() {
    const current_semver_version = import.meta.env.VITE_APP_VERSION;
    const previous_semver_version = await Preferences.get({
        key: "AppVersion",
    });
    if (previous_semver_version.value === current_semver_version) {
        return;
    }

    // Pre-2.0.0, as after this version, we always set the AppVersion.
    if (previous_semver_version.value == null) {
        // Migrate from 1.X.Y to 2.0.0
        // All that's required to migrate, is to move bookmark data from localStorage to Capacitor Storage.
        // and to change from { book: string, song: string } to { book: string, number: string }
        const bookmarks = JSON.parse(localStorage.getItem("bookmarks") ?? "[]");
        let new_bookmarks = JSON.parse(
            (await Preferences.get({ key: "bookmarks" })).value ?? "[]",
        ); // Don't overwrite existing bookmarks just in case
        for (const bookmark of bookmarks) {
            if (bookmark.song) {
                new_bookmarks.push({
                    book: bookmark.book,
                    number: bookmark.song,
                });
            } else {
                // We've already been migrated.??
                new_bookmarks.push(bookmark);
            }
        }
        new_bookmarks = [...new Set(new_bookmarks)]; // Remove duplicates, if any
        await Preferences.set({
            key: "bookmarks",
            value: JSON.stringify(new_bookmarks),
        });
    }

    // migrate old imported book config to new system
    const external_books = (await Preferences.get({ key: "externalBooks" })).value;
    if (external_books != null) {
        await loadBookSources();
        const book_sources_raw = await Preferences.get({ key: "bookSources" });
        const book_sources: BookDataSummary[] = JSON.parse(book_sources_raw.value ?? "[]");

        const book_urls: string[] = JSON.parse(external_books ?? "[]");
        for (const b in book_urls) {
            const book_url_segments = book_urls[b].split("/");
            const book_id = book_url_segments[book_url_segments.length - 1];
            const new_book = book_sources.find(b => b.id == book_id);

            if (new_book == undefined) continue;

            new_book.status = BookSourceType.IMPORTED;
        }
        Preferences.set({ key: "bookSources", value: JSON.stringify(book_sources) });
        Preferences.remove({ key: "externalBooks" });
    }

    // Update the "previous semver version"
    await Preferences.set({ key: "AppVersion", value: current_semver_version });
}
