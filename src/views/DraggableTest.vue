<script setup lang="ts">
import { RouterLink } from "vue-router";
import { getAllSongMetaData, getAllBookMetaData } from "@/scripts/book_import";
import { computed, ref, onMounted, onUnmounted, nextTick } from "vue";
import { PositionType, type SongReference, type SongSearchInfo, type Song, type BookSummary, type SongList, type BookmarkItem, type Folder, type BlankData } from "@/scripts/types";
import { stripSearchText } from "@/scripts/search";
import { useCapacitorPreferences } from "@/composables/preferences";
import NavigationBar from "@/components/NavigationBar.vue";
import { Color, Solver } from "@/scripts/color";
import { Preferences } from "@capacitor/preferences";

let search_query = ref("");
let stripped_query = computed(() => {
    return stripSearchText(search_query.value);
});
let available_songs = ref<SongSearchInfo[]>([]);

let search_results = computed(() => {
    return available_songs.value
        .filter(s => {
            return (
                s.stripped_title?.includes(stripped_query.value) ||
                s?.stripped_first_line?.includes(stripped_query.value) ||
                s?.number?.includes(stripped_query.value)
            );
        })
        .sort((a, b) => a.title.localeCompare(b.title));
});

const old_bookmarks = useCapacitorPreferences<SongReference[]>("bookmarks", []);
let bookmarks: BookmarkItem[] = [];
const positions = ref<BookmarkItem[]>([]);
let editting = ref(false);

async function move_item(e: ReorderEvent) {
    console.log(JSON.parse(JSON.stringify(positions.value)));
}

function move_sub_item(e: ReorderEvent, index: number) {
    console.log(JSON.parse(JSON.stringify(positions.value)));
}

let latest_folder = ref<Folder | null>(null);
let deleting_folder = ref<Folder | null>(null);

function create_folder() {
    const folder: Folder = {
        title: "New Folder",
        uuid: self.crypto.randomUUID(),
        open: false,
        items: [],
    };
    positions.value.splice(0, 0, {
        type: PositionType.FOLDER,
        data: folder,
    });
    latest_folder.value = folder;
}

function delete_folder(folder: Folder) {
    const index = positions.value.findIndex(p => p.data == folder);
    if (index != -1) {
        positions.value.splice(index, 1);
    }
    latest_folder.value = null;

    if (deleting_folder.value == folder) {
        deleting_folder.value = null;
    }
    save_bookmarks();
}

async function save_bookmarks() {
    // strip unnecessary data back to SongReference
    let temp_bookmarks = JSON.parse(JSON.stringify(positions.value)) as BookmarkItem[];
    for(const bookmark of temp_bookmarks) {
        if(bookmark.type == PositionType.SONG) {
            bookmark.data = {
                book: (bookmark.data as SongSearchInfo).book.name.short,
                number: (bookmark.data as SongSearchInfo).number,
            } as SongReference;
        }
        else if(bookmark.type == PositionType.FOLDER) {
            for(const item of (bookmark.data as Folder).items) {
                if(item.type == PositionType.SONG) {
                    item.data = {
                        book: (item.data as SongSearchInfo).book.name.short,
                        number: (item.data as SongSearchInfo).number,
                    } as SongReference;
                }
            }
        }
    }
    
    console.log(temp_bookmarks);
    await Preferences.set({ key: "bookmark_data", value: JSON.stringify(temp_bookmarks) });
}
async function save_migrated_bookmarks() {
    await Preferences.set({ key: "bookmark_data", value: JSON.stringify(bookmarks) });
}


let BOOK_METADATA: {[k: string]: BookSummary;};
let SONG_METADATA: {[k: string]: SongList;};

function fetch_song_data({ book, number }: SongReference): SongSearchInfo {
    if (SONG_METADATA[book] == undefined)
        return {
            title: "Song not found",
            number: number,
            book: BOOK_METADATA[book],
            stripped_title: "",
            stripped_first_line: "",
        };  

    const song = SONG_METADATA[book][number];
    return ({
        title: song.title ?? "",
        number: number,
        book: BOOK_METADATA[book],
        stripped_title: stripSearchText(song.title ?? ""),
        stripped_first_line: stripSearchText(song.first_line ?? ""),
    } as SongSearchInfo);
}

