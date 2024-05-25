<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
import { onMounted, ref } from "vue";
import axios from 'axios';
import { UserStatus, request_client, scan, set, validate_token, type AuthResponse, type ChurchData } from "@/scripts/broadcast";
import { Preferences } from "@capacitor/preferences";
import { type Bible, type BibleBook, type BibleChapter, type BibleVerse } from "@/scripts/types";
import { fetchCachedJSON } from "@/composables/cached_fetch";
const { back } = useNavigator();

const input = ref('')
const status = ref<UserStatus>(UserStatus.Unauthorized)
let selected_church = ref('');
let churches = ref<ChurchData[]>([]);
let bible = ref<Bible>();

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
    let cached_selected_church = (await Preferences.get({ key: "broadcasting_church"})).value;
    if(cached_selected_church == "" || cached_selected_church == undefined) {
      selected_church.value = churches.value[0].CHURCH_ID.S;
    } else {
      selected_church.value = cached_selected_church;
    }

    update_selected_church()
  } else {
    console.log(response.data);
  }
}

async function clear() {
  await set(request_client(), selected_church.value, "", "", [-1], "");
}

async function update_selected_church() {
  await Preferences.set({ key: "broadcasting_church", value: selected_church.value});
}

async function signout() {
  await Preferences.set({ key: "broadcasting_auth_token", value: ""});
  status.value = UserStatus.Unauthorized;
  input.value = "";
}

onMounted(async () => {
  bible.value = await fetchCachedJSON<Bible>("/NKJV.bible.json", {}) || { version: "", books: []};
  console.log(bible.value);

  let broadcasting_auth_token = await Preferences.get({ key: "broadcasting_auth_token"});
  if (broadcasting_auth_token.value != "" && broadcasting_auth_token.value != undefined) {
    if(!(await validate_token(broadcasting_auth_token.value)))
      return signout();

    status.value = UserStatus.Authorized;
    let data = await scan(request_client());
    churches.value = [];
    for (const [key, value] of Object.entries(data)) {
      churches.value.push(value);
    }
    let cached_selected_church = (await Preferences.get({ key: "broadcasting_church"})).value;
    if(cached_selected_church == "" || cached_selected_church == undefined) {
      selected_church.value = churches.value[0].CHURCH_ID.S;
    } else {
      selected_church.value = cached_selected_church;
    }

    update_selected_church()
  }
});

async function broadcast(e: MouseEvent) {
    let church_id = await Preferences.get({ key: "broadcasting_church"});
    if(church_id.value == null)
        return;

    let top_text = "";
    let bottom_text = "";
    if(read_type.value == 0) {
      top_text = `${book.value}`;
      bottom_text = `${chapter_start.value}:${verse_start.value}-${bible.value?.books.find(b => b.name == book.value)?.chapters.find(c => c.num == chapter_start.value)?.verses.length}`;
    } else if(read_type.value == 1) {
      top_text = `${book.value}`;
      bottom_text = `${chapter_start.value}:${verse_start.value}-${verse_end.value}`;
    } else {
      top_text = `${book.value} `;
      bottom_text = `${chapter_start.value}:${verse_start.value}-${bible.value?.books.find(b => b.name == book.value)?.chapters.find(c => c.num == chapter_start.value)?.verses.length}, ${chapter_end.value}:1-${verse_end.value}`;
    }

    await set(request_client(), church_id.value, top_text, "BIBLE", [], bottom_text);
}

let bibleReading = ref<boolean>(false);

let book = ref("Genesis");
let chapter_start = ref(1);
let chapter_end = ref(1);
let verse_start = ref(1);
let verse_end = ref(1);
let read_type = ref(0);
function book_changed(e: Event) {
  book.value = (e.target as HTMLSelectElement).value;
}
function chapter_start_changed(e: Event) {
  chapter_start.value = Number.parseInt((e.target as HTMLSelectElement).value);
}
function chapter_end_changed(e: Event) {
  chapter_end.value = Number.parseInt((e.target as HTMLSelectElement).value);
}
function verse_start_changed(e: Event) {
  verse_start.value = Number.parseInt((e.target as HTMLSelectElement).value);
}
function verse_end_changed(e: Event) {
  verse_end.value = Number.parseInt((e.target as HTMLSelectElement).value);
}
function read_type_changed(e: Event) {
  read_type.value = (e.target as HTMLSelectElement).selectedIndex;
}

