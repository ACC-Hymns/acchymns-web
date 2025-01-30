<script setup lang="ts">
import { ref } from "vue";
import { useBroadcastAPI } from "@/composables/broadcast";
import type { ChurchData } from "@/scripts/broadcast";

let song_number = ref<string>("");
let verses = ref<string>("");
let color = ref<string>("");
let book_name = ref<string>("Unauthorized");
let verses_visible = ref<boolean>(false);
let is_bible_reading = ref<boolean>(false);
let top_text = ref<string>("");
let bottom_text = ref<string>("");

// Thanks to Vasko Petrov for supplying the clock
// https://codepen.io/vaskopetrov/pen/yVEXjz
const hours = ref<string>('');
const minutes = ref<string>('');
const seconds = ref<string>('');
const digital_time = ref<string>('');
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
    
    // 12 hour format
    let am_pm = h >= 12 ? 'PM' : 'AM';
    let hrs = h % 12;
    hrs = h ? h : 12; // the hour '0' should be '12'
    digital_time.value = `${hrs}:${m < 10 ? '0' + m : m} ${am_pm}`;
}

setInterval(clock, 100);

const broadcast_api = useBroadcastAPI();

async function set_data() {
    if (!broadcast_api.is_ready) {
        return;
    }
    let data: ChurchData = await broadcast_api.getCurrentBroadcast() as ChurchData;
    is_bible_reading.value = data.BOOK_ID.S == "BIBLE";

    if(is_bible_reading.value) {
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
setInterval(set_data, 2000);
</script>

<template>
    <div class="info-seperator">
        <div v-if="is_bible_reading" class="song-info">
          <h2 ref="top_text_element" class="top-text">{{ top_text }}</h2>
          <h2 class="bottom-text">{{ bottom_text }}</h2>
          <h2 class="digital-clock">{{ digital_time }}</h2>
        </div>
        <div v-else class="song-info">
          <h1 class="song-number">{{ song_number}}</h1>
          <h3 class="verses-label" v-if="verses_visible">Verses:</h3>
          <h2 class="verses" ref="verses_text">{{ verses }}</h2>
          <h2 class="book-name" :style="{color: color}">{{ book_name }}</h2>
          <h2 v-if="song_number.length > 0" class="digital-clock">{{ digital_time }}</h2>
        </div>

        <div v-if="song_number.length == 0 && !is_bible_reading" class="clock">
            <div class="dot"></div>
            <div>
                <div class="hour-hand" :style="{transform: hours}"></div>
                <div class="minute-hand" :style="{transform: minutes}"></div>
                <div class="second-hand" :style="{transform: seconds}"></div>
            </div>
            <div>
              <span v-for="i in 12" :class="('h' + i)">{{ i }}</span>
            </div>
            <div class="diallines" v-for="i in 60" :key="i" :style="{transform: 'rotate(' + 6 * i + 'deg)'}"></div>
        </div>
    </div>

</template>

<style>
body {
    background-color: white;
}
</style>

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
.diallines:nth-of-type(5n + 3) {
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
