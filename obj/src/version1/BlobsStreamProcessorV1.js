"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
let stream = require('stream');
class BlobsStreamProcessorV1 {
    static createBlobFromStream(correlationId, blob, writer, callback) {
        let token = null;
        let error = null;
        let ws = stream.Writable();
        ws._write = (chunk, enc, next) => {
            let buffer = chunk != null ? Buffer.from(chunk, enc) : null;
            async.series([
                // Start writing when first chunk comes
                (callback) => {
                    if (token != null)
                        callback();
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
            if (token == null)
                return;
            writer.endBlobWrite(correlationId, token, ' ', (err, data) => {
                blob = data;
                token = null;
                callback(error || err, data);
            });
        };
        ws.on('end', close);
        ws.on('finish', close);
        // Abort writing blob
        ws.on('error', (err) => {
            error = err;
            if (token == null)
                return;
            // Ignore abort error
            writer.abortBlobWrite(correlationId, token, (err) => {
                token = null;
            });
        });
        return ws;
    }
    static getBlobStreamById(correlationId, blobId, reader, chunkSize, callback) {
        let rs = stream.Readable();
        let blob;
        let skip = 0;
        let size = 0;
        let closed = false;
        rs._read = (sz) => {
            async.series([
                // Read blob, start reading
                (callback) => {
                    if (blob != null)
                        callback();
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
                    reader.readBlobChunk(correlationId, blobId, skip, take, (err, chunk) => {
                        if (err)
                            callback(err);
                        else {
                            let buffer = Buffer.from(chunk, 'base64');
                            size -= buffer.length;
                            skip += buffer.length;
                            rs.push(buffer);
                            callback();
                        }
                    });
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
                if (err)
                    rs.emit('error', err);
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
        });
        return rs;
    }
}
exports.BlobsStreamProcessorV1 = BlobsStreamProcessorV1;
//# sourceMappingURL=BlobsStreamProcessorV1.js.map