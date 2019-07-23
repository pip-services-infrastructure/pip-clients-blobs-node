let _ = require('lodash');
let services = require('../../../src/protos/blobs_v1_grpc_pb');
let messages = require('../../../src/protos/blobs_v1_pb');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { GrpcClient } from 'pip-services3-grpc-node';

import { IBlobsClientV1 } from './IBlobsClientV1';
import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobsDataProcessorV1 } from './BlobsDataProcessorV1';
import { BlobsUriProcessorV1 } from './BlobsUriProcessorV1';
import { BlobsStreamProcessorV1 } from './BlobsStreamProcessorV1';
import { BlobInfoV1 } from './BlobInfoV1';
import { BlobsGrpcConverterV1 } from './BlobsGrpcConverterV1';

export class BlobsGrpcClientV1 extends GrpcClient
    implements IBlobsClientV1, IBlobsChunkyReaderV1, IBlobsChunkyWriterV1 {
    private _chunkSize: number = 10240;

    constructor(config?: any) {
        super(services.BlobsClient);

        if (config != null)
            this.configure(ConfigParams.fromValue(config));
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._chunkSize = config.getAsLongWithDefault('options.chunk_size', this._chunkSize);
    }

    public getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {
        let request = new messages.BlobInfoPageRequest();

        BlobsGrpcConverterV1.setMap(request.getFilterMap(), filter);
        request.setPaging(BlobsGrpcConverterV1.fromPagingParams(paging));

        let timing = this.instrument(correlationId, 'blobs.get_blobs_by_filter');

        this.call('get_blobs_by_filter',
            correlationId, 
            request,
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? BlobsGrpcConverterV1.toBlobInfoPage(response.getPage())
                    : null;

                callback(err, result);
            }
        );
    }

    public getBlobsByIds(correlationId: string, blobIds: string[],
        callback: (err: any, blobs: BlobInfoV1[]) => void): void {
        let request = new messages.BlobIdsRequest();
        request.setBlobIdsList(blobIds);

        let timing = this.instrument(correlationId, 'blobs.get_blobs_by_ids');

        this.call('get_blobs_by_ids',
            correlationId,
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? BlobsGrpcConverterV1.toBlobInfos(response.getBlobsList())
                    : null;

                callback(err, result);
            }
        );        
    }

    public getBlobById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);

        let timing = this.instrument(correlationId, 'blobs.get_blob_by_id');

        this.call('get_blob_by_id',
            correlationId,
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                    : null;

                callback(err, result);
            }
        );        
    }

    public createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        BlobsUriProcessorV1.createBlobFromUri(correlationId, blob, this, uri, callback);
    }

    public getBlobUriById(correlationId: string, blobId: string,
        callback: (err: any, uri: string) => void): void {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);

        let timing = this.instrument(correlationId, 'blobs.get_blob_uri_by_id');

        this.call('get_blob_uri_by_id',
            correlationId,
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? response.getUri()
                    : null;

                callback(err, result);
            }
        );        
    }

    public createBlobFromData(correlationId: string, blob: BlobInfoV1, buffer: any,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        BlobsDataProcessorV1.createBlobFromData(correlationId, blob, this, buffer, this._chunkSize, callback);
    }

    public getBlobDataById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1, buffer: any) => void): void {
        BlobsDataProcessorV1.getBlobDataById(correlationId, blobId, this, this._chunkSize, callback);
    }

    public createBlobFromStream(correlationId: string, blob: BlobInfoV1,
        callback?: (err: any, blob: BlobInfoV1) => void): any {
        return BlobsStreamProcessorV1.createBlobFromStream(correlationId, blob, this, callback);
    }

    public getBlobStreamById(correlationId: string, blobId: string,
        callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any {
        return BlobsStreamProcessorV1.getBlobStreamById(correlationId, blobId, this, this._chunkSize, callback);
    }

    public beginBlobWrite(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, token: string) => void): void {
        let blobObj = BlobsGrpcConverterV1.fromBlobInfo(blob);

        let request = new messages.BlobInfoObjectRequest();
        request.setBlob(blobObj);
    
        let timing = this.instrument(correlationId, 'blobs.begin_blob_write');

        this.call('begin_blob_write',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? response.getToken()
                    : null;

                callback(err, result);
            }
        );
    }

    public writeBlobChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {
        let request = new messages.BlobTokenWithChunkRequest();
        request.setToken(token);
        request.setChunk(chunk);
    
        let timing = this.instrument(correlationId, 'blobs.write_blob_chunk');

        this.call('write_blob_chunk',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? response.getToken()
                    : null;

                callback(err, result);
            }
        );
    }

    public endBlobWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        let request = new messages.BlobTokenWithChunkRequest();
        request.setToken(token);
        request.setChunk(chunk);
    
        let timing = this.instrument(correlationId, 'blobs.end_blob_write');

        this.call('end_blob_write',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                    : null;

                callback(err, result);
            }
        );
    }

    public abortBlobWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        let request = new messages.BlobTokenRequest();
        request.setToken(token);
    
        let timing = this.instrument(correlationId, 'blobs.abort_blob_write');

        this.call('abort_blob_write',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                callback(err);
            }
        );
    }
    
    public beginBlobRead(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
    
        let timing = this.instrument(correlationId, 'blobs.begin_blob_read');

        this.call('begin_blob_read',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                    : null;

                callback(err, result);
            }
        );
    }

    public readBlobChunk(correlationId: string, blobId: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {
        let request = new messages.BlobReadRequest();
        request.setBlobId(blobId);
        request.setSkip(skip);
        request.setTake(take);
    
        let timing = this.instrument(correlationId, 'blobs.read_blob_chunk');

        this.call('read_blob_chunk',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? response.getChunk()
                    : null;

                callback(err, result);
            }
        );
    }
    
    public endBlobRead(correlationId: string, blobId: string, 
        callback?: (err: any) => void): void {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
    
        let timing = this.instrument(correlationId, 'blobs.end_blob_read');

        this.call('end_blob_read',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                callback(err);
            }
        );
    }

    public updateBlobInfo(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, item: BlobInfoV1) => void): void {
        let blobObj = BlobsGrpcConverterV1.fromBlobInfo(blob);

        let request = new messages.BlobInfoObjectRequest();
        request.setBlob(blobObj);
    
        let timing = this.instrument(correlationId, 'blobs.update_blob_info');

        this.call('update_blob_info',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                let result = response 
                    ? BlobsGrpcConverterV1.toBlobInfo(response.getBlob())
                    : null;

                callback(err, result);
            }
        );
    }

    public markBlobsCompleted(correlationId: string, blobIds: string[],
        callback: (err: any) => void): void {
        let request = new messages.BlobIdsRequest();
        request.setBlobIdsList(blobIds);
    
        let timing = this.instrument(correlationId, 'blobs.mark_blobs_completed');

        this.call('mark_blobs_completed',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                callback(err);
            }
        );
    }

    public deleteBlobById(correlationId: string, blobId: string,
        callback?: (err: any) => void): void {
        let request = new messages.BlobIdRequest();
        request.setBlobId(blobId);
    
        let timing = this.instrument(correlationId, 'blobs.delete_blob_by_id');

        this.call('delete_blob_by_id',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                callback(err);
            }
        );
    }

    public deleteBlobsByIds(correlationId: string, blobIds: string[],
        callback?: (err: any) => void): void {
        let request = new messages.BlobIdsRequest();
        request.setBlobIdsList(blobIds);
    
        let timing = this.instrument(correlationId, 'blobs.delete_blobs_by_ids');

        this.call('delete_blobs_by_ids',
            correlationId, 
            request, 
            (err, response) => {
                timing.endTiming();

                if (err == null && response.error != null)
                    err = BlobsGrpcConverterV1.toError(response.error);

                callback(err);
            }
        );
    }
 
}
