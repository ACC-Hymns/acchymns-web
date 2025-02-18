import { ref, computed } from "vue";
import { request_client } from "@/scripts/broadcast";
import { DynamoDBClient, PutItemCommand, type PutItemCommandInput } from "@aws-sdk/client-dynamodb";
import type { SongReference } from "@/scripts/types";

export function useReportAPI() {
    const client = ref<DynamoDBClient | null>(null);
    const is_ready = computed(() => client.value != null);

    async function execute() {
        client.value = request_client();
    }

    execute();

    async function report(song: SongReference) {
        if (client.value != null) {
            const data: PutItemCommandInput = {
                TableName: "ACC_HYMNS_SONG_ISSUES",
                Item: {
                    SONG_BOOK: {
                        S: song.book,
                    },
                    SONG_NUMBER: {
                        S: song.number,
                    },
                },
            };
            const command = new PutItemCommand(data);
            const response = await client.value.send(command);
            return response;
        }
        return null;
    }

    return { client, is_ready, report };
}
