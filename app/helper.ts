import fs from 'node:fs';
import { gzipCompress } from './compressors';

/**
 * Generates a response based on the given request, method, path, and parameter.
 * Handles various cases including echo, user-agent, and file operations.
 *
 * @param request - The raw HTTP request string.
 * @param method - The HTTP method (e.g., GET, POST).
 * @param path - The requested path.
 * @param param - A specific parameter to determine the response type.
 * @param headers - An array of headers extracted from the request.
 * @returns The generated HTTP response string.
 */
export function generateResponseFromRequest(request: string, method: string, path: string, param: string, headers: string[]): string {

    switch (param) {
        case '':
            // Default case, returns a simple OK response
            return 'HTTP/1.1 200 OK\r\n\r\n';
        case 'echo':
            // Echoes back a part of the path
            const message = path.split('/')[2];
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
        case 'user-agent':
            // Returns the User-Agent header from the request
            const userAgent = headers.find(header => header.startsWith('User-Agent: '))?.split('User-Agent: ')[1] || '';
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        case 'files':
            // extract the filepath
            const fileName = path.split('/')[2];
            const args = process.argv.slice(2);
            const [___, absPath] = args;
            const filePath = absPath + "/" + fileName;

            if (method == "GET") {
                // Handles file retrieval
                try {
                    const content = fs.readFileSync(filePath);
                    console.log('File exists');
                    return `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
                } catch (error) {
                    console.log('File does not exist');
                    return 'HTTP/1.1 404 Not Found\r\n\r\n';
                }

            } else if (method == "POST") {
                // Handles file creation
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
            // Default case for unknown parameters
            return 'HTTP/1.1 404 Not Found\r\n\r\n';
    }
}

/**
 * Extracts headers from the raw HTTP request string.
 *
 * @param request - The raw HTTP request string.
 * @returns An array of headers.
 */
export function extractHeaders(request: string): string[] {
    return request.split('\r\n');
}

/**
 * Extracts a specific header from the raw HTTP request string.
 *
 * @param request - The raw HTTP request string.
 * @param header - The header name to be extracted.
 * @returns The value of the specified header.
 */
export function extractCertainHeader(request: string, header: string): string {
    for (const head of extractHeaders(request)) {
        if (head.startsWith(header)) {
            return head.split(header)[1];
        }
    }
    return '';
}

/**
 * Injects a compressed response body using gzip if the client supports it.
 *
 * @param request - The raw HTTP request string.
 * @param response - The generated HTTP response string.
 * @returns A tuple containing the potentially modified response string and the compressed body as a buffer.
 */
export function injectCompressedResponse(request: string, response: string): [string, Buffer] {

    var acceptEncoding = extractCertainHeader(request, 'Accept-Encoding: ');
    var encodingArray = acceptEncoding.split(', ');

    for (var encode of encodingArray) {

        if (encode.includes('gzip')) {
            // If gzip is supported, compress the response body
            response = response.replace('HTTP/1.1 200 OK\r\n', 'HTTP/1.1 200 OK\r\nContent-Encoding: gzip\r\n');
            var responseBody = response.split('\r\n\r\n')[1];
            console.log("Response body: ", responseBody);

            var compressedBody = gzipCompress(responseBody);
            console.log("Compressed body: ", compressedBody);

            response = response.replace('Content-Length: ' + responseBody.length, 'Content-Length: ' + compressedBody.length);
            response = response.replace(responseBody, '');
            console.log("Response after injection: ", response);
            return [response, compressedBody];
        }

    }
    return [response, Buffer.from('')];
}
