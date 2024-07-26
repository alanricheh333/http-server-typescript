import zlib from 'node:zlib';

export function compressGzip(responseBody: string): Buffer {
    return zlib.gzipSync(responseBody);
}