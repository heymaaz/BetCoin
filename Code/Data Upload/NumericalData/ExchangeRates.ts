//Axios will handle HTTP requests to web service
import axios from 'axios';

//Use AWS SDK to access DynamoDB
import AWS from 'aws-sdk';
AWS.config.update({ region: 'us-east-1' });

// Initialize the DynamoDB DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();

//Module that reads keys from .env file
import * as dotenv from 'dotenv';

//Copy variables in file into environment variables
dotenv.config();

//Defines structure of Alpha Vantage data.
interface AlphaVantageCrypto {
    [key: string]: {//Time Series (Digital Currency Daily)
        [key: string]: { //Date: 2023-02-06
            [key: string]: number//4b. close (USD)
        }
    }
}

//Displays data from web service
async function processData(data: AlphaVantageCrypto, CryptoSymbol: string, market: string): Promise<void> { 
    let itemCount:number = 0;
    for (let dt in data['Time Series (Digital Currency Daily)']) {
        //Convert data to unix timestamp
        const date = new Date(dt);
        
        //Extract exchange rate
        const rate = data['Time Series (Digital Currency Daily)'][dt]['4b. close (USD)'];
        
        //Log downloaded data
        console.log(`TimeStamp: ${date.getTime()}. ${CryptoSymbol} to ${market}: ${rate}`);
        ++itemCount;
        
        //Add to DynamoDB

        //Save symbol, timestamp and Rate in CryptoRates table
        const params = {
            TableName: "CryptoRates",
            Item: {
                "CryptoSymbol": CryptoSymbol,
                "CryptoTS": date.getTime(),
                "Rate": rate
            }
        };
        
        // Save data to DynamoDB
        try {
            await documentClient.put(params).promise();
            console.log("Data saved to DynamoDB table.");
        } catch (error) {
            console.error("Error saving data to DynamoDB table:", error);
        }
    }
    console.log(`Number of data items: ${itemCount}`);
}


//Downloads data from AlphaVantage
async function downloadData(symbol: string, market: string) {
    //Base url
    let url: string = "https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY";
    
    //Add API key
    url += "&apikey=" + "MRZYC2B2VXU9O407";
    
    //Add currency symbols
    url += "&symbol=" + symbol + "&market=" + market;
    
    //Send GET to endpoint with Axios
    try {
        let data: AlphaVantageCrypto = (await axios.get(url)).data;
        console.log(data);
        processData(data, symbol, market);
    } catch (error) {
        console.error("Error downloading data:", error);
    }
    
}

//downloadData("BTC", "USD");
//downloadData("ETH", "USD");
//downloadData("LTC", "USD");
//downloadData("XRP", "USD");
downloadData("SOL", "USD");
