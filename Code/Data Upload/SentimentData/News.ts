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

//Define structure of article returned from NewsAPI
interface Article {
    title:string,
    publishedAt:string
}

//Define structure of data returned from NewsAPI
interface NewsAPIResult { 
    articles:Array<Article>
}

//Pulls and logs data from API
async function getNews(crptoName:string, CryptoSymbol:string):Promise<void>{
    //Create new NewsAPI class
    //const newsapi = new NewsAPI(process.env.NEWS_API);
    const newsapi = new NewsAPI("aa96a315ac264296b563f504e2ece789");

    //Search API
    const result:NewsAPIResult = await newsapi.v2.everything({
        q: crptoName,
        pageSize: 100,
        language: 'en'
    });

    //Output article titles and dates 
    console.log(`Number of articles: ${result.articles.length}`);
    for(let article of result.articles){
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
            await documentClient.put(params).promise();
            console.log("Data saved to DynamoDB table.");
          } catch (error) {
            console.error("Error saving data to DynamoDB table:", error);
          }
    }
}

 // Uncomment to run
  // getNews("Bitcoin", "BTC"); 
  // getNews("Ethereum", "ETH");
  getNews("Litecoin", "LTC");
  //  getNews("Ripple", "XRP");
  // getNews("Solana", "SOL");

