<script setup lang="ts">
import { RouterLink, createRouterMatcher } from "vue-router";
import { useNavigator } from "@/router/navigator";
import { onMounted, ref } from "vue";
import axios, { Axios, type AxiosResponse } from 'axios';
import { UserStatus, request_client, scan, set, validate_token, type ChurchData, type TokenAuthResponse, type AuthResponse, set_bg_color, get } from "@/scripts/broadcast";
import { Preferences } from "@capacitor/preferences";
import { type BookDataSummary, type Bible, type BibleBook, type BibleChapter, type BibleVerse, BookSourceType } from "@/scripts/types";
import { fetchCachedJSON } from "@/composables/cached_fetch";
import router from "@/router";
import { Capacitor } from "@capacitor/core";
import { loadBookSources } from "@/scripts/book_import";
const { back } = useNavigator();

const unlocked = ref<boolean>(false);
const input = ref<string>("");
const status = ref<UserStatus>(UserStatus.None);
let platform = ref<string>(Capacitor.getPlatform());
let login_error = ref<boolean>(false);
let selected_church = ref('LOADING');
let hexinput = ref<HTMLInputElement>();
let churches = ref<ChurchData[]>([]);
let bible = ref<Bible>();
let touched_pin = ref<number>(0);
let book_sources = ref<BookDataSummary[]>([]);

async function check_code(code: string) {
    let response = await axios.post('https://iahifuumb7zasmzuv5xqpmi7fu0pwtkt.lambda-url.us-east-2.on.aws/',
        {
            code: code
        }
    );
    return response;
}
async function authorize(response: AxiosResponse<any,any>) {
    let auth = response.data as AuthResponse;
    if(response.status == 200) {
        await Preferences.set({ key: "broadcasting_auth_token", value: auth.token});
        status.value = UserStatus.Authorized;

        let data = await scan(request_client());
        churches.value = [];
        for (const [key, value] of Object.entries(data)) {
            churches.value.push(value);
        }
        selected_church.value = auth.church_id;
        await populate_bg_color();
    } else {
        console.log(response.data);
        setTimeout(() => {
            login_error.value = false;
            input.value = "";
        }, 400);
    }
}

async function populate_bg_color() {
  let church_data: ChurchData = (await get(request_client(), selected_church.value)).Item as unknown as ChurchData;
  if(hexinput.value) {
    hexinput.value.value = church_data.BG_COLOR.S;
  }
} 

async function clear() {
    await set(request_client(), selected_church.value, "", "", [-1], "");
}

async function signout() {
    await Preferences.set({ key: "broadcasting_auth_token", value: ""});
    status.value = UserStatus.Unauthorized;
    input.value = "";
    unlocked.value = false;
}

function view_output() {
    router.push({path: "/broadcast"})
}

function backspace_pin() {
    if(input.value.length > 0) {
        input.value = input.value.substring(0, input.value.length - 1);
    }
}

function enter_pin(value: number) {
    input.value += value;
}

async function back_button() {
    if(bibleReading.value || songNumber.value) {
        bibleReading.value = false;
        songNumber.value = false;
        await populate_bg_color();
    } else {
        back();
    }
}

async function set_bg() {
  if(!hexinput.value)
    return;

  let value = hexinput.value.value;

  if(value == "")
    value = "#FFFFFF";
  
  if(value[0] != "#")
    return;

  await set_bg_color(request_client(), selected_church.value, value);
}

async function handle_tap(index: number) {
    if(index == 10)
        return;

    touched_pin.value = index;

    if(index == 12) {
        backspace_pin();
    } else if (index == 11) {
        enter_pin(0);
    }
    else {
        enter_pin(index);
    }

    
    if(input.value.length > 4)
        return;

    if(input.value.length == 4) {
        let response = await check_code(input.value);
        unlocked.value = response.status == 200;
        if(!unlocked.value)
            login_error.value = true;

        setTimeout(() => {
            authorize(response);
        }, 500);
    }
}

