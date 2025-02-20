import { Preferences } from "@capacitor/preferences";
import { PositionType, type BookmarkItem, type Folder, type SongReference } from "./types";
import { Toast } from "@capacitor/toast";

async function get_folders() {
    let bookmark_data = JSON.parse((await (Preferences.get({ key: "bookmark_data" }))).value ?? "[]") as BookmarkItem[];
    let folders = bookmark_data.filter(item => item.type === "folder");
    return folders.map(folder => folder.data as Folder);
}

async function add_song(bookmark: SongReference) {
    console.log("Adding song", bookmark);
    let bookmark_data = JSON.parse((await (Preferences.get({ key: "bookmark_data" }))).value ?? "[]") as BookmarkItem[];
    bookmark_data.push({
        type: PositionType.SONG,
        data: bookmark,
    });
    await Preferences.set({ key: "bookmark_data", value: JSON.stringify(bookmark_data) });
    await Toast.show({
        text: `#${bookmark.number} added to Bookmarks`,
    });
}

async function add_song_to_folder(uuid: string, bookmark: SongReference) {
    console.log("Adding song to folder", uuid, bookmark);
    let bookmark_data = JSON.parse((await (Preferences.get({ key: "bookmark_data" }))).value ?? "[]") as BookmarkItem[];
    let folder_items = bookmark_data.filter(item => item.type === "folder");
    let f = folder_items.find(f => (f.data as Folder).uuid == uuid);
    console.log(f);
    if (!f)
        return;
    (f.data as Folder).items.push({
        type: PositionType.SONG,
        data: bookmark,
    });
    await Preferences.set({ key: "bookmark_data", value: JSON.stringify(bookmark_data) });

    await Toast.show({
        text: `#${bookmark.number} added to '${(f.data as Folder).title}'`,
    });
}

async function folder_has_song(uuid: string, song: SongReference) {
    let folder = (await get_folders()).find(folder => folder.uuid === uuid);
    if(!folder)
        return false;
    return folder.items.find(item => item.type === PositionType.SONG && (item.data as SongReference).number === song.number && (item.data as SongReference).book === song.book) != null;
}

async function all_bookmarks_has_song(song: SongReference) {
    let bookmark_data = JSON.parse((await (Preferences.get({ key: "bookmark_data" }))).value ?? "[]") as BookmarkItem[];
    return bookmark_data.find(item => item.type === PositionType.SONG && (item.data as SongReference).number === song.number && (item.data as SongReference).book === song.book) != null;
}

export { get_folders, add_song_to_folder, add_song, folder_has_song, all_bookmarks_has_song };