onMounted(async () => {
    BOOK_METADATA = await getAllBookMetaData();
    SONG_METADATA = await getAllSongMetaData();
    bookmarks = JSON.parse((await Preferences.get({ key: "bookmark_data" })).value ?? "[]") as BookmarkItem[];

    // migrate old bookmarks
    if (old_bookmarks.value.length > 0) {
        for (const bookmark of old_bookmarks.value) {
            bookmarks.push({
                type: PositionType.SONG,
                data: {
                    book: bookmark.book,
                    number: bookmark.number,
                }
            });
        }
        old_bookmarks.value = [];
        await save_migrated_bookmarks();
    }

    // fetch data and replace
    for(const bookmark of bookmarks) {
        if(bookmark.type == PositionType.SONG) {
            const song = fetch_song_data(bookmark.data as SongReference);
            bookmark.data = song;
        }
        else if(bookmark.type == PositionType.FOLDER) {
            for(const item of (bookmark.data as Folder).items) {
                if(item.type == PositionType.SONG) {
                    const song = fetch_song_data(item.data as SongReference);
                    item.data = song;
                }
            }
        }
    }

    for (const bookmark of bookmarks) {
        if(bookmark.type == PositionType.FOLDER) {
            for(const item of (bookmark.data as Folder).items) {
                available_songs.value.push(item.data as SongSearchInfo);
            }
        } else {
            available_songs.value.push(bookmark.data as SongSearchInfo);
        }
    }

    positions.value = bookmarks;
});

function getDirection() {
    return "vertical";
}

let dragOptions = computed(() => {
    return {
        animation: 200,
        group: "description",
        disabled: false,
        ghostClass: "ghost",
        direction: getDirection(),
        fallbackOnBody: true,
    };
});

type ReorderEvent = {
    moved: {
        element: BookmarkItem;
        newIndex: number;
        oldIndex: number;
    };
};

let current_item = ref<BookmarkItem | null>(null);
let parent_folder = ref<BookmarkItem | null>(null);
let parent_folder_elments = ref<HTMLElement[]>([]);
let bookmark_items_elements = ref();
let current_item_element = ref();
let longPressTimeout: number | null = null;
var selected_folder_index = ref<number>(-1);

function find_parent(element: HTMLElement) {
    while (element.parentElement) {
        if (element.parentElement.id == "parent") {
            return element.parentElement;
        }
        element = element.parentElement;
    }
    return null;
}

function mouseupcallback(e: MouseEvent)  {
    if (current_item.value?.drag_data?.dragging) {
        cancelLongPress(e, current_item.value);
    }
}
function mousemovecallback(e: MouseEvent | TouchEvent, song?: BookmarkItem, folder?: BookmarkItem) {
    if (current_item.value?.drag_data?.dragging) {
        drag(e, current_item.value, folder);
    } else {
        cancelLongPress(e, current_item.value);
    }
}

onMounted(() => {
    document.addEventListener("mouseup", mouseupcallback);
    document.addEventListener("mousemove", mousemovecallback);
});

onUnmounted(() => {
    document.removeEventListener("mouseup", mouseupcallback);
    document.removeEventListener("mousemove", mousemovecallback);
})