onMounted(async () => {
    selected_church.value = "...";
    bible.value = (await (await fetch(import.meta.env.BASE_URL + "NKJV.bible.json", {})).json()) as Bible || { version: "", books: []};
    
    let temp = await loadBookSources();
    book_sources.value = temp.filter(b => b.status == BookSourceType.DOWNLOADED || b.status == BookSourceType.IMPORTED || b.status == BookSourceType.BUNDLED);
    console.log(book_sources.value);
    let broadcasting_auth_token = await Preferences.get({ key: "broadcasting_auth_token"});

    for(let [index, book] of bible.value.books.entries()) {
        if(index > 38)
            new_testament.value.push(book);
        else
            old_testament.value.push(book);
    }
    fix_chapter_range();
    fix_verse_range();

    if (broadcasting_auth_token.value != "" && broadcasting_auth_token.value != undefined) {
        let token_response = await validate_token(broadcasting_auth_token.value);
        if(token_response.status != 200)
            return signout();
        let token_response_data = token_response.data as TokenAuthResponse;

        status.value = UserStatus.Authorized;
        let data = await scan(request_client());
        churches.value = [];
        for (const [key, value] of Object.entries(data)) {
            churches.value.push(value);
        }

        selected_church.value = token_response_data.church_id;
        await populate_bg_color();
    } else {
        return signout();
    }
});

async function broadcast_reading(e: MouseEvent) {
    let top_text = "";
    let bottom_text = "";
    if(read_type.value == 1) {
        top_text = `${book.value}`;
        bottom_text = `${chapter_start.value}:${verse_start.value}-${bible.value?.books.find(b => b.name == book.value)?.chapters.find(c => c.num == chapter_start.value)?.verses.length}`;
    } else if(read_type.value == 2) {
        top_text = `${book.value}`;
        if(verse_start.value == verse_end.value)
            bottom_text = `${chapter_start.value}:${verse_start.value}`;
        else
            bottom_text = `${chapter_start.value}:${verse_start.value}-${verse_end.value}`;
    } else {
        top_text = `${book.value} `;
        bottom_text = `${chapter_start.value}:${verse_start.value}-${bible.value?.books.find(b => b.name == book.value)?.chapters.find(c => c.num == chapter_start.value)?.verses.length}, ${chapter_end.value}:1-${verse_end.value}`;
    }

    await set(request_client(), selected_church.value, top_text, "BIBLE", [], bottom_text);
}


let bibleReading = ref<boolean>(false);
let songNumber = ref<boolean>(false);

let selected_hymnal = ref<number>(0);
let song_number = ref<string>("");
let verses = ref<number[]>([]);

function set_selected_hymnal(e: Event, id: number) {
    selected_hymnal.value = id;
}

async function broadcast_song_number(e: MouseEvent) {
    let book = book_sources.value[selected_hymnal.value];
    if(!book)
        return book;
    await set(request_client(), selected_church.value, song_number.value, book.name?.medium || "", verses.value, book.primaryColor || "#000000");
}

let old_testament = ref<BibleBook[]>([]);
let new_testament = ref<BibleBook[]>([]);
let book = ref("Genesis");
let chapter_start = ref(1);
let chapter_end = ref(1);
let verse_start = ref(1);
let verse_end = ref(1);
let read_type = ref(1);

function fix_chapter_range() {
    if(chapter_start.value > get_chapter_start_list(book.value).length) {
        chapter_start.value = 1;
    }
    if(chapter_end.value > get_chapter_end_list(book.value).length) {
        chapter_end.value = chapter_start.value;
    }
}

function fix_verse_range() {
    if(verse_start.value > get_verse_start_list(book.value, chapter_start.value).length) {
        verse_start.value = 1;
    }
    if(verse_end.value > get_verse_end_list(book.value, (read_type.value == 3 ? chapter_end.value : chapter_start.value)).length) {
        verse_end.value = (read_type.value == 3 ? 1 : verse_start.value);
    }
    if(read_type.value == 1)
        verse_end.value = get_verse_start_list(book.value, chapter_start.value).length;
}
function book_changed(e: Event) {
    book.value = (e.target as HTMLSelectElement).innerText;
    fix_chapter_range();
    fix_verse_range();
}
function chapter_start_changed(e: Event) {
    chapter_start.value = Number.parseInt((e.target as HTMLSelectElement).innerText);
    fix_verse_range();
}
function chapter_end_changed(e: Event) {
    chapter_end.value = Number.parseInt((e.target as HTMLSelectElement).innerText);
    fix_verse_range();
}
function verse_start_changed(e: Event) {
    verse_start.value = Number.parseInt((e.target as HTMLSelectElement).innerText);
}
function verse_end_changed(e: Event) {
    verse_end.value = Number.parseInt((e.target as HTMLSelectElement).innerText);
}
function read_type_changed(e: Event, id: number) {
    read_type.value = id;
}

