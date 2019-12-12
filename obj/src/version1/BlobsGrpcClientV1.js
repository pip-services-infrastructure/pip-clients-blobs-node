"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let services = require('../../../src/protos/blobs_v1_grpc_pb');
let messages = require('../../../src/protos/blobs_v1_pb');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_grpc_node_1 = require("pip-services3-grpc-node");
const BlobsDataProcessorV1_1 = require("./BlobsDataProcessorV1");
const BlobsUriProcessorV1_1 = require("./BlobsUriProcessorV1");
const BlobsStreamProcessorV1_1 = require("./BlobsStreamProcessorV1");
const BlobsGrpcConverterV1_1 = require("./BlobsGrpcConverterV1");
class BlobsGrpcClientV1 extends pip_services3_grpc_node_1.GrpcClient {
    constructor(config) {
        super(services.BlobsClient);
        this._chunkSize = 10240;
        if (config != null)
            this.configure(pip_services3_commons_node_1.ConfigParams.fromValue(config));
    }
    configure(config) {
        super.configure(config);
        this._chunkSize = config.getAsLongWithDefault('options.chunk_size', this._chunkSize);
    }
    getBlobsByFilter(correlationId, filter, paging, callback) {
        let request = new messages.BlobInfoPageRequest();
        BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.setMap(request.getFilterMap(), filter);
        request.setPaging(BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromPagingParams(paging));
        let timing = this.instrument(correlationId, 'blobs.get_blobs_by_filter');
        this.call('get_blobs_by_filter', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfoPage(response.getPage())
                : null;
            callback(err, result);
        });
    }
    getBlobsByIds(correlationId, blobIds, callback) {
        let request = new messages.BlobIdsRequest();
        request.setBlobIdsList(blobIds);
        let timing = this.instrument(correlationId, 'blobs.get_blobs_by_ids');
        this.call('get_blobs_by_ids', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfos(response.getBlobsList())
                : null;
            callback(err, result);
        });
    }
    getBlobById(correlationId, blobId, callback) {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
        let timing = this.instrument(correlationId, 'blobs.get_blob_by_id');
        this.call('get_blob_by_id', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                : null;
            callback(err, result);
        });
    }
    createBlobFromUri(correlationId, blob, uri, callback) {
        BlobsUriProcessorV1_1.BlobsUriProcessorV1.createBlobFromUri(correlationId, blob, this, uri, callback);
    }
    getBlobUriById(correlationId, blobId, callback) {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
        let timing = this.instrument(correlationId, 'blobs.get_blob_uri_by_id');
        this.call('get_blob_uri_by_id', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? response.getUri()
                : null;
            callback(err, result);
        });
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
        let blobObj = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfo(blob);
        let request = new messages.BlobInfoObjectRequest();
        request.setBlob(blobObj);
        let timing = this.instrument(correlationId, 'blobs.begin_blob_write');
        this.call('begin_blob_write', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? response.getToken()
                : null;
            callback(err, result);
        });
    }
    writeBlobChunk(correlationId, token, chunk, callback) {
        let request = new messages.BlobTokenWithChunkRequest();
        request.setToken(token);
        request.setChunk(chunk);
        let timing = this.instrument(correlationId, 'blobs.write_blob_chunk');
        this.call('write_blob_chunk', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? response.getToken()
                : null;
            callback(err, result);
        });
    }
    endBlobWrite(correlationId, token, chunk, callback) {
        let request = new messages.BlobTokenWithChunkRequest();
        request.setToken(token);
        request.setChunk(chunk);
        let timing = this.instrument(correlationId, 'blobs.end_blob_write');
        this.call('end_blob_write', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                : null;
            callback(err, result);
        });
    }
    abortBlobWrite(correlationId, token, callback) {
        let request = new messages.BlobTokenRequest();
        request.setToken(token);
        let timing = this.instrument(correlationId, 'blobs.abort_blob_write');
        this.call('abort_blob_write', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            callback(err);
        });
    }
    beginBlobRead(correlationId, blobId, callback) {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
        let timing = this.instrument(correlationId, 'blobs.begin_blob_read');
        this.call('begin_blob_read', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                : null;
            callback(err, result);
        });
    }
    readBlobChunk(correlationId, blobId, skip, take, callback) {
        let request = new messages.BlobReadRequest();
        request.setBlobId(blobId);
        request.setSkip(skip);
        request.setTake(take);
        let timing = this.instrument(correlationId, 'blobs.read_blob_chunk');
        this.call('read_blob_chunk', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? response.getChunk()
                : null;
            callback(err, result);
        });
    }
    endBlobRead(correlationId, blobId, callback) {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
        let timing = this.instrument(correlationId, 'blobs.end_blob_read');
        this.call('end_blob_read', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            callback(err);
        });
    }
    updateBlobInfo(correlationId, blob, callback) {
        let blobObj = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.fromBlobInfo(blob);
        let request = new messages.BlobInfoObjectRequest();
        request.setBlob(blobObj);
        let timing = this.instrument(correlationId, 'blobs.update_blob_info');
        this.call('update_blob_info', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            let result = response
                ? BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                : null;
            callback(err, result);
        });
    }
    markBlobsCompleted(correlationId, blobIds, callback) {
        let request = new messages.BlobIdsRequest();
        request.setBlobIdsList(blobIds);
        let timing = this.instrument(correlationId, 'blobs.mark_blobs_completed');
        this.call('mark_blobs_completed', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            callback(err);
        });
    }
    deleteBlobById(correlationId, blobId, callback) {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
        let timing = this.instrument(correlationId, 'blobs.delete_blob_by_id');
        this.call('delete_blob_by_id', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            callback(err);
        });
    }
    deleteBlobsByIds(correlationId, blobIds, callback) {
        let request = new messages.BlobIdsRequest();
        request.setBlobIdsList(blobIds);
        let timing = this.instrument(correlationId, 'blobs.delete_blobs_by_ids');
        this.call('delete_blobs_by_ids', correlationId, request, (err, response) => {
            timing.endTiming();
            if (err == null && response.error != null)
                err = BlobsGrpcConverterV1_1.BlobsGrpcConverterV1.toError(response.error);
            callback(err);
        });
    }
}
exports.BlobsGrpcClientV1 = BlobsGrpcClientV1;
//# sourceMappingURL=BlobsGrpcClientV1.js.map