function get_chapter_start_list(book: string) {
  let b: BibleBook = bible.value?.books.find(b => b.name == book) || { name: "", chapters: []};
  return b.chapters;
}

function get_chapter_end_list(book: string) {
  let b: BibleBook = bible.value?.books.find(b => b.name == book) || { name: "", chapters: []};
  let chapter_end_list: BibleChapter[] = [];
  if(chapter_start.value > 0) {
    for (let i = chapter_start.value; i <= b?.chapters.length; i++) {
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
    for (let i = verse_start.value; i <= c?.verses.length; i++) {
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
        <div v-if="status == UserStatus.Unauthorized">
            <input class="pin-input" v-model="input" type="password">
            <button class="settings-button" @click="authorize()">Authorize</button>
        </div>
        <div v-else-if="status == UserStatus.Authorized && bibleReading">            
          <div class="biblereading">
              <label>Book
                <select id="booklist" @change="(e: Event) => book_changed(e)">
                  <option v-for="book in bible?.books" :value="book.name" :key="book.name">{{ book.name }}</option>
                </select>
              </label>
              <div>
                <label>Chapter
                  <select id="chapterlist" @change="(e: Event) => chapter_start_changed(e)">
                    <option v-for="c in get_chapter_start_list(book)" :value="c.num" :key="c.num">{{ c.num }}</option>
                  </select>
                </label>
                <label> :
                  <select id="verselist" @change="(e: Event) => verse_start_changed(e)">
                    <option v-for="v in get_verse_start_list(book, chapter_start)" :value="v.num" :key="v.num">{{ v.num }}</option>
                  </select>
                </label>
                <label> to
                  <select id="verselist2" @change="(e: Event) => verse_end_changed(e)">
                    <option v-for="v in get_verse_end_list(book, read_type == 2 ? chapter_end : chapter_start)" :value="v.num" :key="v.num">{{ v.num }}</option>
                  </select>
                </label>
              </div>

              <label>Type
                <select id="readtype" @change="(e: Event) => read_type_changed(e)">
                  <option value="1">Start Only</option>
                  <option value="2">Start End</option>
                  <option value="3">Start End Chapter</option>
                </select>
              </label>
              <label>End Chapter
                <select id="chapterlist2" @change="(e: Event) => chapter_end_changed(e)">
                  <option v-for="c in get_chapter_end_list(book)" :value="c.num" :key="c.num">{{ c.num }}</option>
                </select>
              </label>
              <div>
                <button class="send-button" @click="(e) => broadcast(e)">Send</button>
              </div>
            <button class="settings-button" @click="bibleReading = false">Back</button>
              
            </div>
        </div>
        <div v-else-if="status == UserStatus.Authorized" class="login-container">
            <h1>Authorized</h1>

            <div class="settings-radio">
              <div v-for="church in churches" :key="church.CHURCH_ID.S">
                <label class="input-container" >{{ church.CHURCH_ID.S }}
                  <input v-model="selected_church" type="radio" :value="church.CHURCH_ID.S" :checked="church.CHURCH_ID.S == selected_church" @change="update_selected_church()" name="churches" style="width: 0"/>
                  <span class="checkmark"></span>
                </label>
              </div>
            </div>
            
            <button class="settings-button" @click="bibleReading = true">Set Bible Reading</button>
            <button class="settings-button" @click="clear()">Clear Screen</button>
            <button class="settings-button" @click="signout()">Log Out</button>
            
            
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
  background-color: var(--search-color);
  color: var(--color);
  border-radius: 10px;
  padding: 0 10px;
  margin: 10px;
}

.settings-radio {
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: left;
}

.pin-input {
  all: unset;
  background-color: var(--search-color);
  border-radius: 10px;
  width: 50%;
  height: 100%;
  margin: 5px 10px;
  padding: 6px 15px;
}

</style>