function get_chapter_start_list(book: string) {
    let b: BibleBook = bible.value?.books.find(b => b.name == book) || { name: "", chapters: []};
    return b.chapters;
}

function get_chapter_end_list(book: string) {
    let b: BibleBook = bible.value?.books.find(b => b.name == book) || { name: "", chapters: []};
    let chapter_end_list: BibleChapter[] = [];
    if(chapter_start.value > 0) {
        for (let i = chapter_start.value + 1; i <= b?.chapters.length; i++) {
            chapter_end_list.push(b.chapters[i-1]);
        }
        return chapter_end_list;
    }
    return b.chapters;
}

function get_verse_start_list(book: string, chapter: number) {
    let b: BibleBook = bible.value?.books.find(b => b.name == book) || { name: "", chapters: []};
    let c: BibleChapter = b.chapters.find(c => c.num == chapter) || { num: 0, verses: []};
    return c.verses;
}
function get_verse_end_list(book: string, chapter: number) {
    let b: BibleBook = bible.value?.books.find(b => b.name == book) || { name: "", chapters: []};
    let c: BibleChapter = b.chapters.find(c => c.num == chapter) || { num: 0, verses: []};
    let verse_end_list: BibleVerse[] = [];
    if(verse_start.value > 0) {
        for (let i = (read_type.value == 3) ? 1 : verse_start.value; i <= c?.verses.length; i++) {
            verse_end_list.push(c.verses[i-1]);
        }
        return verse_end_list;
    }
    return c.verses;
}

function get_lock_icon() {
    return unlocked.value ? import.meta.env.BASE_URL + "assets/lock-open-outline.svg" : import.meta.env.BASE_URL + "assets/lock-closed-outline.svg";
}

