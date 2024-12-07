<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
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

// Thanks to Vasko Petrov for supplying the clock
// https://codepen.io/vaskopetrov/pen/yVEXjz
function clock() {
    let d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    let s = d.getSeconds();
    
    let hDeg = h * 30 + m * (360/720);
    let mDeg = m * 6 + s * (360/3600);
    let sDeg = s * 6;


    hours.value = "rotate("+hDeg+"deg)";
    minutes.value = "rotate("+mDeg+"deg)";
    seconds.value = "rotate("+sDeg+"deg)";
}

let client: DynamoDBClient;

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
          verses.value = data.VERSES.NS.join(", ");
          verses_visible.value = true;
      }
      color.value = data.BOOK_COLOR.S;
      book_name.value = data.BOOK_ID.S;
    }
}
let old_bg_color = '';
onMounted(async () => {
    old_bg_color = document.body.style.backgroundColor;
    document.body.style.backgroundColor = "white";

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
})

let hours = ref<string>('');
let minutes = ref<string>('');
let seconds = ref<string>('');

function calculate_text_width(text: string, font: string) {
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    if (context == null) {
        return 0;
    }
    context.font = font;
    let metrics = context.measureText(text);
    return metrics.width;
}

</script>

<template>
    <div class="info-seperator">
        <div v-if="bible_reading" class="song-info">
          <h2 ref="top_text_element" class="top-text">{{ top_text }}</h2>
          <h2 class="bottom-text">{{ bottom_text }}</h2>
          
        </div>
        <div v-else class="song-info">
            <h1 class="song-number">{{ song_number}}</h1>
            <h3 class="verses-label" v-if="verses_visible">Verses:</h3>
            <h2 class="verses">{{ verses }}</h2>
            <h2 class="book-name" :style="{color: color}">{{ book_name }}</h2>
        </div>
        <div class="clock" :class="{'clock-bible-long': top_text.length > 8 && bible_reading, 'clock-song': song_number.length > 0, 'clock-bible': top_text.length <= 8 && bible_reading}">
            <div class="dot"></div>
            <div>
                <div class="hour-hand" :style="{transform: hours}"></div>
                <div class="minute-hand" :style="{transform: minutes}"></div>
            </div>
            <div>
            </div>
            <div class="diallines" v-for="i in 61" :key="i" :style="{transform: 'rotate(' + 6 * (i - 2) + 'deg)'}"></div>
        </div>
    </div>

</template>

<style scoped>
.top-text {
    font-size: 16em;
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
}

.song-number {
    font-size: 30em;
    color: #000000;
    margin: 0 5%;
    top: 0;
    position: fixed;
    margin: 0 5%;
    line-height: 1;
}
.verses {
    font-size: 10em;
    color: #000000;
    margin: 0 5%;
    top: 50%;
    position: fixed;
    margin: 0 5%;
    max-width: 60%;
    word-wrap: break-word;
    white-space: pre-wrap;
}
.verses-label {
    font-size: 5em;
    color: #000000;
    margin: 0 5%;
    top: 43%;
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
  background: #ececec;
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
  width: 8px;
  height: 130px;
  background: #333;
  top: 158px;
  transform-origin: 50% 144px;
  left: 50%;
  margin-left: -4px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
}

.minute-hand {
  position: absolute;
  z-index: 6;
  width: 8px;
  height: 200px;
  background: #666;
  top: 92px;
  left: 50%;
  margin-left: -4px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  transform-origin: 50% 210px;
}

.second-hand {
  position: absolute;
  z-index: 7;
  width: 4px;
  height: 240px;
  background: red;
  top: 52px;
  left: 50%;
  margin-left: -2px;
  border-top-left-radius: 50%;
  border-top-right-radius: 50%;
  transform-origin: 50% 250px;
}

span {
  display: inline-block;
  position: absolute;
  color: #333;
  font-size: 72px;
  font-family: 'Poiret One';
  font-weight: 700;
  z-index: 4;
}

.h12 {
  top: 60px;
  left: 50%;
  margin-left: -36px;
}
.h3 {
  top: 260px;
  right: 66px;
}
.h6 {
  bottom: 60px;
  left: 50%;
  margin-left: -18px;
}
.h9 {
  left: 66px;
  top: 260px;
}

.diallines {
  position: absolute;
  z-index: 2;
  width: 4px;
  height: 30px;
  background: #666;
  left: 50%;
  margin-left: -2px;
  transform-origin: 50% 300px;
}
.diallines:nth-of-type(5n) {
  position: absolute;
  z-index: 2;
  width: 8px;
  height: 50px;
  background: #666;
  left: 50%;
  margin-left: -4px;
  transform-origin: 50% 300px;
}

</style>
