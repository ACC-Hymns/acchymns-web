<script setup lang="ts">
import { useCapacitorPreferences } from "@/composables/preferences";
import { onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { validate_token, request_client, get } from "@/scripts/broadcast";
import type {ChurchData, TokenAuthResponse} from "@/scripts/broadcast";
import { Preferences } from "@capacitor/preferences";
import type { DynamoDBClient } from "@aws-sdk/client-dynamodb";

let authorized = ref<boolean>(false);
let church_id = ref<string>('');

let song_number = ref<string>("");
let verses = ref<string>("");
let color = ref<string>("");
let book_name = ref<string>("");
let verses_visible = ref<boolean>(false);
let bible_reading = ref<boolean>(false);
let top_text = ref<string>("");
let bottom_text = ref<string>("");
let verse_numbers = ref<number[]>([]);

// Thanks to Vasko Petrov for supplying the clock
// https://codepen.io/vaskopetrov/pen/yVEXjz


let digital_time = ref<string>("");
function getClockTime() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
}

function clock() {
    let t = getClockTime();
    
    let hDeg = t.hours * 30 + t.minutes * (360/720);
    let mDeg = t.minutes * 6 + t.seconds * (360/3600);
    let sDeg = t.seconds * 6;


    hours.value = "rotate("+hDeg+"deg)";
    minutes.value = "rotate("+mDeg+"deg)";
    seconds.value = "rotate("+sDeg+"deg)";

    digital_time.value = getDigitalTime();
}

function getDigitalTime() {
    let t = getClockTime();
    // 12 hour format
    let hours = t.hours;
    let minutes = t.minutes;
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    let strTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ' ' + ampm;
    return strTime;
}

let client: DynamoDBClient;

function getFontSize(textLength: number) {
  var baseSize = 35;
  if( textLength >= baseSize) {
    const fontSize = 8;
    return `${fontSize}em`;
  }
}

async function set_data() {
    let data: ChurchData = (await get(client, church_id.value)).Item as unknown as ChurchData;
    bible_reading.value = data.BOOK_ID.S == "BIBLE";

    if(bible_reading.value) {
      top_text.value = data.SONG_NUMBER.S;
      bottom_text.value = data.BOOK_COLOR.S;
    } else {
      song_number.value = data.SONG_NUMBER.S;

      verses_visible.value = false;
      if(data.VERSES.NS[0] == -1) {
          verses.value = "";
      } else if (data.VERSES.NS[0] == -2) {
          verses.value = "All Verses";
      } else {
          data.VERSES.NS.sort((a, b) => a - b);
          verse_numbers.value = data.VERSES.NS;
          verses.value = data.VERSES.NS.join(", ");
          verses_visible.value = true;
          let element = (verses_text.value as HTMLElement);
          if(element)
            element.style.fontSize = getFontSize(verses.value.length) || "10em";
      }

      color.value = data.BOOK_COLOR.S;
      book_name.value = data.BOOK_ID.S;
    }

    if(song_number.value.length > 0 || bible_reading.value) {
      document.body.style.backgroundColor = "#b49264";
    } else {
      document.body.style.backgroundColor = data.BG_COLOR.S;
    }
}
let old_bg_color = '';
const verses_text = ref<Element>();
onMounted(async () => {
    old_bg_color = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "#b49264";
    document.body.style.transition = "background-color 1s";

    clock();

    setInterval(clock, 100);
    setInterval(set_data, 2000);

    let token = await Preferences.get({ key: "broadcasting_auth_token"});
    let response = await validate_token(token.value || "");
    authorized.value = response.status == 200;
    church_id.value = (response.data as TokenAuthResponse).church_id;
    console.log("Authorized: " + authorized.value)
    if (!authorized.value) {
        book_name.value = "Unauthorized";
        return;
    }
    client = request_client();

    set_data();
});

onUnmounted(() => {
    document.body.style.backgroundColor = old_bg_color;
});

let hours = ref<string>('');
let minutes = ref<string>('');
let seconds = ref<string>('');


</script>

<template>
    <div class="info-seperator">
        <div v-if="bible_reading" class="song-info">
          <h2 ref="top_text_element" class="top-text">{{ top_text }}</h2>
          <h2 class="bottom-text">{{ bottom_text }}</h2>
          <h2 class="digital-clock">{{digital_time}}</h2>
        </div>
        <div v-else class="song-info">
          <h1 class="song-number">{{ song_number}}</h1>
          <h3 class="verses-label" v-if="verses_visible">Verses:</h3>
          <h2 class="verses" ref="verses_text">{{ verses }}</h2>
          <h2 class="book-name" :style="{color: color}">{{ book_name }}</h2>
          <h2 v-if="song_number.length > 0" class="digital-clock">{{digital_time}}</h2>
        </div>

        <div v-if="song_number.length == 0 && !bible_reading" class="clock">
            <div class="dot"></div>
            <div>
                <div class="hour-hand" :style="{transform: hours}"></div>
                <div class="minute-hand" :style="{transform: minutes}"></div>
                <div class="second-hand" :style="{transform: seconds}"></div>
            </div>
            <div>
              <span v-for="i in 12" :class="('h' + i)">{{ i }}</span>
            </div>
            <div class="diallines" v-for="i in 61" :key="i" :style="{transform: 'rotate(' + 6 * (i - 2) + 'deg)'}"></div>
        </div>
    </div>