function startLongPress(e: MouseEvent | TouchEvent, item: BookmarkItem | null, folder?: BookmarkItem) {
    longPressTimeout = window.setTimeout(async () => {
        // Logic to handle long press start
        let element = find_parent(e.target as HTMLElement);
        if (!element) return;
        let rect = element.getBoundingClientRect();

        let marginOffsetX;
        let marginOffsetY;
        var x;
        var y;

        if(folder) {
            marginOffsetX = e instanceof MouseEvent ? e.clientX - rect.left + 15 : e.touches[0].clientX - rect.left + 15;
            marginOffsetY = e instanceof MouseEvent ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
            x = e instanceof MouseEvent ? (e.clientX - marginOffsetX) : e.touches[0].clientX - marginOffsetX;
            y = e instanceof MouseEvent ? (e.clientY - marginOffsetY) : e.touches[0].clientY - marginOffsetY;
        } else {
            marginOffsetX = e instanceof MouseEvent ? e.clientX - rect.left : e.touches[0].clientX - rect.left;
            marginOffsetY = e instanceof MouseEvent ? e.clientY - rect.top : e.touches[0].clientY - rect.top;
            x = e instanceof MouseEvent ? (e.clientX - marginOffsetX) : e.touches[0].clientX - marginOffsetX;
            y = e instanceof MouseEvent ? (e.clientY - marginOffsetY) : e.touches[0].clientY - marginOffsetY;
        }


        current_item.value = JSON.parse(JSON.stringify(item));
        if(!current_item.value) return;
        current_item.value.drag_data = {
            dragging: true,
            folder_hover: false,
            element: element,
            offset_x: marginOffsetX,
            offset_y: marginOffsetY,
            x: x,
            y: y,
        };

        
        if(!folder) {
            // close folders
            for(const position of positions.value) {
                if(position.type == PositionType.FOLDER) {
                    (position.data as Folder).open = false;
                }
            }
            
            // if self is folder, close
            if(current_item.value.type == PositionType.FOLDER) {
                (current_item.value.data as Folder).open = false;
            }

            const index = positions.value.findIndex(p => p == item);

            if(index != -1) {
                let blank_data: BlankData = {
                    height: 0
                }
                positions.value.splice(index, 1, {
                    type: PositionType.BLANK,
                    data: blank_data
                });
            }
        } else {
            parent_folder.value = folder;
            parent_folder_elments.value = Array.from(element.parentNode?.children as unknown as HTMLElement[]);
            let folder_data = parent_folder.value.data as Folder;
            const index = folder_data.items.findIndex(p => p == item);

            if(index != -1) {
                let blank_data: BlankData = {
                    height: 0
                }
                folder_data.items.splice(index, 1, {
                    type: PositionType.BLANK,
                    data: blank_data
                });
            }
        }

    }, 500); // 1/2 second
}

async function cancelLongPress(e: MouseEvent | TouchEvent, item: BookmarkItem | null, folder?: BookmarkItem) {
    if (longPressTimeout) {
        clearTimeout(longPressTimeout);
        longPressTimeout = null;
    }
    if(!current_item.value) return;
    if(current_item.value?.drag_data?.dragging) {
        endDrag(e, item);
    }
}

function endDrag(e: MouseEvent | TouchEvent, item: BookmarkItem | null, folder?: BookmarkItem) {
    e.preventDefault();
    if(!current_item.value)
        return;
    if(!current_item.value.drag_data)
        return;

    if(parent_folder.value) {
        let folder = parent_folder.value.data as Folder;
        let blankIndex = folder.items.findIndex(p => p.type == PositionType.BLANK);
        if(blankIndex != -1) {
            folder.items.splice(blankIndex, 1, current_item.value);
        }
    } else {
        if(selected_folder_index.value != -1) {
            let folder = positions.value[selected_folder_index.value].data as Folder;

            folder.items.push(current_item.value);

            let blankIndex = positions.value.findIndex(p => p.type == PositionType.BLANK);
            if(blankIndex != -1) {
                positions.value.splice(blankIndex, 1);
            }

            selected_folder_index.value = -1;

        } else {
            let blankIndex = positions.value.findIndex(p => p.type == PositionType.BLANK);
            
            if(blankIndex != -1) {
                positions.value.splice(blankIndex, 1, current_item.value);
            }
        }
    }

    

    nextTick(() => {
        current_item.value = null;
        parent_folder.value = null;
        parent_folder_elments.value = [];
    });
}


type coord = {
    x: number;
    y: number;
}

let debugs = ref<coord[]>([]);

function get_list() {
    
}

