//Import functions for database
import { deleteConnectionId } from './database.mjs';

//Import API Gateway
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi"; 

//Returns promises to send messages to all connected clients
export async function getSendMessageToSpecificClientPromises(message, domain, stage, connectionId){
    
    console.log("domainName: " + domain + "; stage: " + stage);

    //Create API Gateway management class.
    const callbackUrl = `https://${domain}/${stage}`;
    const apiGwClient = new ApiGatewayManagementApiClient({ endpoint: callbackUrl });
    try{
        console.log("Sending message '" + message + "' to: " + connectionId);

        //Create post to connection command
        const postToConnectionCommand = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: message
        });

        //Wait for API Gateway to execute and log result
        await apiGwClient.send(postToConnectionCommand);
        console.log("Message '" + message + "' sent to: " + connectionId);
        
        // Return a success message
        return "Message sent successfully to " + connectionId;
    }
    catch(err){
        console.log("Failed to send message to: " + connectionId);

        //Delete connection ID from database
        if(err.statusCode == 410) {
            try {
                await deleteConnectionId(connectionId);
            }
            catch (err) {
                console.log("ERROR deleting connectionId: " + JSON.stringify(err));
                throw err;
            }
        }
        else{
            console.log("UNKNOWN ERROR: " + JSON.stringify(err));
            throw err;
        }
    }

};