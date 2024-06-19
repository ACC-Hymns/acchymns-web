<script setup lang="ts">
import { RouterLink, createRouterMatcher } from "vue-router";
import { useNavigator } from "@/router/navigator";
import { onMounted, ref } from "vue";
import axios from 'axios';
import { UserStatus, request_client, scan, set, validate_token, type AuthResponse, type ChurchData, type TokenAuthResponse } from "@/scripts/broadcast";
import { Preferences } from "@capacitor/preferences";
import { type Bible, type BibleBook, type BibleChapter, type BibleVerse } from "@/scripts/types";
import { fetchCachedJSON } from "@/composables/cached_fetch";
import router from "@/router";
import { Capacitor } from "@capacitor/core";
const { back } = useNavigator();

const input = ref('')
const status = ref<UserStatus>(UserStatus.Unauthorized)
let platform = ref<string>(Capacitor.getPlatform());
let login_error = ref<boolean>(false);
let selected_church = ref('LOADING');
let churches = ref<ChurchData[]>([]);
let bible = ref<Bible>();
let touched_pin = ref<number>(0);

async function authorize() {
  let response = await axios.post('https://iahifuumb7zasmzuv5xqpmi7fu0pwtkt.lambda-url.us-east-2.on.aws/',
    {
      code: input.value
    }
  );
  let auth_response: AuthResponse = response.data;
  if(response.status == 200) {
    await Preferences.set({ key: "broadcasting_auth_token", value: auth_response.token});
    status.value = UserStatus.Authorized;

    let data = await scan(request_client());
    churches.value = [];
    for (const [key, value] of Object.entries(data)) {
      churches.value.push(value);
    }
    selected_church.value = auth_response.church_id;

  } else {
    console.log(response.data);
    login_error.value = true;
    setTimeout(() => {
      login_error.value = false;
      input.value = "";
    }, 400);
  }
}

async function clear() {
  await set(request_client(), selected_church.value, "", "", [-1], "");
}

async function signout() {
  await Preferences.set({ key: "broadcasting_auth_token", value: ""});
  status.value = UserStatus.Unauthorized;
  input.value = "";
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
  if(input.value.length < 4)
    input.value += value;
}

onMounted(async () => {
  selected_church.value = "...";
  bible.value = await fetchCachedJSON<Bible>(import.meta.env.BASE_URL + "NKJV.bible.json", {}) || { version: "", books: []};
  
  for(let [index, book] of bible.value.books.entries()) {
    if(index > 38)
      new_testament.value.push(book);
    else
      old_testament.value.push(book);
  }
  fix_chapter_range();
  fix_verse_range();

  let broadcasting_auth_token = await Preferences.get({ key: "broadcasting_auth_token"});
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
  }
});

