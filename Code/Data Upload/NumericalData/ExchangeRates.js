var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
//Displays data from web service
function processData(data, CryptoSymbol, market) {
    return __awaiter(this, void 0, void 0, function* () {
        let itemCount = 0;
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
                yield documentClient.put(params).promise();
                console.log("Data saved to DynamoDB table.");
            }
            catch (error) {
                console.error("Error saving data to DynamoDB table:", error);
            }
        }
        console.log(`Number of data items: ${itemCount}`);
    });
}
//Downloads data from AlphaVantage
function downloadData(symbol, market) {
    return __awaiter(this, void 0, void 0, function* () {
        //Base url
        let url = "https://www.alphavantage.co/query?function=DIGITAL_CURRENCY_DAILY";
        //Add API key
        url += "&apikey=" + "MRZYC2B2VXU9O407";
        //Add currency symbols
        url += "&symbol=" + symbol + "&market=" + market;
        //Send GET to endpoint with Axios
        try {
            let data = (yield axios.get(url)).data;
            console.log(data);
            processData(data, symbol, market);
        }
        catch (error) {
            console.error("Error downloading data:", error);
        }
    });
}
//downloadData("BTC", "USD");
//downloadData("ETH", "USD");
//downloadData("LTC", "USD");
//downloadData("XRP", "USD");
downloadData("SOL", "USD");