async function drag(e: MouseEvent | TouchEvent, item: BookmarkItem | null, folder?: BookmarkItem) {
    if(!current_item.value)
        return;
    if(!current_item.value.drag_data)
        return;
    if(!current_item.value.drag_data?.dragging)
        return;
    e.preventDefault();

    let element = current_item.value.drag_data.element;
    if(!element)
        return;
    var x = e instanceof MouseEvent ? (e.clientX - current_item.value.drag_data?.offset_x) : e.touches[0].clientX - current_item.value.drag_data?.offset_x;
    var y = e instanceof MouseEvent ? (e.clientY - current_item.value.drag_data?.offset_y) : e.touches[0].clientY - current_item.value.drag_data?.offset_y;
    current_item.value.drag_data.x = x;
    current_item.value.drag_data.y = y;

    var cursor_y = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

    let elements, item_list;

    if(parent_folder.value) {
        elements = parent_folder_elments.value;
        item_list = (parent_folder.value?.data as Folder).items;
    } else {
        elements = (bookmark_items_elements.value as HTMLElement).children;
        item_list = positions.value;
    }

    // check if cursor is over middle of the element or at either end
        debugs.value = [];
    for(let i = 0; i < elements.length; i++) {
        // ignore self
        if(elements[i].classList.contains("dragging-parent"))
            continue;
        // ignore blank

        if(item_list[i].type == PositionType.BLANK)
            continue;

        let rect = (elements[i] as HTMLElement).getBoundingClientRect();
        
        const padding = 10;
        //debugs.value.push({x: rect.left, y:rect.top + padding});
        //debugs.value.push({x: rect.left, y:rect.bottom - (padding * 2)});
        var centerDistanceFromY = Math.abs(rect.top + rect.height / 2 - cursor_y);
        var topDistanceFromY = Math.abs((rect.top + padding) - cursor_y);
        var bottomDistanceFromY = Math.abs((rect.bottom - (padding * 2)) - cursor_y);

        if(topDistanceFromY < 15) {
            current_item.value.drag_data.folder_hover = false;
            selected_folder_index.value = -1;
            if(i > 0 && item_list[i - 1].type != PositionType.BLANK) {
                let blankIndex = item_list.findIndex(p => p.type == PositionType.BLANK);
                if(blankIndex != -1) {
                    let temp = item_list[i];
                    item_list[i] = item_list[blankIndex];
                    item_list[blankIndex] = temp;
                }
            } else if (i == 0) {
                let blankIndex = item_list.findIndex(p => p.type == PositionType.BLANK);
                if(blankIndex != -1) {
                    let temp = item_list[i];
                    item_list[i] = item_list[blankIndex];
                    item_list[blankIndex] = temp;
                }
            }
        }
        if(bottomDistanceFromY < 15) {
            current_item.value.drag_data.folder_hover = false;
            selected_folder_index.value = -1;
            if(i < item_list.length - 1 && item_list[i + 1].type != PositionType.BLANK) {
                let blankIndex = item_list.findIndex(p => p.type == PositionType.BLANK);
                if(blankIndex != -1) {
                    let temp = item_list[i];
                    item_list[i] = item_list[blankIndex];
                    item_list[blankIndex] = temp;
                }
            } else if (i == item_list.length - 1) {
                let blankIndex = item_list.findIndex(p => p.type == PositionType.BLANK);
                if(blankIndex != -1) {
                    let temp = item_list[i];
                    item_list[i] = item_list[blankIndex];
                    item_list[blankIndex] = temp;
                }
            }
        }
        if(centerDistanceFromY < 5) {
            if(item_list[i].type == PositionType.FOLDER) {
                current_item.value.drag_data.folder_hover = true;
                selected_folder_index.value = i;
            }
        }
    };
}

function get_item_key(item: BookmarkItem) {
    if(item.type == PositionType.SONG) {
        return (item.data as SongSearchInfo).book.name.short + (item.data as SongSearchInfo).number;
    }
    else if(item.type == PositionType.FOLDER) {
        return (item.data as Folder).uuid;
    }
    else if(item.type == PositionType.BLANK) {
        return "BLANK";
    }
    return "";
}

</script>