</template>

<style scoped>
.wall-color {
  background-color: #EACFA3;
}

.top-text {
    font-size: 15em;
    color: #000000;
    margin: 0 5%;
    top: 10%;
    position: fixed;
    margin: 0 5%;
    line-height: 1;
}
.bottom-text {
    font-size: 10em;
    color: #000000;
    margin: 0 5%;
    bottom: 50%;
    position: fixed;
    margin: 0 5%;
    line-height: 1;
}
.song-info {
    width: 50%;
    height: 100%;
}

.digital-clock {
    font-size: 10em;
    color: #000000;
    bottom: 5%;
    position: fixed;
    margin: 0px 5%;
    width: 50%;
    right: 0;
    text-align: right;
    line-height: 1;
}

.info-seperator {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 100%;
}

.book-name {
    font-size: 6em;
    color: #000000;
    bottom: 5%;
    position: fixed;
    margin: 0 5%;
    text-shadow: 2px 2px #FF0000;
}

.song-number {
    font-size: 38em;
    color: #000000;
    margin: 0 5%;
    top: 0;
    position: fixed;
    margin: 0 5%;
    line-height: 1;
}

.verses-container {
  position: fixed;
  right: 0;
}

.verses-grid {
  display: grid;
  gap: 10px;
  width: 5vw;
  height: 5vw;
}

.verse {
    font-size: 6em;
    color: #333;
    border-radius: 50%;
    text-align: center;
    background-color: #e0e0e0;
    width: 100%;
    padding: 0 0%;
    
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.308);
}

.verses {
    font-size: 10em;
    color: #000000;
    margin: 0 5%;
    top: 60%;
    position: fixed;
    margin: 0 5%;
    max-width: 60%;
}
.verses-label {
    font-size: 5em;
    color: #000000;
    margin: 0 5%;
    top: 55%;
    position: fixed;
    margin: 0 5%;
}

.clock-bible-long {
  transform: translate(25vw, 12vh);
}
.clock-bible {
  transform: translateX(25vw);
}
.clock-song {
  transform: translateX(25vw);
}

.clock {
  background: rgb(20, 20, 20);
  width: 600px;
  height: 600px;
  border-radius: 50%;
  border: 14px solid #333;
  position: fixed;
  box-shadow: 0 2vw 4vw -1vw rgba(0,0,0,0.8);
  transition: transform 0.3s;
  translate: calc(50vw - 300px) 50vh;
}

.dot {
  width: 28px;
  height: 28px;
  border-radius: 100%;
  background: #ccc;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin: auto;
  position: absolute;
  z-index: 10;
  box-shadow: 0 2px 4px -1px black;
}

.hour-hand {
  position: absolute;
  z-index: 5;
  width: 12px;
  height: 132px;
  background: white;
  box-shadow: 0 2px 4px -1px black;
  top: 158px;
  transform-origin: 50% 144px;
  left: 50%;
  margin-left: -6px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
}

.minute-hand {
  position: absolute;
  z-index: 6;
  width: 12px;
  height: 200px;
  background: white;
  box-shadow: 0 2px 4px -1px black;
  top: 92px;
  left: 50%;
  margin-left: -6px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  transform-origin: 50% 210px;
}

.second-hand {
  position: absolute;
  z-index: 7;
  width: 6px;
  height: 240px;
  background: red;
  box-shadow: 0 2px 4px -1px black;
  top: 52px;
  left: 50%;
  margin-left: -3px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  transform-origin: 50% 250px;
}

span {
  display: inline-block;
  position: absolute;
  color: white;
  font-size: 72px;
  font-family: sans-serif;
  font-weight: 700;
  z-index: 4;
}

.h12 {
  top: 5%;
  left: 50%;
  margin-left: -40px;
}
.h1 {
  top: 10%;
  left: 66%;
}
.h2 {
  top: 25%;
  left: 80%;
}
.h3 {
  top: 50%;
  right: 8%;  
  margin-top: -41px;
}
.h4 {
  bottom: 24%;
  left: 80%;
}
.h5 {
  bottom: 10%;
  left: 66%;
}
.h6 {
  bottom: 5%;
  left: 50%;
  margin-left: -22px;
}
.h7 {
  bottom: 10%;
  left: 28%;
}
.h8 {
  bottom: 25%;
  left: 14%;
}
.h9 {
  left: 8%;
  top: 50%;
  margin-top: -41px;
}
.h10 {
  top: 25%;
  left: 12%;
}
.h11 {
  top: 10%;
  left: 26%;
}

.diallines {
  position: absolute;
  z-index: 2;
  width: 4px;
  height: 10px;
  background: white;
  left: 50%;
  margin-left: -2px;
  transform-origin: 50% 300px;
  border-radius: 5px;
}
.diallines:nth-of-type(5n) {
  position: absolute;
  z-index: 2;
  width: 8px;
  height: 30px;
  background: white;
  left: 50%;
  margin-left: -4px;
  transform-origin: 50% 300px;
}

</style>
