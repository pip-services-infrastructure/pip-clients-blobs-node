"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_aws_node_1 = require("pip-services3-aws-node");
const BlobsDataProcessorV1_1 = require("./BlobsDataProcessorV1");
const BlobsUriProcessorV1_1 = require("./BlobsUriProcessorV1");
const BlobsStreamProcessorV1_1 = require("./BlobsStreamProcessorV1");
class BlobsLambdaClientV1 extends pip_services3_aws_node_1.CommandableLambdaClient {
    constructor(config) {
        super('blobs');
        this._chunkSize = 10240;
        if (config != null)
            this.configure(pip_services3_commons_node_1.ConfigParams.fromValue(config));
    }
    configure(config) {
        super.configure(config);
        this._chunkSize = config.getAsLongWithDefault('options.chunk_size', this._chunkSize);
    }
    getBlobsByFilter(correlationId, filter, paging, callback) {
        this.callCommand('get_blobs_by_filter', correlationId, {
            filter: filter,
            paging: paging
        }, callback);
    }
    getBlobsByIds(correlationId, blobIds, callback) {
        this.callCommand('get_blobs_by_ids', correlationId, {
            blob_ids: blobIds
        }, callback);
    }
    getBlobById(correlationId, blobId, callback) {
        this.callCommand('get_blob_by_id', correlationId, {
            blob_id: blobId
        }, callback);
    }
    createBlobFromUri(correlationId, blob, uri, callback) {
        BlobsUriProcessorV1_1.BlobsUriProcessorV1.createBlobFromUri(correlationId, blob, this, uri, callback);
    }
    getBlobUriById(correlationId, blobId, callback) {
        this.callCommand('get_blob_uri_by_id', correlationId, {
            blob_id: blobId
        }, callback);
    }
    createBlobFromData(correlationId, blob, buffer, callback) {
        BlobsDataProcessorV1_1.BlobsDataProcessorV1.createBlobFromData(correlationId, blob, this, buffer, this._chunkSize, callback);
    }
    getBlobDataById(correlationId, blobId, callback) {
        BlobsDataProcessorV1_1.BlobsDataProcessorV1.getBlobDataById(correlationId, blobId, this, this._chunkSize, callback);
    }
    createBlobFromStream(correlationId, blob, callback) {
        return BlobsStreamProcessorV1_1.BlobsStreamProcessorV1.createBlobFromStream(correlationId, blob, this, callback);
    }
    getBlobStreamById(correlationId, blobId, callback) {
        return BlobsStreamProcessorV1_1.BlobsStreamProcessorV1.getBlobStreamById(correlationId, blobId, this, this._chunkSize, callback);
    }
    beginBlobWrite(correlationId, blob, callback) {
        this.callCommand('begin_blob_write', correlationId, {
            blob: blob
        }, callback);
    }
    writeBlobChunk(correlationId, token, chunk, callback) {
        this.callCommand('write_blob_chunk', correlationId, {
            token: token,
            chunk: chunk
        }, callback);
    }
    endBlobWrite(correlationId, token, chunk, callback) {
        this.callCommand('end_blob_write', correlationId, {
            token: token,
            chunk: chunk
        }, callback);
    }
    abortBlobWrite(correlationId, token, callback) {
        this.callCommand('abort_blob_write', correlationId, {
            token: token
        }, callback);
    }
    beginBlobRead(correlationId, blobId, callback) {
        this.callCommand('begin_blob_read', correlationId, {
            blob_id: blobId
        }, callback);
    }
    readBlobChunk(correlationId, blobId, skip, take, callback) {
        this.callCommand('read_blob_chunk', correlationId, {
            blob_id: blobId,
            skip: skip,
            take: take
        }, callback);
    }
    endBlobRead(correlationId, blobId, callback) {
        this.callCommand('end_blob_read', correlationId, {
            blob_id: blobId
        }, callback);
    }
    updateBlobInfo(correlationId, blob, callback) {
        this.callCommand('update_blob_info', correlationId, {
            blob: blob
        }, callback);
    }
    markBlobsCompleted(correlationId, blobIds, callback) {
        this.callCommand('mark_blobs_completed', correlationId, {
            blobIds: blobIds
        }, callback);
    }
    deleteBlobById(correlationId, blobId, callback) {
        this.callCommand('delete_blob_id', correlationId, {
            blob_id: blobId
        }, callback);
    }
    deleteBlobsByIds(correlationId, blobIds, callback) {
        this.callCommand('delete_blobs_by_ids', correlationId, {
            blob_ids: blobIds
        }, callback);
    }
}
exports.BlobsLambdaClientV1 = BlobsLambdaClientV1;
//# sourceMappingURL=BlobsLambdaClientV1.js.map