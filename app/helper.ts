
import fs from 'node:fs';
import { compressGzip } from './compressors';

export function generateResponseFromRequest(request: string, method:string, path: string, param: string, headers: string[]): string {

    switch (param) {
        case '':
            return 'HTTP/1.1 200 OK\r\n\r\n';
        case 'echo':
            const message = path.split('/')[2]
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
        case 'user-agent':
            const userAgent = headers.find(header => header.startsWith('User-Agent: '))?.split('User-Agent: ')[1] || ''; //request.split('User-Agent: ')[1].split('\r\n')[0]
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        case 'files':
            const fileName = path.split('/')[2]
            const args = process.argv.slice(2);
            const [___, absPath] = args;
            const filePath = absPath + "/" + fileName;

            if (method == "GET") {

                try {
                    const content = fs.readFileSync(filePath);
                    console.log('File exists');
                    return `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
                } catch (error) {
                    console.log('File does not exist');
                    return 'HTTP/1.1 404 Not Found\r\n\r\n';
                }

            } else if (method == "POST") {

                // Extract the body of the request
                const bodyStartIndex = request.indexOf('\r\n\r\n') + 4;
                const body = request.substring(bodyStartIndex);

                try {
                    fs.writeFileSync(filePath, body);
                    console.log('File created');
                    return 'HTTP/1.1 201 Created\r\n\r\n';
                } catch (error) {
                    console.error('Error writing file:', error);
                    return 'HTTP/1.1 500 Internal Server Error\r\n\r\n';
                }

            }

        default:
            return 'HTTP/1.1 404 Not Found\r\n\r\n';
    }
}

export function extractHeaders(request: string): string[] {
    return request.split('\r\n');
}

export function extractCertainHeader(request: string, header: string): string {
    for(const head of extractHeaders(request)) {
        if(head.startsWith(header)) {
            return head.split(header)[1];
        }
    }
    return '';
}

export function injectCompressedResponse(request: string, response: string): string {

    var acceptEncoding = extractCertainHeader(request, 'Accept-Encoding: ');
    var encodingArray = acceptEncoding.split(', ');
    
    for (var encode of encodingArray) {

        if (encode.includes('gzip')) {

            response = response.replace('HTTP/1.1 200 OK\r\n', 'HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\n');
            var responseBody = response.split('\r\n\r\n')[1];
            var compressedBody = compressGzip(responseBody);
            response = response.replace(responseBody, compressedBody.toString('hex'));
            console.log("Response after injection: ", response);
            return response;
        
        }

    }
    return response;
}