async function broadcast(e: MouseEvent) {
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
  console.log(read_type.value)
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

</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">{{ bibleReading ? "Bible Reading" : "Broadcast" }}</h1>
        </div>
    </div>

    <div class="main-content login-container">
        <div v-if="status == UserStatus.Unauthorized" class="keypad-container ">

            <div class="pin-input-container">
              <input class="pin-input" :class="{'pin-input--error': login_error }" v-model="input" type="password" disabled="true" maxlength="4">
            </div>
            <div class="keypad">
              <div class="key" v-for="i in 12" :class="{'key-tapped': touched_pin == i}" @touchstart="touched_pin=i" @mousedown="touched_pin=i" @touchend="touched_pin=0" @touchcancel="touched_pin=0" @mouseup="touched_pin=0">
                <a v-if="i == 10" @click="backspace_pin()">
                  <img class="ionicon keyicon" src="/assets/backspace-outline.svg" />
                </a>
                <a v-else-if="i == 11" @click="enter_pin(0)">0</a>
                <a v-else-if="i == 12" @click="authorize()">
                  <img class="ionicon keyicon" src="/assets/enter-outline.svg" />
                </a>
                <a v-else @click="enter_pin(i)">{{ i }}</a>
              </div>
            </div>
        </div>
        <div v-else-if="status == UserStatus.Authorized && bibleReading">            
          <div class="biblereading">
              <h3>Reading Type</h3>
              <div class="book-selector" :class="{'hide-scrollbar': platform !== 'web'}">
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a @click="(e) => read_type_changed(e,1)" class="biblebook" :class="{'selected': read_type == 1}">Start Only</a>
                <a @click="(e) => read_type_changed(e,2)" class="biblebook" :class="{'selected': read_type == 2}">Start End</a>
                <a @click="(e) => read_type_changed(e,3)" class="biblebook" :class="{'selected': read_type == 3}">Start End Chapter</a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
              </div>
              <h3>Book</h3>
              <div class="book-selector">
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a class="biblebook" :class="{'selected': b.name == book}" @click="(e: Event) => book_changed(e)" v-for="b in old_testament" :key="b.name">{{ b.name }}</a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
              </div>
              <div class="book-selector">
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a class="biblebook" :class="{'selected': b.name == book}" @click="(e: Event) => book_changed(e)" v-for="b in new_testament" :key="b.name">{{ b.name }}</a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
              </div>
              <h3>Chapter</h3>
              <div class="number-selector">
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a class="biblebook" :class="{'selected': c.num == chapter_start}" @click="(e: Event) => chapter_start_changed(e)" v-for="c in get_chapter_start_list(book)" :key="c.num">{{ c.num }}</a>
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
                <a class="biblebook" :class="{'selected': v.num == verse_start}" @click="(e: Event) => verse_start_changed(e)" v-for="v in get_verse_start_list(book, chapter_start)" :key="v.num">{{ v.num }}</a>
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
                <a class="biblebook" :class="{'selected': c.num == chapter_end}" @click="(e: Event) => chapter_end_changed(e)" v-for="c in get_chapter_end_list(book)" :key="c.num">{{ c.num }}</a>
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
                <a class="biblebook" :class="{'selected': v.num == verse_end}" @click="(e: Event) => verse_end_changed(e)" v-for="v in get_verse_end_list(book, read_type == 3 ? chapter_end : chapter_start)" :key="v.num">{{ v.num }}</a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
                <a v-if="platform !== 'web'" class="biblebook space"></a>
              </div>
              <div>
                <button class="send-button" @click="(e) => broadcast(e)">Send</button>
              </div>
            <button class="settings-button" @click="bibleReading = false">Back</button>
              
            </div>
        </div>
        <div v-else-if="status == UserStatus.Authorized" class="login-container">
            <h1 style="margin-bottom: 0px;">Authorized</h1>
            <h3 style="margin-top: 0px;">as {{ selected_church }}</h3>
            
            <a class="settings-button" @click="bibleReading = true">Set Bible Reading</a>
            <a class="settings-button" @click="clear()">Clear Screen</a>
            <a class="settings-button" href="/broadcast">Open Output Display</a>
            <a class="settings-button" @click="signout()">Log Out</a>
            
            
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
</template>

<style>
label {
  font-size: 22px;
  color: var(--color);
}
:root {
  --key-size: 8vh;
}

.keypad-container {
  display: flex;
  flex-direction: column;
}

@keyframes loginError {
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}

@-moz-keyframes loginError {
  25% {
    transform: translateX(-3px);
  }
  75% {
    transform: translateX(3px);
  }
}
.pin-input-container {
  margin: 0 auto;
}
.pin-input--error {
  color: #901818;
  background-color: #ffb3b3;
  animation-name: loginError;
  animation-duration: 0.1s;
  animation-iteration-count: 2;
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
.key {
  background-color: var(--toolbar);
  box-shadow: 0px 0px 20px 0px rgb(0,0,0,0.2);
  padding: 2vh;
  border-radius: 100%;
  font-size: 4vh;
  text-align: center;
  line-height: 100%;
  color: var(--color);
  transition: background-color 0.2s;
}
.key-tapped {
  background-color: var(--button-tap);
}
.keyicon {
  font-size: 4vh;
  width: 4vh;
  height: 4vh;
  filter: var(--svg-color);
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
  -webkit-box-shadow:inset 0px 0px 0px 4px #2196F3;
  -moz-box-shadow:inset 0px 0px 0px 4px #2196F3;
  box-shadow:inset 0px 0px 0px 4px #2196F3;
}

.biblereading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.send-button {
  all: unset;
  height: 44px;
  background-color: #2196F3;
  color: white;
  border-radius: 15px;
  padding: 6px 20px;
  height: 30px;
  box-shadow: 0 0 8px rgb(0, 0, 0, 0.15);
  margin: 20px;
  cursor: pointer;
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
  background-color: #2196F3;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.input-container input:checked ~ .checkmark:after {
  display: block;
}

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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



</style>
