var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//Use Node module for accessing newsapi
import NewsAPI from 'newsapi';
//Use AWS SDK to access DynamoDB
import AWS from 'aws-sdk';
AWS.config.update({ region: 'eu-west-2' });
// Initialize the DynamoDB DocumentClient
const documentClient = new AWS.DynamoDB.DocumentClient();
//Module that reads keys from .env file
import * as dotenv from 'dotenv';
//Copy variables in file into environment variables
dotenv.config();
//Pulls and logs data from API
function getNews(crptoName, CryptoSymbol) {
    return __awaiter(this, void 0, void 0, function* () {
        //Create new NewsAPI class
        //const newsapi = new NewsAPI(process.env.NEWS_API);
        const newsapi = new NewsAPI("aa96a315ac264296b563f504e2ece789");
        //Search API
        const result = yield newsapi.v2.everything({
            q: crptoName,
            pageSize: 100,
            language: 'en'
        });
        //Output article titles and dates 
        console.log(`Number of articles: ${result.articles.length}`);
        for (let article of result.articles) {
            const date = new Date(article.publishedAt);
            console.log(`Unix Time: ${date.getTime()}; title: ${article.title}`);
            //Save symbol, timestamp and Text in CryptoNews table
            const params = {
                TableName: "CryptoNews",
                Item: {
                    "CryptoSymbol": CryptoSymbol.toString(),
                    "CryptoTS": date.getTime(),
                    "Text": article.title.toString()
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
    });
}
// Uncomment to run
// getNews("Bitcoin", "BTC"); 
// getNews("Ethereum", "ETH");
getNews("Litecoin", "LTC");
//  getNews("Ripple", "XRP");
// getNews("Solana", "SOL");
