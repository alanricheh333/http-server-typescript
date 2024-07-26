import * as net from "net";
import { extractHeaders, generateResponseFromRequest, injectCompressedResponse } from "./helper";

console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        
        const request = data.toString();
        console.log("Request: ", request);
        
        var requestSplit = request.split(" ");

        const headers = extractHeaders(request);
        console.log("Headers: ", headers);

        const method = requestSplit[0];
        console.log("Method: ", method);

        const path = requestSplit[1];
        console.log("Path: ", path);

        const params = path.split('/')[1];
        console.log("Params: ", params);

        var response = generateResponseFromRequest(request, method, path, params, headers);
        response = injectCompressedResponse(request, response);
        socket.write(response);

        socket.end();
    })
});

server.listen(4221, "localhost");
