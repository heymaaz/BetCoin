import axios from 'axios';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

// Initialize the DynamoDB Client
const dynamoDBClient = new DynamoDB({});
const response = {
  statusCode: 200,
  body: JSON.stringify('Data saved to DynamoDB table.'),
};

export async function getSentiment(text){
  //URL of web service
  let url = `https://kmqvzxr68e.execute-api.us-east-1.amazonaws.com/prod`;
  
  //Sent GET to endpoint with Axios
  let response = await axios.post(url, {
    text
  },{
    headers: {
      'Content-Type': 'text/plain'
    }
  });
  
  
  //Return sentiment.
  return response.data.sentiment;
}

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  for(let record of event.Records){
    
    if(record.eventName === "INSERT"){
      console.log("Processing new INSERT. The record is:"+ JSON.stringify(record, null, 2));

      //Extracting data from event
      const text = record.dynamodb.NewImage.Text.S;
      const cryptoSymbol = record.dynamodb.NewImage.CryptoSymbol.S;
      const cryptoTS = record.dynamodb.NewImage.CryptoTS.N;
      
      console.log(`Text: ${text}`);
      
      //Analyze text for sentiment
      let sentiment = await getSentiment(text);
      
      // Save symbol, timestamp and sentiment results in sentiment table
      const params = {
        TableName: "CryptoSentiment",
        Item: {
          "CryptoSymbol": { S: cryptoSymbol },
          "CryptoTS": { N: cryptoTS },
          "Sentiment": { N: sentiment.toString() }
        }
      };
      
      // Save data to DynamoDB
      try {
        await dynamoDBClient.putItem(params);
        console.log("Data saved to DynamoDB table.");
      } catch (error) {
        console.error("Error saving data to DynamoDB table:", error);
        response = {
          statusCode: 500,
          body: JSON.stringify('Error saving data to DynamoDB table.'),
        };
      }
      
    }
    
  }

  return response;
};

