import { DynamoDBClient, ScanCommand, UpdateItemCommand, type UpdateItemCommandInput } from "@aws-sdk/client-dynamodb";
import type { BookSummary, Song } from "./types";
import { fromCognitoIdentityPool } from "@aws-sdk/credential-providers";

export type ChurchData = {
  BOOK_ID: {
    S: string;
  }, 
  CHURCH_ID: {
    S: string;
  },
  SONG_NUMBER: {
    N: number;
  },
}

export type Items = { 
    [id: number]: ChurchData
}

export function request_client() {
    const client = new DynamoDBClient({
      region: "us-east-2",
      credentials: fromCognitoIdentityPool({
        identityPoolId: "us-east-2:b4399f56-af48-4544-b368-31e6701d544c",
        clientConfig: { region: "us-east-2"},
      }),
    });
    
    return client;
  }
  
export async function scan(client: DynamoDBClient) {
    const command = new ScanCommand({
        TableName: "ACCHYMNS_DISPLAY_DATA"
    });

    const response = await client.send(command);
    return (response.Items as unknown) as Items;
}
  
export async function set(client: DynamoDBClient, church_id: string, song: string, book: string) {
    const data = {
      "TableName": "ACCHYMNS_DISPLAY_DATA",
      "Key": {
        "CHURCH_ID": {
          "S": church_id,
        }
      },
      "UpdateExpression": "SET #B = :book_id, #S = :song_number",
      "ExpressionAttributeValues": {
        ":book_id": {
          "S": book
        },
        ":song_number": {
          "S": song
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
    return response;
}