</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back_button()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">{{ bibleReading ? "Bible Reading" : "Broadcast" }}</h1>
        </div>
    </div>
    <div v-if="status == UserStatus.Unauthorized" class="login-container">

        <div class="login-instructions">
            <img class="ionicon" :class="{'unlocked': unlocked}" :src="get_lock_icon()" />
            <p>Please enter 4-digit PIN</p>
        </div>
        <div class="pin-input-container" :class="{'pin-input--error': login_error }">
            <div v-for="i in 4" :class="(input.length == i - 1) ? 'pin-space-active' : 'pin-space'">
                <img v-if="input.length >= i" class="ionicon pin-dot" src="/assets/ellipse.svg" />
            </div>
        </div>
        <div class="keypad">
            <div class="key" v-for="i in 12" @click="handle_tap(i)" @animationend="touched_pin = 0"
                :style="{'opacity': (i == 10) ? 0 : 1}">
                <a v-if="i == 10"></a>
                <a v-else-if="i == 11">
                    <h4>0</h4>
                </a>
                <a v-else-if="i == 12" class="backspace">
                    <img class="ionicon keyicon" src="/assets/backspace.svg" />
                </a>
                <a v-else>
                    <h4>{{ i }}</h4>
                </a>
            </div>
        </div>
    </div>
    <div class="main-content" v-else-if="status == UserStatus.Authorized">
        <div v-if="bibleReading">
            <div class="center-container">
                <h3>Reading Type</h3>
                <div class="book-selector" :class="{'hide-scrollbar': platform !== 'web'}">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a @click="(e) => read_type_changed(e,1)" class="biblebook"
                        :class="{'selected': read_type == 1}">Start Only</a>
                    <a @click="(e) => read_type_changed(e,2)" class="biblebook"
                        :class="{'selected': read_type == 2}">Start End</a>
                    <a @click="(e) => read_type_changed(e,3)" class="biblebook"
                        :class="{'selected': read_type == 3}">Start End Chapter</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <h3>Book</h3>
                <div class="book-selector">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a class="biblebook" :class="{'selected': b.name == book}" @click="(e: Event) => book_changed(e)"
                        v-for="b in old_testament" :key="b.name">{{ b.name }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <div class="book-selector">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a class="biblebook" :class="{'selected': b.name == book}" @click="(e: Event) => book_changed(e)"
                        v-for="b in new_testament" :key="b.name">{{ b.name }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <h3>Chapter</h3>
                <div class="number-selector">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a class="biblebook" :class="{'selected': c.num == chapter_start}"
                        @click="(e: Event) => chapter_start_changed(e)" v-for="c in get_chapter_start_list(book)"
                        :key="c.num">{{ c.num }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <h3>Start Verse</h3>
                <div class="number-selector">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a class="biblebook" :class="{'selected': v.num == verse_start}"
                        @click="(e: Event) => verse_start_changed(e)"
                        v-for="v in get_verse_start_list(book, chapter_start)" :key="v.num">{{ v.num }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <h3 v-if="read_type == 3">End Chapter</h3>
                <div v-if="read_type == 3" class="number-selector">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a class="biblebook" :class="{'selected': c.num == chapter_end}"
                        @click="(e: Event) => chapter_end_changed(e)" v-for="c in get_chapter_end_list(book)"
                        :key="c.num">{{ c.num }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <h3 v-if="read_type > 1">End Verse</h3>
                <div v-if="read_type > 1" class="number-selector">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a class="biblebook" :class="{'selected': v.num == verse_end}"
                        @click="(e: Event) => verse_end_changed(e)"
                        v-for="v in get_verse_end_list(book, read_type == 3 ? chapter_end : chapter_start)"
                        :key="v.num">{{ v.num }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>
                <div>
                    <button class="send-button" @click="(e) => broadcast_reading(e)">Send</button>
                </div>
                <button class="settings-button" @click="back_button()">Back</button>

            </div>
        </div>
        <div v-else-if="songNumber">
            <div class="center-container">
                <h3>Hymnal</h3>
                <div class="book-selector" :class="{'hide-scrollbar': platform !== 'web'}">
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-for="i in book_sources.length" @click="(e) => set_selected_hymnal(e,i - 1)" class="biblebook"
                        :class="{'selected': selected_hymnal == i - 1}" :style="{'background-color': book_sources[i - 1].primaryColor}">{{ book_sources[i - 1].name?.medium }}</a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                    <a v-if="platform !== 'web'" class="biblebook space"></a>
                </div>

                <div class="center-container">
                    <h3>Song Number</h3>
                    <input type="text" pattern="\d*" maxlength="3" class="number-input-bar" v-model="song_number" name="song" placeholder="#" />
                </div>
                <h3>Verses</h3>
                <div class="verse-list">
                    <div></div>
                    <a class="verse" :class="{ 'verse-selected': verses[0] == -2}" @click="(e) => {

                        if(verses[0] == -2) {
                            verses = [];
                            return;
                        } else {
                            verses = [];  
                            verses.push(-2);
                        }
                        
                    }">
                    All
                    </a>
                    <div></div>
                </div>
                <div class="verse-list">
                    <a v-for="verse in 12" :key="verse" class="verse" :class="{ 'verse-selected': verses.includes(verse)}" @click="(e) => {

                        if(verses[0] == -2) 
                            verses = [];

                        if(verses.includes(verse))
                            verses.splice(verses.indexOf(verse), 1);
                        else
                            verses.push(verse);
                    }">
                        {{ verse }}
                    </a>
                </div>
                <div>
                    <button class="send-button" :disabled="song_number.length == 0 || Number(song_number) == 0" @click="(e) => broadcast_song_number(e)">Send</button>
                </div>
                <button class="settings-button" @click="back_button()">Back</button>

            </div>
        </div>
        <div v-else-if="status == UserStatus.Authorized" class="center-container">
            <h1 style="margin-bottom: 0px;">Authorized</h1>
            <h3 style="margin-top: 0px;">as {{ selected_church }}</h3>
            <div class="settings width-100">
                <a v-if="platform == 'web'" href="/broadcast" class="settings-option">
                    <span>Open Output Display</span>
                    <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
                </a>
                <a @click="songNumber = true" class="settings-option">
                    <span>Set Song Number</span>
                    <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
                </a>
                <a @click="bibleReading = true" class="settings-option">
                    <span>Set Bible Reading</span>
                    <img class="entrypoint ionicon" src="/assets/chevron-forward-outline.svg" />
                </a>
                <a @click="set_bg()" class="settings-option">
                    <span>
                      Set Background Color
                      <input ref="hexinput" class="hexinput" type="text" placeholder="#FFFFFF"/>
                    </span>
                </a>
                <a @click="clear" class="settings-option">
                    <span>Clear Screen</span>
                </a>
                <a @click="signout" class="settings-option">
                    <span>Log Out</span>
                </a>
            </div>
        </div>
        <nav class="nav">
            <RouterLink to="/" class="nav__link">
                <img class="ionicon nav__icon" src="/assets/home-outline.svg" />
                <span class="nav__text">Home</span>
            </RouterLink>
            <RouterLink to="/search" class="nav__link">
                <img class="ionicon nav__icon" src="/assets/search-outline.svg" />
                <span class="nav__text">Search</span>
            </RouterLink>
            <RouterLink to="/bookmarks" class="nav__link">
                <img class="ionicon nav__icon" src="/assets/bookmark-outline.svg" />
                <span class="nav__text">Bookmarks</span>
            </RouterLink>
            <RouterLink to="/settings" class="nav__link nav__link--active">
                <img class="ionicon nav__icon--active" src="/assets/settings.svg" />
                <span class="nav__text">Settings</span>
            </RouterLink>
        </nav>
    </div>
    <div v-else class="lds-ring-container">
        <!--Loading Ring-->
        <div class="lds-ring">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
    </div>
</template>

<style>
@import "@/assets/css/settings.css";

.verse {
    color: var(--color);
    border-radius: 50px;
    background-color: var(--button-color);
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    padding: 15px 15px;
    margin: 5px;
}

.verse-selected {
    box-shadow: inset 0 0 0 4px var(--blue);
}
.verse-list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    width: 75%;
    text-align: center;
}

.number-input-bar {
    background-color: var(--search-color);
    height: 40px;
    width: 10vw;
    border-radius: 15px;
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: center;
    font-size: 22px;
}

label {
    font-size: 22px;
    color: var(--color);
}
:root {
    --key-size: 8vh;
}

.hexinput {
  background-color: var(--slider-base);
  width: 6em;
  border-radius: 15px;
  margin: 0 15px;
}

.login-instructions {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: calc(12vh + env(safe-area-inset-top));
    color: var(--color);
}
.login-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100vh;
    width: 100%;
    position: fixed;
    top: 0;
    background-color: var(--song-background);
}
.pin-input-container {
    margin: 20px auto 120px auto;
    display: flex;
    justify-content: center;
    gap: 1vh;
}
.pin-dot {
    filter: var(--svg-color);
    width: 25%;
    height: 25%;
}
.pin-space-active {
    border-radius: 5px;
    border: 1px solid var(--blue);
    width: 6vh;
    height: 6vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
.pin-space {
    border-radius: 5px;
    border: 1px solid var(--back-color);
    width: 6vh;
    height: 6vh;
    display: flex;
    justify-content: center;
    align-items: center;
}
.pin-input--error {
    animation-name: loginError;
    animation-duration: 0.1s;
    animation-iteration-count: 2;
}
@keyframes loginError {
    25% {
        transform: translateX(-5px);
    }
    75% {
        transform: translateX(5px);
    }
}
@keyframes loginSuccess {
    25% {
        transform: translateY(5px);
    }
    75% {
        transform: translateY(0);
    }
}

.unlocked {
    animation-name: loginSuccess;
    animation-duration: 0.2s;
}

.pin-input {
    background-color: var(--search-color);
    border-radius: 2vh;
    width: 25vh;
    height: 2vh;
    font-size: 2vh;
    margin: 20px auto;
    padding: 1vh 2vh;
    align-self: center;
    text-align: center;
    color: var(--color);
    border: none;
    line-height: 100%;
}
.keypad {
    display: grid;
    grid-template-columns: var(--key-size) var(--key-size) var(--key-size);
    grid-template-rows: var(--key-size) var(--key-size) var(--key-size) var(--key-size);
    gap: calc(var(--key-size)/2);
}
.backspace {
    display: flex;
    justify-content: center;
    align-items: center;
}
.key {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: var(--song-background);
    border-radius: 100%;
    font-size: 3vh;
    line-height: 100%;
    color: var(--color);
    user-select: none;
    -moz-user-select: none;
    -webkit-user-select: none;    
    transition: background-color 0.1s ease-out;
}
.key:active {
    background-color: var(--button-tap);
}
.keyicon {
    font-size: 4vh;
    width: 4vh;
    height: 4vh;
    filter: var(--svg-back-filter);
}

.book-selector {
    display: flex;
    flex-wrap: nowrap; 
    overflow: auto;
    width: 95vw;

    &:after {
        content: "";
        position: absolute;
        z-index: 0;
        top: 0;
        right: 0;
        bottom: 15px;
        pointer-events: none;
        background-image: linear-gradient(to right, rgba(255,255,255,0), var(--background) 85%);
        width: 30px;
    }
    &:before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        bottom: 15px;
        pointer-events: none;
        background-image: linear-gradient(to left, rgba(255,255,255,0), var(--background) 85%);
        width: 30px;
    }
}

.number-selector {
    display: flex;
    flex-wrap: wrap; 
    flex-direction: column;
    overflow: auto;
    width: 95vw;
    height: 12vh;
}
.hide-scrollbar::-webkit-scrollbar {
    display: none;
}

.biblebook {
    flex: 0 0 auto;
    vertical-align: middle;
    background-color: lightgray;
    padding: 5px 15px;
    border-radius: 15px;
    margin: 2px 2px 2px 2px;
    line-height: 200%;
    background-color: var(--search-color);
    color: var(--color);
    text-align: center;
    cursor: pointer;
}
.space {
    opacity: 0;
    width: 5px;
}
.selected {
    -webkit-box-shadow:inset 0px 0px 0px 4px var(--blue);
    -moz-box-shadow:inset 0px 0px 0px 4px var(--blue);
    box-shadow:inset 0px 0px 0px 4px var(--blue);
}

.width-100 {
    align-self: stretch;
}

.center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
.send-button {
    all: unset;
    height: 44px;
    background-color: var(--blue);
    color: white;
    border-radius: 15px;
    padding: 6px 20px;
    height: 30px;
    box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
    margin: 20px;
    cursor: pointer;
}

.send-button:disabled {
    background-color: var(--blue-disabled);
    cursor: not-allowed;
}

.input-container {
    display: block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 22px;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    color: var(--color);
}

.input-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
}

.checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: var(--back-color);
    border-radius: 50%;
}

