<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useNavigator } from "@/router/navigator";
import { ref } from "vue";
import axios from 'axios';
import { DynamoDBClient, ScanCommand, UpdateItemCommand, type UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import { GoogleLogin } from "vue3-google-login";
const { back } = useNavigator();

let client: DynamoDBClient;
enum UserStatus {
  Unauthorized = 'Unauthorized',
  Authorized = 'Authorized',
  FullAccess = 'FullAccess'
}

const input = ref('')
const status = ref<UserStatus>(UserStatus.Unauthorized)

async function authorize() {
  let response = await axios.post('https://iahifuumb7zasmzuv5xqpmi7fu0pwtkt.lambda-url.us-east-2.on.aws/',
    {
      code: input.value
    }
  );
  if(response.status == 200) {
    status.value = UserStatus.Authorized;
  } else {
    console.log(response.data);
  }
}

function handleCredentialResponse(response: any) {
  const expirationDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  document.cookie = "credential=" + response.credential + "; expires=" + expirationDate.toUTCString();
  client = new DynamoDBClient({
    region: "us-east-2",
    credentials: fromCognitoIdentityPool({
      identityPoolId: "us-east-2:b4399f56-af48-4544-b368-31e6701d544c",
      logins: {
        "accounts.google.com": response.credential,
      },
      clientConfig: { region: "us-east-2"},
    }),
  });
  status.value = UserStatus.FullAccess;
  const main = async () => {
    const command = new ScanCommand({
      TableName: "ACCHYMNS_DISPLAY_DATA"
    });

    const response = await client.send(command);
    return response;
  };
  main();
}

type Items = { 
  [id: number]: {
    BOOK_ID: {
      S: string;
    }, 
    CHURCH_ID: {
      S: string;
    },
    SONG_NUMBER: {
      N: number;
    },
}}

let churches = ref<Items>({});
let INPUT_CHURCH_ID = ref<string>();
let INPUT_BOOK_ID = ref<string>();
let INPUT_SONG_NUMBER = ref<string>();

async function scan() {
  const command = new ScanCommand({
    TableName: "ACCHYMNS_DISPLAY_DATA"
  });

  const response = await client.send(command);
  churches.value = (response.Items as unknown) as Items;
}

async function set() {
  let data = {
    "TableName": "ACCHYMNS_DISPLAY_DATA",
    "Key": {
      "CHURCH_ID": {
        "S": INPUT_CHURCH_ID.value || "",
      }
    },
    "UpdateExpression": "SET #B = :book_id, #S = :song_number",
    "ExpressionAttributeValues": {
      ":book_id": {
        "S": INPUT_BOOK_ID.value || ""
      },
      ":song_number": {
        "N": INPUT_SONG_NUMBER.value || ""
      },
    },
    "ExpressionAttributeNames": {
      "#B": "BOOK_ID",
      "#S": "SONG_NUMBER"
    },
    "ReturnValues": "ALL_NEW",
  }
  const command = new UpdateItemCommand(data as unknown as UpdateItemCommandInput);
  const response = await client.send(command);
  console.log(response);
  scan();
}

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
        <GoogleLogin v-else-if="status == UserStatus.Authorized" :callback="handleCredentialResponse" />
        <div v-else-if="status == UserStatus.FullAccess">
          <div>
            <input class="pin-input" type="text" v-model="INPUT_CHURCH_ID" placeholder="CHURCH_ID"/>
            <input class="pin-input" type="text" v-model="INPUT_BOOK_ID" placeholder="BOOK_ID"/>
            <input class="pin-input" type="text" v-model="INPUT_SONG_NUMBER" placeholder="SONG_NUMBER"/>
            <button class="settings-button" @click="set()">Update</button>
          </div>
          <br>
          <button class="settings-button" @click="scan()">Scan</button>
          <table>
            <tr>
              <th>Church ID</th>
              <th>Book ID</th>
              <th>Song Number</th>
            </tr>
            <tr v-for="church in churches" :key="church.CHURCH_ID.S">
              <td>{{ church.CHURCH_ID.S }}</td>
              <td>{{ church.BOOK_ID.S }}</td>
              <td>{{ church.SONG_NUMBER.N }}</td>
            </tr>
          </table>
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

.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.settings-button {
  background-color: var(--search-color);
  border-radius: 10px;
  padding: 0 10px;
  margin: 0 10px;
}

.pin-input {
  background-color: var(--search-color);
  border-radius: 10px;
  width: 50%;
  margin: 5px 10px;
}

</style>
