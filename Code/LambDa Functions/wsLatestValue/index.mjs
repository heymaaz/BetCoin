// Import libraries
import { getSendMessagePromises } from './websocket.mjs';

//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {

        // Extract domain and stage from event for callback URL
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        
        // Get rates from DynamoDB
        const ratesData = await getLatestCryptoRates();

        // Format data to send back
        const formattedData = JSON.stringify(ratesData);

        // Get promises to send messages to connected clients
        let sendMsgPromises = await getSendMessagePromises(formattedData, domain, stage);

        // Execute promises
        await Promise.all(sendMsgPromises);
    } catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    return { statusCode: 200, body: "Data sent successfully." };
};

async function getLatestCryptoRates() {
    const symbols = ["BTC", "ETH", "SOL", "LTC", "XRP"];
    const latestRates = {};

    // Create a promise for each symbol to query its latest rate
    const promises = symbols.map(symbol => {
        const queryCommand = new QueryCommand({
            TableName: "CryptoRates",
            KeyConditionExpression: "CryptoSymbol = :symbol",
            ExpressionAttributeValues: {
                ":symbol": symbol,
            },
            ScanIndexForward: false, // Ensure descending order by timestamp to get the latest
            Limit: 1 // Retrieve only the latest item
        });

        return docClient.send(queryCommand).then(response => {
            const items = response.Items;
            if (items.length > 0) {
                latestRates[symbol] = items[0].Rate; // Assume Rate is the attribute with the rate
            }
        });
    });

    // Wait for all promises to resolve
    await Promise.all(promises);

    
    let type = "LatestCryptoRates";

    return {
        type,
        latestRates
    };
        
}
