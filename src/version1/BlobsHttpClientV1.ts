import { ConfigParams } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { CommandableHttpClient } from 'pip-services-net-node';

import { BlobInfoV1 } from './BlobInfoV1';
import { IBlobsClientV1 } from './IBlobsClientV1';
import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobsDataProcessorV1 } from './BlobsDataProcessorV1';
import { BlobsUriProcessorV1 } from './BlobsUriProcessorV1';
import { BlobsStreamProcessorV1 } from './BlobsStreamProcessorV1';

export class BlobsHttpClientV1 extends CommandableHttpClient
    implements IBlobsClientV1, IBlobsChunkyReaderV1, IBlobsChunkyWriterV1 {
    private _chunkSize: number = 10240;

    constructor(config?: any) {
        super('blobs');

        if (config != null)
            this.configure(ConfigParams.fromValue(config));
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._chunkSize = config.getAsLongWithDefault('options.chunk_size', this._chunkSize);
    }

    public getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {
        this.callCommand(
            'get_blobs_by_filter',
            correlationId,
            {
                filter: filter,
                paging: paging
            }, 
            callback
        );
    }

    public getBlobsByIds(correlationId: string, blobIds: string[],
        callback: (err: any, blobs: BlobInfoV1[]) => void): void {
        this.callCommand(
            'get_blobs_by_ids',
            correlationId,
            {
                blob_ids: blobIds
            }, 
            callback
        );
    }

    public getBlobById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        this.callCommand(
            'get_blob_by_id',
            correlationId,
            {
                blob_id: blobId
            }, 
            callback
        );
    }

    public createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        BlobsUriProcessorV1.createBlobFromUri(correlationId, blob, this, uri, callback);
    }

    public getBlobUriById(correlationId: string, blobId: string,
        callback: (err: any, uri: string) => void): void {
        this.callCommand(
            'get_blob_uri_by_id',
            correlationId,
            {
                blob_id: blobId
            }, 
            callback
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
        this.callCommand(
            'begin_blob_write',
            correlationId,
            {
                blob: blob
            }, 
            callback
        );
    }

    public writeBlobChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {
        this.callCommand(
            'write_blob_chunk',
            correlationId,
            {
                token: token,
                chunk: chunk
            }, 
            callback
        );
    }

    public endBlobWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        this.callCommand(
            'end_blob_write',
            correlationId,
            {
                token: token,
                chunk: chunk
            }, 
            callback
        );
    }

    public abortBlobWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        this.callCommand(
            'abort_blob_write',
            correlationId,
            {
                token: token
            }, 
            callback
        );
    }
    
    public beginBlobRead(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        this.callCommand(
            'begin_blob_read',
            correlationId,
            {
                blob_id: blobId
            }, 
            callback
        );
    }

    public readBlobChunk(correlationId: string, blobId: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {
        this.callCommand(
            'read_blob_chunk',
            correlationId,
            {
                blob_id: blobId,
                skip: skip,
                take: take
            }, 
            callback
        );
    }
    
    public endBlobRead(correlationId: string, blobId: string, 
        callback?: (err: any) => void): void {
        this.callCommand(
            'end_blob_read',
            correlationId,
            {
                blob_id: blobId
            }, 
            callback
        );
    }

    public updateBlobInfo(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, item: BlobInfoV1) => void): void {
        this.callCommand(
            'update_blob_info',
            correlationId,
            {
                blob: blob
            }, 
            callback
        );
    }

    public markBlobsCompleted(correlationId: string, blobIds: string[],
        callback: (err: any) => void): void {
        this.callCommand(
            'mark_blobs_completed',
            correlationId,
            {
                blobIds: blobIds
            }, 
            callback
        );
    }

    public deleteBlobById(correlationId: string, blobId: string,
        callback?: (err: any) => void): void {
        this.callCommand(
            'delete_blob_id',
            correlationId,
            {
                blob_id: blobId
            }, 
            callback
        );
    }

    public deleteBlobsByIds(correlationId: string, blobIds: string[],
        callback?: (err: any) => void): void {
        this.callCommand(
            'delete_blobs_by_ids',
            correlationId,
            {
                blob_ids: blobIds
            }, 
            callback
        );
    }

}