<template>

    <div class="debug" v-for="debug in debugs" :style="{left: debug.x + 'px', top: debug.y + 'px'}"></div>
    <div class="modals" v-if="latest_folder != null">
        <div class="background-blur"></div>
        <div class="modal-panel">
            <h2 style="margin: 10px 0;">New Folder</h2>
            <input class="edit-text" v-model="(latest_folder.title)" />
            <div class="modal-button-layout">
                <a class="modal-button" @click="delete_folder(latest_folder)">Cancel</a>
                <a class="modal-button-blue" :class="{'modal-button-blue-disabled': latest_folder?.title.length <= 0}" @click="() => {
                    if(!latest_folder)
                        return;
                    if(latest_folder?.title.length > 0)
                        latest_folder = null;
                    
                    save_bookmarks();
                }">Confirm</a>
            </div>
        </div>
    </div>
    <div class="modals" v-if="deleting_folder != null">
        <div class="background-blur"></div>
        <div class="modal-panel">
            <h2 style="margin: 10px 0;">Delete Folder</h2>
            <div class="folder-container folder-preview">
                <div class="folder-title-container">
                    <div>
                        <div class="song-title">{{ deleting_folder.title }}</div>
                        <div class="item-count">{{ deleting_folder.items.length }} item{{ (deleting_folder.items.length == 1) ? "" : "s" }}</div>
                    </div>
                </div>
            </div>
            <div class="modal-button-layout">
                <a class="modal-button" @click="deleting_folder = null">Cancel</a>
                <a class="modal-button-red" @click="() => {
                    if(!deleting_folder)
                        return;
                    delete_folder(deleting_folder);
                }">Delete</a>
            </div>
        </div>
    </div>
    <div>
        <h1 class="pagetitle">Bookmarks</h1>
        <div class="search-bar">
            <input v-model="search_query" placeholder="Search for a song title or number..." aria-label="Search through site content" />
            <button disabled>
                <svg viewBox="0 0 1024 1024">
                    <path
                        class="path1"
                        d="M848.471 928l-263.059-263.059c-48.941 36.706-110.118 55.059-177.412 55.059-171.294 0-312-140.706-312-312s140.706-312 312-312c171.294 0 312 140.706 312 312 0 67.294-24.471 128.471-55.059 177.412l263.059 263.059-79.529 79.529zM189.623 408.078c0 121.364 97.091 218.455 218.455 218.455s218.455-97.091 218.455-218.455c0-121.364-103.159-218.455-218.455-218.455-121.364 0-218.455 97.091-218.455 218.455z"
                    ></path>
                </svg>
            </button>
        </div>
        <div class="bookmark-toolbar" v-if="search_query.length <= 0">
            <h2 class="status-text">{{ editting ? "Edit Bookmarks" : "All Bookmarks" }}</h2>
            <div class="edit-buttons">
                <a v-if="!editting" @click="create_folder" class="confirm-text-container">
                    <img class="ionicon" src="/assets/folder-open-outline.svg" />
                </a>
                <a v-if="!editting" @click="editting = true" class="confirm-text-container">
                    <img class="ionicon" src="/assets/create-outline.svg" />
                </a>
                <a v-else @click="() => {
                    editting = false;
                    save_bookmarks();
                }" class="confirm-text-container">
                    <h3 class="confirm-text">Confirm</h3>
                    <img class="ionicon" src="/assets/checkmark-circle-outline.svg" />
                </a>
            </div>
            
        </div>
        <div class="songlist" v-if="search_query.length <= 0" ref="bookmark_items_elements">
            <TransitionGroup name="flip-list">
                <div  
                    v-for="item in positions" 
                    :key="get_item_key(item)" 
                    id="parent">
                    <div v-if="item.type == PositionType.BLANK" class="blank"></div>
                    <div v-else-if="item.type == PositionType.FOLDER" class="folder-container" :class="{'folder-highlighted': selected_folder_index == positions.indexOf(item)}">
                        <div class="folder-title-container" @click="(item.data as Folder).open = !(item.data as Folder).open"
                        @mousedown="(e: MouseEvent) => startLongPress(e, item)"
                        @mouseup="(e: MouseEvent) => cancelLongPress(e, item)"
                        @touchstart="(e: TouchEvent) => startLongPress(e, item)"
                        @touchend="(e: TouchEvent) => cancelLongPress(e, item)"
                        @touchmove="(e: TouchEvent) => mousemovecallback(e, item)">
                            <div>
                                <div class="song-title">{{ (item.data as Folder).title }}</div>
                                <div class="item-count">{{ (item.data as Folder).items.length }} item{{ ((item.data as Folder).items.length == 1) ? "" : "s" }}</div>
                            </div>
                            <img
                                class="ionicon nav__icon dropdown-icon"
                                src="/assets/chevron-back-outline.svg"
                                :class="{ 'dropdown-icon-active': (item.data as Folder).open }"
                            />
                        </div>
                        <div class="wrapper" :class="{ 'wrapper-active': (item.data as Folder).open }">
                            <div
                                class="content-button-container"
                                :class="{ 'content-button-container-active': (item.data as Folder).open }"
                            >
                                <div
                                    v-for="song in (item.data as Folder).items"
                                    :key="get_item_key(song)"
                                    class="outer-topic-song"
                                    id="parent">
                                    <div v-if="song.type == PositionType.BLANK" class="blank"></div>
                                    <component v-else
                                        :is="!current_item?.drag_data?.dragging ? 'RouterLink' : 'div'"
                                        :to="`/display/${(song.data as SongSearchInfo).book.name.short}/${(song.data as SongSearchInfo).number}`"
                                        class="song topic-song"
                                        :style="`background: linear-gradient(135deg, ${(song.data as SongSearchInfo).book.primaryColor}, ${(song.data as SongSearchInfo).book.secondaryColor})`"
                                        @mousedown="(e: MouseEvent) => startLongPress(e, song, item)"
                                        @mouseup="(e: MouseEvent) => cancelLongPress(e, song, item)"
                                        @touchstart="(e: TouchEvent) => startLongPress(e, song, item)"
                                        @touchend="(e: TouchEvent) => cancelLongPress(e, song, item)"
                                        @touchmove="(e: TouchEvent) => mousemovecallback(e, song, item)"
                                    >
                                        <div>
                                            <div class="song__title">{{ (song.data as SongSearchInfo).title }}</div>
                                            <div class="book__title">{{ (song.data as SongSearchInfo).book.name.medium }}</div>
                                        </div>
                                        <div class="booktext--right">
                                            <div class="song__number">#{{ (song.data as SongSearchInfo).number }}</div>
                                        </div>
                                    </component>

                                    <div v-if="(item.data as Folder).items.length == 0 && (item.data as Folder).open" class="empty-folder">
                                        Empty Folder
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <component v-else-if="item.type == PositionType.SONG"
                        :is="!current_item?.drag_data?.dragging ? 'RouterLink' : 'div'"
                        :key="(item.data as SongSearchInfo).book.name.short + (item.data as SongSearchInfo).number"
                        :to="`/display/${(item.data as SongSearchInfo).book.name.short}/${(item.data as SongSearchInfo).number}`"
                        class="song"
                        :class="{ 'dragging': item.drag_data?.dragging }"
                        :style="`background: linear-gradient(135deg, ${(item.data as SongSearchInfo).book.primaryColor}, ${(item.data as SongSearchInfo).book.secondaryColor})`"
                        @mousedown="(e: MouseEvent) => startLongPress(e, item)"
                        @mouseup="(e: MouseEvent) => cancelLongPress(e, item)"
                        @touchstart="(e: TouchEvent) => startLongPress(e, item)"
                        @touchend="(e: TouchEvent) => cancelLongPress(e, item)"
                        @touchmove="(e: TouchEvent) => mousemovecallback(e, item)"
                    >
                        <div>
                            <div class="song__title">{{ (item.data as SongSearchInfo).title }}</div>
                            <div class="book__title">{{ (item.data as SongSearchInfo).book.name.medium }}</div>
                        </div>
                        <div class="booktext--right">
                            <div class="song__number">#{{ (item.data as SongSearchInfo).number }}</div>
                        </div>
                    </component>
                </div>
            </TransitionGroup>
            <div v-if="current_item"
                id="parent" 
                :style="{
                    position: 'fixed',
                    top: current_item?.drag_data?.y + 'px',
                    left: current_item?.drag_data?.x + 'px',
                    zIndex: 1000
                }"
                class="dragging-parent"
                :class="{'dragging-over-folder': current_item?.drag_data?.folder_hover}"
                ref="current_item_element">
                <div v-if="current_item?.type == PositionType.FOLDER" class="folder-container">
                    <div class="folder-title-container" @click="(current_item?.data as Folder).open = !(current_item?.data as Folder).open">
                        <div>
                            <div class="song-title">{{ (current_item?.data as Folder).title }}</div>
                            <div class="item-count">{{ (current_item?.data as Folder).items.length }} item{{ ((current_item?.data as Folder).items.length == 1) ? "" : "s" }}</div>
                        </div>
                        <img
                            class="ionicon nav__icon dropdown-icon"
                            src="/assets/chevron-back-outline.svg"
                            :class="{ 'dropdown-icon-active': (current_item?.data as Folder).open }"
                        />
                    </div>
                    <div class="wrapper" :class="{ 'wrapper-active': (current_item?.data as Folder).open }">
                        <div
                            class="content-button-container"
                            :class="{ 'content-button-container-active': (current_item?.data as Folder).open }"
                        >
                            <RouterLink
                                v-for="song in (current_item?.data as Folder).items"
                                :key="(song.data as SongSearchInfo).book.name.short + (song.data as SongSearchInfo).number"
                                :to="`/display/${(song.data as SongSearchInfo).book.name.short}/${(song.data as SongSearchInfo).number}`"
                                class="song topic-song"
                                :style="`background: linear-gradient(135deg, ${(song.data as SongSearchInfo).book.primaryColor}, ${(song.data as SongSearchInfo).book.secondaryColor})`"
                            >
                                <div>
                                    <div class="song__title">{{ (song.data as SongSearchInfo).title }}</div>
                                    <div class="book__title">{{ (song.data as SongSearchInfo).book.name.medium }}</div>
                                </div>
                                <div class="booktext--right">
                                    <div class="song__number">#{{ (song.data as SongSearchInfo).number }}</div>
                                </div>
                            </RouterLink>

                            <div v-if="(current_item?.data as Folder).items.length == 0 && (current_item?.data as Folder).open" class="empty-folder">
                                Empty Folder
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else-if="current_item?.type == PositionType.SONG"
                    :key="(current_item?.data as SongSearchInfo).book.name.short + (current_item?.data as SongSearchInfo).number"
                    :to="`/display/${(current_item?.data as SongSearchInfo).book.name.short}/${(current_item?.data as SongSearchInfo).number}`"
                    class="song"
                    :class="{ 'dragging': current_item?.drag_data?.dragging }"
                    :style="`background: linear-gradient(135deg, ${(current_item?.data as SongSearchInfo).book.primaryColor}, ${(current_item?.data as SongSearchInfo).book.secondaryColor})`"
                >
                    <div>
                        <div class="song__title">{{ (current_item?.data as SongSearchInfo).title }}</div>
                        <div class="book__title">{{ (current_item?.data as SongSearchInfo).book.name.medium }}</div>
                    </div>
                    <div class="booktext--right">
                        <div class="song__number">#{{ (current_item?.data as SongSearchInfo).number }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="songlist" v-else>
            <div class="bookmark-toolbar" v-if="search_results.length > 0">
                <h2 class="status-text">Search Results ({{ search_results.length }})</h2>
            </div>
            <RouterLink
                v-for="song in search_results"
                :key="song.book.name.short + song.number"
                :to="`/display/${song.book.name.short}/${song.number}`"
                class="song"
                :style="`background: linear-gradient(135deg, ${song.book.primaryColor}, ${song.book.secondaryColor})`"
            >
                <div>
                    <div class="song__title">{{ song.title }}</div>
                    <div class="book__title">{{ song.book.name.medium }}</div>
                </div>
                <div class="booktext--right">
                    <div class="song__number">#{{ song.number }}</div>
                </div>
            </RouterLink>
        </div>
    </div>

    <NavigationBar current_page="bookmarks" />
