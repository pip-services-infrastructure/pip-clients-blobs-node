"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
let stream = require('stream');
class BlobsDataProcessorV1 {
    static createBlobFromData(correlationId, blob, writer, data, chunkSize, callback) {
        let buffer = Buffer.from(data);
        let skip = 0;
        let size = buffer.length;
        let token = null;
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
                async.whilst(() => size > chunkSize, (callback) => {
                    let chunk = buffer.toString('base64', skip, skip + chunkSize);
                    writer.writeBlobChunk(correlationId, token, chunk, (err, tok) => {
                        skip += chunkSize;
                        size -= chunkSize;
                        token = tok;
                        callback(err);
                    });
                }, callback);
            },
            //End writing
            (callback) => {
                let chunk = buffer.toString('base64', skip, buffer.length);
                writer.endBlobWrite(correlationId, token, chunk, (err, data) => {
                    token = null;
                    blob = data;
                    callback(err);
                });
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
    static getBlobDataById(correlationId, blobId, reader, chunkSize, callback) {
        let blob;
        let buffer = null;
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
                async.whilst(() => size > 0, (callback) => {
                    let take = Math.min(chunkSize, size);
                    reader.readBlobChunk(correlationId, blobId, skip, take, (err, chunk) => {
                        if (err)
                            callback(err);
                        else {
                            let data = Buffer.from(chunk, 'base64');
                            buffer = Buffer.concat([buffer, data]);
                            size -= data.length;
                            skip += data.length;
                            callback();
                        }
                    });
                }, callback);
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
            if (callback)
                callback(err, blob, buffer);
        });
    }
}
exports.BlobsDataProcessorV1 = BlobsDataProcessorV1;
//# sourceMappingURL=BlobsDataProcessorV1.js.map