.input-container:hover input ~ .checkmark {
    background-color: #ccc;
}

.input-container input:checked ~ .checkmark {
    background-color: var(--blue);
}

.checkmark:after {
    content: "";
    position: absolute;
    display: none;
}

.input-container input:checked ~ .checkmark:after {
    display: block;
}

.settings-button {
    all: unset;
    height: 44px;
    line-height: 44px;
    background-color: var(--search-color);
    color: var(--color);
    border-radius: 10px;
    padding: 0 10px;
    margin: 10px;
    cursor: pointer;
}

.settings-radio {
    display: flex;
    flex-direction: column;
    align-items: left;
    justify-content: left;
}

@keyframes fade-in-3s-delay {
  0% {
    opacity: 0%;
  }
  30% {
    opacity: 0%;
  }
  100% {
    opacity: 100%;
  }
}

.lds-ring-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 61.16px);
    margin-top: 61.16px;
    animation: 5s fade-in-3s-delay;
}

.lds-ring {
    /* change color here */
    color: var(--back-color);
}

.lds-ring,
.lds-ring div {
    box-sizing: border-box;
}

.lds-ring {
    display: inline-block;
    position: relative;
    width: 64px;
    height: 64px;
}

.lds-ring div {
    box-sizing: border-box;
    display: block;
    position: absolute;
    width: 64px;
    height: 64px;
    border: 6px solid currentColor;
    border-radius: 50%;
    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
    border-color: currentColor transparent transparent transparent;
}

.lds-ring div:nth-child(1) {
    animation-delay: -0.45s;
}

.lds-ring div:nth-child(2) {
    animation-delay: -0.3s;
}

.lds-ring div:nth-child(3) {
    animation-delay: -0.15s;
}

@keyframes lds-ring {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}
</style>
