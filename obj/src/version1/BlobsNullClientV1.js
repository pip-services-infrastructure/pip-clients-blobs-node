"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobsNullClientV1 = void 0;
let stream = require('stream');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
class BlobsNullClientV1 {
    constructor(config) { }
    getBlobsByFilter(correlationId, filter, paging, callback) {
        callback(null, new pip_services3_commons_node_1.DataPage([], 0));
    }
    getBlobsByIds(correlationId, blobIds, callback) {
        callback(null, []);
    }
    getBlobById(correlationId, blobId, callback) {
        callback(null, null);
    }
    createBlobFromUri(correlationId, blob, uri, callback) {
        if (callback)
            callback(null, null);
    }
    getBlobUriById(correlationId, blobId, callback) {
        callback(null, null);
    }
    createBlobFromData(correlationId, blob, buffer, callback) {
        if (callback)
            callback(null, null);
    }
    getBlobDataById(correlationId, blobId, callback) {
        callback(null, null, new Buffer(0));
    }
    createBlobFromStream(correlationId, blob, callback) {
        if (callback) {
            setTimeout(() => {
                callback(null, blob);
            }, 0);
        }
        return stream.Stream();
    }
    getBlobStreamById(correlationId, blobId, callback) {
        let rs = stream.Readable();
        if (callback) {
            setTimeout(() => {
                rs.push(null);
                callback(null, null, rs);
            }, 0);
        }
        return rs;
    }
    beginBlobWrite(correlationId, blob, callback) {
        callback(null, null);
    }
    writeBlobChunk(correlationId, token, chunk, callback) {
        callback(null, token);
    }
    endBlobWrite(correlationId, token, chunk, callback) {
        callback(null, null);
    }
    abortBlobWrite(correlationId, token, callback) {
        callback(null);
    }
    beginBlobRead(correlationId, blobId, callback) {
        callback(null, null);
    }
    readBlobChunk(correlationId, blobId, skip, take, callback) {
        callback(null, null);
    }
    endBlobRead(correlationId, blobId, callback) {
        callback(null);
    }
    updateBlobInfo(correlationId, blob, callback) {
        callback(null, blob);
    }
    markBlobsCompleted(correlationId, blobIds, callback) {
        callback(null);
    }
    deleteBlobById(correlationId, blobId, callback) {
        callback(null);
    }
    deleteBlobsByIds(correlationId, blobIds, callback) {
        callback(null);
    }
}
exports.BlobsNullClientV1 = BlobsNullClientV1;
//# sourceMappingURL=BlobsNullClientV1.js.map