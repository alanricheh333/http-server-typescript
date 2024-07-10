
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
        default:
            return 'HTTP/1.1 404 Not Found\r\n\r\n';
    }
}