</template>

<style>
@import "@/assets/css/search.css";
@import "@/assets/css/song.css";

.debug {
    position: fixed;
    width: 10px;
    height: 10px;
    background-color: red;
    z-index: 1000;
}
.debug2 {
    position: fixed;
    width: 10px;
    height: 10px;
    background-color: lime;
    z-index: 1000;
}


.background-blur {
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(1px);
    background-color: var(--overlay-color);
    position: fixed;
    z-index: 5;
    opacity: 1;
    transition: opacity 0.5s;
}

.modal-panel {
    width: 70vw;
    min-height: max-content;
    background-color: var(--div-color);
    border-radius: 15px;
    position: fixed;
    top: 50%;
    left: 50%;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    z-index: 6;
    transform: translate(-50%, -50%);
    transition:
        opacity 0.5s,
        visibility 0.5s ease;
    opacity: 1;
    text-align: center;
    padding: 15px;
    color: var(--color);
}

.modal-button-layout {
    margin: 10px 30px;
    display: flex;
    justify-content: center;
}
.modal-button-blue {
    width: 100px;
    height: 20px;
    background-color: var(--blue);
    color: white;
    padding: 15px;
    border-radius: 15px;
    margin: 0 0 0 15px;
    cursor: pointer;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
}
.modal-button-red {
    width: 100px;
    height: 20px;
    background-color: rgb(255, 50, 50);
    color: white;
    padding: 15px;
    border-radius: 15px;
    margin: 0 0 0 15px;
    cursor: pointer;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
}
.modal-button-blue-disabled {
    background-color: var(--blue-disabled);
    cursor: default;
}

