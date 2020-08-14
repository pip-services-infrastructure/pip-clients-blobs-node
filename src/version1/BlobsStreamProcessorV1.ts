let _ = require('lodash');
let async = require('async');
let stream = require('stream');

import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobInfoV1 } from './BlobInfoV1';

export class BlobsStreamProcessorV1 {

    public static createBlobFromStream(correlationId: string, blob: BlobInfoV1,
        writer: IBlobsChunkyWriterV1, callback?: (err: any, blob: BlobInfoV1) => void): any {

        let token: string = null;
        let error: any = null;
        let ws = stream.Writable();
        
        ws._write = (chunk: any, enc: BufferEncoding, next: (err: any) => void) => {
            let buffer = chunk != null ? Buffer.from(chunk, enc): null;
            
            async.series([
                // Start writing when first chunk comes
                (callback) => {
                    if (token != null) callback();
                    else {
                        writer.beginBlobWrite(correlationId, blob, (err, tok) => {
                            token = tok;
                            callback(err);
                        });
                    }
                },
                // Write chunks
                (callback) => {
                    let chunk = buffer.toString('base64');
                    writer.writeBlobChunk(correlationId, token, chunk, (err, tok) => {
                        token = tok || token;
                        callback(err);
                    });
                }
            ], (err) => {
                next(err);
            });
        };

        let close = () => {
            if (token == null) return;

            writer.endBlobWrite(correlationId, token, ' ', (err, data) => {
                blob = data;
                token = null;
                callback(error || err, data);
            })
        };

        ws.on('end', close);
        ws.on('finish', close);

        // Abort writing blob
        ws.on('error', (err) => {
            error = err;

            if (token == null) return;

            // Ignore abort error
            writer.abortBlobWrite(correlationId, token, (err) => {
                token = null;
            });
        })

        return ws;
    }

    public static getBlobStreamById(correlationId: string, blobId: string,
        reader: IBlobsChunkyReaderV1, chunkSize: number,
        callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any {
        
        let rs = stream.Readable();
        let blob: BlobInfoV1;
        let skip = 0;
        let size = 0;
        let closed = false;

        rs._read = (sz: number) => {
            async.series([
                // Read blob, start reading
                (callback) => {
                    if (blob != null) callback();
                    else {
                        reader.beginBlobRead(correlationId, blobId, (err, data) => {
                            blob = data;
                            size = blob != null ? blob.size : 0;
                            skip = 0;
                            callback(err);
                        });
                    }
                },
                // Read all chunks until the end
                (callback) => {
                    if (size == 0) {
                        callback();
                        return;
                    }

                    let take = Math.min(chunkSize, size);
                    reader.readBlobChunk(
                        correlationId, blobId, skip, take, 
                        (err, chunk) => {
                            if (err) callback(err);
                            else {
                                let buffer = Buffer.from(chunk, 'base64');
                                size -= buffer.length;
                                skip += buffer.length;
                                rs.push(buffer);
                                callback();
                            }
                        }
                    );
                },
                // End reading
                (callback) => {
                    if (size > 0 && !closed) {
                        callback();
                        return;
                    }

                    reader.endBlobRead(correlationId, blobId, (err) => {
                        closed = true;
                        if (err == null)
                            rs.push(null);
                        callback();
                    });
                }
            ], (err) => {
                if (err) rs.emit('error', err);
            });
        };

        let close = () => {
            // Postpone final callback until cache is processed
            if (callback) {
                setTimeout(() => {
                    callback(null, blob, rs);
                }, 0);
            }
        };

        rs.on('end', close);
        rs.on('finish', close);

        // Abort writing blob
        rs.on('error', (err) => {
            callback(err, null, null);
        })

        return rs;
    }
}