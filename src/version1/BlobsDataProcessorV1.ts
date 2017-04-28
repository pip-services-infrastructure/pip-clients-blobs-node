let _ = require('lodash');
let async = require('async');
let stream = require('stream');

import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobInfoV1 } from './BlobInfoV1';

export class BlobsDataProcessorV1 {

    public static createBlobFromData(correlationId: string, blob: BlobInfoV1,
        writer: IBlobsChunkyWriterV1, data: any, chunkSize: number,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        
        let buffer = Buffer.from(data);
        let skip = 0;
        let size = buffer.length;
        let token: string = null;
        
        async.series([
            // Start writing when first chunk comes
            (callback) => {
                writer.beginBlobWrite(correlationId, blob, (err, tok) => {
                    token = tok;
                    callback(err);
                });
            },
            // Write chunks
            (callback) => {
                async.whilst(
                    () => size > chunkSize,
                    (callback) => {
                        let chunk = buffer.toString('base64', skip, skip + chunkSize);
                        writer.writeBlobChunk(correlationId, token, chunk, (err, tok) => {
                            skip += chunkSize;
                            size -= chunkSize;
                            token = tok;
                            callback(err);
                        });
                    },
                    callback
                )
            },
            //End writing
            (callback) => {
                let chunk = buffer.toString('base64', skip, buffer.length);
                writer.endBlobWrite(correlationId, token, chunk, (err, data) => {
                    token = null;
                    blob = data;
                    callback(err);
                })
            }
        ], (err) => {
            if (err != null && token != null) {
                writer.abortBlobWrite(correlationId, token, (err) => {
                    // Ignore abort error
                });
            }

            callback(err, blob);
        });
    }

    public static getBlobDataById(correlationId: string, blobId: string,
        reader: IBlobsChunkyReaderV1, chunkSize: number,
        callback?: (err: any, blob: BlobInfoV1, buffer: any) => void): any {
        
        let blob: BlobInfoV1;
        let buffer: any = null;

        async.series([
            // Read blob, start reading
            (callback) => {
                reader.beginBlobRead(correlationId, blobId, (err, data) => {
                    if (data != null) {
                        blob = data;
                        buffer = new Buffer(0);
                    }
                    callback(err);
                });
            },
            // Read all chunks until the end
            (callback) => {
                let skip = 0;
                let size = blob.size;
                async.whilst(
                    () => size > 0,
                    (callback) => {
                        let take = Math.min(chunkSize, size);
                        reader.readBlobChunk(
                            correlationId, blobId, skip, take, 
                            (err, chunk) => {
                                if (err) callback(err);
                                else {
                                    let data = Buffer.from(chunk, 'base64');
                                    buffer = Buffer.concat([buffer, data]);
                                    size -= buffer.length;
                                    skip += buffer.length;
                                    callback();
                                }
                            }
                        )
                    },
                    callback
                )
            },
            // End reading
            (callback) => {
                reader.endBlobRead(correlationId, blobId, (err) => {
                    callback(err);
                });
            }
        ], (err) => {
            blob = err == null ? blob : null;
            buffer = err == null ? buffer : null;
            if (callback) callback(err, blob, buffer);
        });
    }
}