.modal-button {
    width: 50px;
    height: 20px;
    background-color: var(--cancel-button-color);
    color: white;
    padding: 15px;
    border-radius: 15px;
    cursor: pointer;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
}

.bookmark-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 30px;
    height: 48px;
}

.status-text {
    line-height: 48px;
    margin: 0;
}

.edit-buttons {
    display: flex;
    gap: 15px;
}

.handle {
    width: 30px;
    height: 30px;
    cursor: pointer;
    filter: invert(100%)
}

.edit-text {
    cursor: pointer;
    background-color: var(--button-tap);
    border-radius: 15px;
    padding: 8px 8px 10px 12px;
    width: 70%;
    text-align: left;
}

.trash-icon {
    padding: 0 0 0 10px;
    width: 19px;
    height: 19px;
    transform: translateY(5px);
    cursor: pointer;
    filter: invert(45%) sepia(45%) saturate(6616%) hue-rotate(340deg) brightness(98%) contrast(105%) !important;
}

.confirm-text-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 5px;
    cursor: pointer;
}
.confirm-text {
    color: var(--back-color);
    font-size: 15px;
}

.sortable-fallback {
    opacity: 1 !important;
}

.ghost {
    opacity: 0;
}
.empty-folder {
    color: var(--back-color);
    text-align: center;
    font-style: italic;
    margin: 10px 0;
}

