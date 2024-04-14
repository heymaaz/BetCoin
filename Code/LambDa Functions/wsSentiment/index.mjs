// Import libraries
import { getSendMessageToSpecificClientPromises } from './websocket.mjs';

//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";


// Create DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        
        // Extract domain and stage from event for callback URL
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        
        //Extract the connection ID from the event object to only send to that connection
        const connectionId = event.requestContext.connectionId;
        
        // Get sentiment from DynamoDB
        const sentiment = await getSentiment();

        // Format data to send back
        const formattedData = JSON.stringify(sentiment);

        // Get promises to send messages to Specific Client
        let sendMsgPromises = await getSendMessageToSpecificClientPromises(formattedData, domain, stage, connectionId);

        // Execute promises
        await Promise.all(sendMsgPromises);
    } catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    return { statusCode: 200, body: "Data sent successfully." };
};

// Function to query DynamoDB for sentiment by crypto symbol
async function getSentiment() {
    let cryptoSymbols = ["BTC", "ETH", "LTC", "SOL", "XRP"];
    let sentimentData = {};

    for (let symbol of cryptoSymbols) {
        const queryCommand = new QueryCommand({
            TableName: "CryptoSentiment",
            KeyConditionExpression: "CryptoSymbol = :symbol",
            ExpressionAttributeValues: {
                ":symbol": symbol,
            },
            ScanIndexForward: true // Ensure ascending order by timestamp
        });

        const response = await docClient.send(queryCommand);
        const items = response.Items;

        // Transform the items to a suitable format for the frontend
        sentimentData[symbol] = items.map(item => ({
            timestamp: item.CryptoTS,
            sentiment: item.Sentiment
        }));
    }

    return {
        type: "SentimentData",
        data: sentimentData
    };
}
