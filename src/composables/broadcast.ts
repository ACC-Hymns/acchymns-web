import { ref, computed } from "vue";
import { Preferences } from "@capacitor/preferences";
import { validate_token, type TokenAuthResponse, request_client, get} from "@/scripts/broadcast";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import type { ChurchData } from "@/scripts/broadcast";

export function useBroadcastAPI() {
    const is_authorized = ref<boolean>(false);
    const church_id = ref<string>("");
    const client = ref<DynamoDBClient | null>(null);
    const is_ready = computed(() => is_authorized.value && church_id.value != "" && client.value != null);

    async function execute() {
        let token = await Preferences.get({ key: "broadcasting_auth_token"});
        let response = await validate_token(token.value || "");
        is_authorized.value = response.status == 200;
        church_id.value = (response.data as TokenAuthResponse).church_id;
        client.value = request_client();
    }

    execute();

    async function getCurrentBroadcast() {
        if (client.value != null) {
            return (await get(client.value as DynamoDBClient, church_id.value)).Item as unknown as ChurchData;
        }
        return null;
    }

    return { is_authorized, church_id, client, is_ready, getCurrentBroadcast };
}