.folder-preview {
    background-color: var(--button-tap) !important;
    margin: 0 !important;
}

.folder-container {
    /*border: 1px solid #bebebe;*/
    box-shadow: var(--thin-shadow);
    background-color: var(--button-color);
    border-radius: 15px;
    margin: 5px 20px;
    padding: 15px;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}

.folder-title-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
}

.folder-title-container.editting {
    margin-bottom: 15px;
}

.folder-highlighted {
    box-shadow: 0 0 0 4px var(--blue);
    background-color: var(--blue-highlight);
}

.song-title {
    text-decoration: none;
    color: var(--color);
    font-weight: 400;
    height: 19px;
}

.item-count {
    color: var(--back-color);
    font-style: italic;
    padding-top: 5px;
    text-align: left;
}

.dropdown-icon {
    transition: rotate ease-out 0.4s;
    transform: translateX(-3px);
    rotate: calc(-90deg);
}

.dropdown-icon-active {
    transition: rotate ease-out 0.4s;
    transform: translateX(3px);
    rotate: calc(90deg);
}

.wrapper {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 0.2s;
}

.wrapper-active {
    grid-template-rows: 1fr;
}

.content-button-container {
    overflow: hidden;
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
}

.content-button-container-active {
    margin-top: 15px;
}

.outer-topic-song {
    width: stretch;
}

.topic-song {
    width: stretch;
    margin: 5px 0 !important;
}

.blank {
    height: 84px;
    width: 100%;
}

.dragging {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;
}

.dragging-parent {
    width: calc(100vw);
    cursor: pointer;
    animation: dragInit 0.2s none;
    transition: transform 0.2s;
    transform: scale(1.05);
}
.dragging-over-folder {
    transform: scale(0.8);
}
@keyframes dragInit {
    0% {
        transform: scale(1);
    }
    100% {
        transform: scale(1.05);
    }
}


</style>
