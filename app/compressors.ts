import zlib from 'node:zlib';

/**
 * Compresses a response body using gzip and returns the compressed data.
 * @param responseBody The response body to be compressed.
 * @returns The compressed response body as a buffer.
 */
export function gzipCompress(responseBody: string): Buffer {
    return zlib.gzipSync(responseBody);
}