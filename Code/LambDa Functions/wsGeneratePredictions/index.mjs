// Import libraries
import { getSendMessageToSpecificClientPromises } from './websocket.mjs';

//import SageMaker and invoke endpoint command
import { SageMakerRuntimeClient, InvokeEndpointCommand } from "@aws-sdk/client-sagemaker-runtime"; 

//Create SageMakerRuntimeClient
const client = new SageMakerRuntimeClient({ region: "us-east-1" }); 

export const handler = async (event) => {
    try {
        console.log("event body "+event.body)
        console.log((event.body).data);
        //Get previous 100 datapoints
        const target = JSON.parse(event.body).data.targetValues;
        // Get the start Date of the target
        const start = JSON.parse(event.body).data.startDate;
        // Get Crypto Symbol from event
        const cryptoSymbol = JSON.parse(event.body).data.cryptoSymbol;
        let EndpointName;
        switch(cryptoSymbol){
          case "BTC" : EndpointName="BitcoinEndpoint1";
                        break;
          
          case "ETH" : EndpointName="ETHModel1Endpoint";
                        break;
          
          case "LTC" : EndpointName="LTCModel1Endpoint";
                        break;
          
          case "SOL" : EndpointName="SOLModel1Endpoint";
                        break;
          
          case "XRP" : EndpointName="XRPModel1Endpoint";
                        break;
        }
        const endpointData = {
          "instances":
          [
            {
              "start": start,
              "target": target
            }
          ],
          "configuration":
          {
            "num_samples" : 50,
            "output_types" : ["mean", "quantiles", "samples"],
            "quantiles" : ["0.1", "0.9"]
          }
        };
        
        //Get predictions from SageMaker
        const predictions = await invokeEndpoint(endpointData, EndpointName);
        
        // Extract domain and stage from event for callback URL
        const domain = event.requestContext.domainName;
        const stage = event.requestContext.stage;
        
        //Extract the connection ID from the event object to only send to that connection
        const connectionId = event.requestContext.connectionId;


        // Format data to send back
        const formattedData = JSON.stringify(predictions);

        // Get promises to send messages to Specific Client
        let sendMsgPromises = await getSendMessageToSpecificClientPromises(formattedData, domain, stage, connectionId);

        // Execute promises
        await Promise.all(sendMsgPromises);
    } catch (err) {
        return { statusCode: 500, body: "Error: " + JSON.stringify(err) };
    }

    return { statusCode: 200, body: "Data sent successfully." };
};

//Calls endpoint and logs results
async function invokeEndpoint (endpointData, EndpointName) {
  //Create and send command with data
  const command = new InvokeEndpointCommand({
    EndpointName: EndpointName,
    Body: JSON.stringify(endpointData),
    ContentType: "application/json",
    Accept: "application/json"
  });
  const response = await client.send(command);
  
  //Must install @types/node for this to work
  let predictions = JSON.parse(Buffer.from(response.Body).toString('utf8'));
  
  let type = "predictionData";
  
  return {
        type,
        predictions
    };
}
