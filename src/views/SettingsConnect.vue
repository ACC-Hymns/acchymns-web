<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
import { onMounted, ref } from "vue";
import axios from 'axios';
import { request_client, scan, type ChurchData } from "@/scripts/broadcast";
import { Preferences } from "@capacitor/preferences";
const { back } = useNavigator();


enum UserStatus {
  Unauthorized = 'Unauthorized',
  Authorized = 'Authorized',
}

const input = ref('')
const status = ref<UserStatus>(UserStatus.Unauthorized)
let selected_church = ref('');
let churches = ref<ChurchData[]>([]);

async function authorize() {
  let response = await axios.post('https://iahifuumb7zasmzuv5xqpmi7fu0pwtkt.lambda-url.us-east-2.on.aws/',
    {
      code: input.value
    }
  );
  if(response.status == 200) {
    await Preferences.set({ key: "authorized", value: "true"});
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
      console.log("bingo")
      selected_church.value = cached_selected_church;
    }

    update_selected_church()
  } else {
    console.log(response.data);
  }
}

async function update_selected_church() {
  await Preferences.set({ key: "broadcasting_church", value: selected_church.value});
}

async function signout() {
  await Preferences.set({ key: "authorized", value: "false"});
  status.value = UserStatus.Unauthorized;
  input.value = "";
}

onMounted(async () => {
  let authorized = await Preferences.get({ key: "authorized"});
  if (authorized.value == "true") {
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

</script>

<template>
    <div class="menu">
        <div class="title">
            <img @click="back()" class="ionicon title--left" src="/assets/chevron-back-outline.svg" />
            <h1 class="title--center">Broadcast</h1>
        </div>
    </div>

    <div class="main-content login-container">
        <div v-if="status == UserStatus.Unauthorized">
            <input class="pin-input" v-model="input" type="password">
            <button class="settings-button" @click="authorize()">Authorize</button>
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
@import "@/assets/css/settings.css";

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
  background-color: var(--search-color);
  color: var(--color);
  border-radius: 10px;
  padding: 0 10px;
  margin: 0 10px;
}

.settings-radio {
  display: flex;
  flex-direction: column;
  align-items: left;
  justify-content: left;
}

.pin-input {
  background-color: var(--search-color);
  border-radius: 10px;
  width: 50%;
  margin: 5px 10px;
}

</style>
