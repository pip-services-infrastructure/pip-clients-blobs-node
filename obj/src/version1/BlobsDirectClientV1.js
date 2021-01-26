"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobsDirectClientV1 = void 0;
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const BlobsUriProcessorV1_1 = require("./BlobsUriProcessorV1");
const BlobsDataProcessorV1_1 = require("./BlobsDataProcessorV1");
const BlobsStreamProcessorV1_1 = require("./BlobsStreamProcessorV1");
//import { IBlobsController } from 'pip-services-blobs-node';
class BlobsDirectClientV1 extends pip_services3_rpc_node_1.DirectClient {
    constructor(config) {
        super();
        this._chunkSize = 10240;
        this._dependencyResolver.put('controller', new pip_services3_commons_node_2.Descriptor("pip-services-blobs", "controller", "*", "*", "*"));
        if (config != null)
            this.configure(pip_services3_commons_node_1.ConfigParams.fromValue(config));
    }
    configure(config) {
        super.configure(config);
        this._chunkSize = config.getAsLongWithDefault('options.chunk_size', this._chunkSize);
    }
    getBlobsByFilter(correlationId, filter, paging, callback) {
        this._controller.getBlobsByFilter(correlationId, filter, paging, callback);
    }
    getBlobsByIds(correlationId, blobIds, callback) {
        this._controller.getBlobsByIds(correlationId, blobIds, callback);
    }
    getBlobById(correlationId, blobId, callback) {
        this._controller.getBlobById(correlationId, blobId, callback);
    }
    createBlobFromUri(correlationId, blob, uri, callback) {
        BlobsUriProcessorV1_1.BlobsUriProcessorV1.createBlobFromUri(correlationId, blob, this, uri, callback);
    }
    getBlobUriById(correlationId, blobId, callback) {
        this._controller.getBlobUriById(correlationId, blobId, callback);
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
        this._controller.beginBlobWrite(correlationId, blob, callback);
    }
    writeBlobChunk(correlationId, token, chunk, callback) {
        this._controller.writeBlobChunk(correlationId, token, chunk, callback);
    }
    endBlobWrite(correlationId, token, chunk, callback) {
        this._controller.endBlobWrite(correlationId, token, chunk, callback);
    }
    abortBlobWrite(correlationId, token, callback) {
        this._controller.abortBlobWrite(correlationId, token, callback);
    }
    beginBlobRead(correlationId, blobId, callback) {
        this._controller.beginBlobRead(correlationId, blobId, callback);
    }
    readBlobChunk(correlationId, blobId, skip, take, callback) {
        this._controller.readBlobChunk(correlationId, blobId, skip, take, callback);
    }
    endBlobRead(correlationId, blobId, callback) {
        this._controller.endBlobRead(correlationId, blobId, callback);
    }
    updateBlobInfo(correlationId, blob, callback) {
        this._controller.updateBlobInfo(correlationId, blob, callback);
    }
    markBlobsCompleted(correlationId, blobIds, callback) {
        this._controller.markBlobsCompleted(correlationId, blobIds, callback);
    }
    deleteBlobById(correlationId, blobId, callback) {
        this._controller.deleteBlobById(correlationId, blobId, callback);
    }
    deleteBlobsByIds(correlationId, blobIds, callback) {
        this._controller.deleteBlobsByIds(correlationId, blobIds, callback);
    }
}
exports.BlobsDirectClientV1 = BlobsDirectClientV1;
//# sourceMappingURL=BlobsDirectClientV1.js.map