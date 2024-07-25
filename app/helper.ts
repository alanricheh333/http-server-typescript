
import fs from 'node:fs';

export function generateResponseFromRequest(request: string, path: string, param: string): string {
    switch (param) {
        case '':
            return 'HTTP/1.1 200 OK\r\n\r\n';
        case 'echo':
            const message = path.split('/')[2]
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${message.length}\r\n\r\n${message}`;
        case 'user-agent':
            const userAgent = request.split('User-Agent: ')[1].split('\r\n')[0]
            return `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`;
        case 'files':
            const fileName = path.split('/')[2]
            const args = process.argv.slice(2);
            const [___, absPath] = args;
            const filePath = absPath + "/" + fileName;

            try {
                const content = fs.readFileSync(filePath);
                console.log('File exists');
                return `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${content.length}\r\n\r\n${content}`;
            } catch (error) {
                console.log('File does not exist');
                return 'HTTP/1.1 404 Not Found\r\n\r\n';
            }
        

        default:
            return 'HTTP/1.1 404 Not Found\r\n\r\n';
    }
}