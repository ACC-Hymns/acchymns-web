import { DynamoDBClient, GetItemCommand, ScanCommand, UpdateItemCommand, type UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";
import axios from "axios";

export type ChurchData = {
    BOOK_ID: {
        S: string;
    };
    CHURCH_ID: {
        S: string;
    };
    SONG_NUMBER: {
        S: string;
    };
    VERSES: {
        NS: number[];
    };
    BOOK_COLOR: {
        S: string;
    };
    BG_COLOR: {
        S: string;
    };
};

export enum UserStatus {
    Unauthorized = "Unauthorized",
    Authorized = "Authorized",
    None = "None",
}

export type TokenAuthResponse = {
    text: string;
    church_id: string;
};

export type AuthResponse = {
    text: string;
    token: string;
    church_id: string;
};

export type Items = {
    [id: number]: ChurchData;
};

export async function validate_token(auth_token: string) {
    const response = await axios.post("https://iahifuumb7zasmzuv5xqpmi7fu0pwtkt.lambda-url.us-east-2.on.aws/", {
        code: auth_token,
    });
    return response;
}

export function request_client() {
    const client = new DynamoDBClient({
        region: "us-east-2",
        credentials: fromCognitoIdentityPool({
            identityPoolId: "us-east-2:b4399f56-af48-4544-b368-31e6701d544c",
            clientConfig: { region: "us-east-2" },
        }),
    });

    return client;
}

export async function scan(client: DynamoDBClient) {
    const command = new ScanCommand({
        TableName: "ACCHYMNS_DISPLAY_DATA",
    });

    const response = await client.send(command);
    return response.Items as unknown as Items;
}

export async function set(client: DynamoDBClient, church_id: string, song: string, book: string, verses: number[], color: string) {
    if (verses.length == 0) {
        verses = [-1];
    }
    const data = {
        TableName: "ACCHYMNS_DISPLAY_DATA",
        Key: {
            CHURCH_ID: {
                S: church_id,
            },
        },
        UpdateExpression: "SET #B = :book_id, #S = :song_number, #V = :verses, #C = :book_color",
        ExpressionAttributeValues: {
            ":book_id": {
                S: book,
            },
            ":song_number": {
                S: song,
            },
            ":verses": {
                NS: verses.map(String),
            },
            ":book_color": {
                S: color,
            },
        },
        ExpressionAttributeNames: {
            "#B": "BOOK_ID",
            "#S": "SONG_NUMBER",
            "#V": "VERSES",
            "#C": "BOOK_COLOR",
        },
        ReturnValues: "ALL_NEW",
    };
    const command = new UpdateItemCommand(data as unknown as UpdateItemCommandInput);
    const response = await client.send(command);
    return response;
}

export async function set_bg_color(client: DynamoDBClient, church_id: string, bg_color: string) {
    const data = {
        TableName: "ACCHYMNS_DISPLAY_DATA",
        Key: {
            CHURCH_ID: {
                S: church_id,
            },
        },
        UpdateExpression: "SET #BG = :bg_color",
        ExpressionAttributeValues: {
            ":bg_color": {
                S: bg_color,
            },
        },
        ExpressionAttributeNames: {
            "#BG": "BG_COLOR",
        },
        ReturnValues: "ALL_NEW",
    };
    const command = new UpdateItemCommand(data as unknown as UpdateItemCommandInput);
    const response = await client.send(command);
    return response;
}

export async function get(client: DynamoDBClient, church_id: string) {
    const command = new GetItemCommand({
        TableName: "ACCHYMNS_DISPLAY_DATA",
        Key: {
            CHURCH_ID: {
                S: church_id,
            },
        },
    });
    const response = await client.send(command);
    return response;
}
