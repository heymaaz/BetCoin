// Import libraries
import { getSendMessageToSpecificClientPromises } from './websocket.mjs';

//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // Get Crypto Symbol from event
        const cryptoSymbol = JSON.parse(event.body).data;
        console.log("Crypto Symbol: " + cryptoSymbol);

        // Extract domain and stage from event for callback URL
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        
        //Extract the connection ID from the event object to only send to that connection
        const connectionId = event.requestContext.connectionId;

        // Get rates from DynamoDB
        const ratesData = await getCryptoRates(cryptoSymbol);

        // Format data to send back
        const formattedData = JSON.stringify(ratesData);

        // Get promises to send messages to connected clients
        let sendMsgPromises = await getSendMessageToSpecificClientPromises(formattedData, domain, stage, connectionId);

        // Execute promises
        await Promise.all(sendMsgPromises);
    } catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    return { statusCode: 200, body: "Data sent successfully." };
};

// Function to query DynamoDB for rates by crypto symbol
async function getCryptoRates(symbol) {
    const queryCommand = new QueryCommand({
        TableName: "CryptoRates",
        KeyConditionExpression: "CryptoSymbol = :symbol",
        ExpressionAttributeValues: {
            ":symbol": symbol,
        },
        ScanIndexForward: true // Ensure ascending order by timestamp
    });

    const response = await docClient.send(queryCommand);
    const items = response.Items;

    // Assuming items are already sorted by CryptoTS (timestamp)
    let targetValues = items.map(item => item.Rate);
    let startDate = items.length > 0 ? items[0].CryptoTS : null;

    // Format startDate as required
    if (startDate) {
        startDate = new Date(startDate).toISOString().replace(/T.*/, ''); // Converts timestamp to YYYY-MM-DD format
    }
    
    let type = "initialData";

    return {
        type,
        startDate,
        targetValues
    };
}
