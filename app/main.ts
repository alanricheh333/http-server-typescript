import * as net from "net";
import { extractHeaders, generateResponseFromRequest, injectCompressedResponse } from "./helper";

console.log("Logs from your program will appear here!");

// Create a new TCP server
const server = net.createServer((socket) => {
    // Event listener for incoming data on the socket
    socket.on("data", (data) => {
        
        // Convert the incoming data to a string
        const request = data.toString();
        console.log("Request: ", request);
        
        // Split the request string to extract the HTTP method and path
        var requestSplit = request.split(" ");

        // Extract headers from the request
        const headers = extractHeaders(request);
        console.log("Headers: ", headers);

        // Get the HTTP method (e.g., GET, POST)
        const method = requestSplit[0];
        console.log("Method: ", method);

        // Get the path from the request
        const path = requestSplit[1];
        console.log("Path: ", path);

        // Get the first parameter in the path
        const params = path.split('/')[1];
        console.log("Params: ", params);

        // Generate a response based on the request details
        var response = generateResponseFromRequest(request, method, path, params, headers);
        var hexRep;
        
        // Inject gzip compression if accepted by the client
        [response, hexRep] = injectCompressedResponse(request, response);
        
        // Write the response to the socket
        socket.write(response);
        
        // If there's a compressed body, write it to the socket
        if (hexRep) {
            socket.write(hexRep);
        }

        // End the socket connection
        socket.end();
    });
});

// Start the server on port 4221 at localhost
server.listen(4221, "localhost");
