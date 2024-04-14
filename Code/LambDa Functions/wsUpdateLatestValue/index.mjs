// Import libraries
import { getSendMessagePromises } from './websocket.mjs';


//Import library and scan command
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Create DynamoDB client
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  
  let flag = false;
  
  for(let record of event.Records){
    if(record.eventName === "INSERT"){
      flag = true;
      break;
    }
  }
  
  if(flag===true){//if there is a new record
    //send the latest crypto values to the clients
    try {
      // Extract domain and stage from event for callback URL
      const domain = "0glkdb0fh8.execute-api.us-east-1.amazonaws.com";
      const stage = "production";
      
      // Get rates from DynamoDB
      const ratesData = await getLatestCryptoRates();
      
      // Format data to send back
      const formattedData = JSON.stringify(ratesData);
      
      // Get promises to send messages to connected clients
      let sendMsgPromises = await getSendMessagePromises(formattedData, domain, stage);
      
      // Execute promises
      
      await Promise.all(sendMsgPromises);
      console.log("Data sent successfully.");
    } 
    catch (err) {
      console.log("Error: " + JSON.stringify(err));
    }
  }
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

