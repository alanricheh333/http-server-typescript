import * as net from "net";
import { generateResponseFromRequest } from "./helper";

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

const server = net.createServer((socket) => {
    socket.on("data", (data) => {
        
        const request = data.toString();
        console.log("Request: ", request);
        
        var requestSplit = request.split(" ");
        const method = requestSplit[0];

        const path = requestSplit[1];
        console.log("Path: ", path);

        const params = path.split('/')[1];
        console.log("Params: ", params);

        const response = generateResponseFromRequest(request, method, path, params);
        socket.write(response);

        socket.end();
    })
});

server.listen(4221, "localhost");
