import { ConfigParams } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { Descriptor } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams} from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { DirectClient } from 'pip-services-rpc-node';

import { BlobInfoV1 } from './BlobInfoV1';
import { IBlobsClientV1 } from './IBlobsClientV1';
import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobsUriProcessorV1 } from './BlobsUriProcessorV1';
import { BlobsDataProcessorV1 } from './BlobsDataProcessorV1';
import { BlobsStreamProcessorV1 } from './BlobsStreamProcessorV1';
//import { IBlobsController } from 'pip-services-blobs-node';

export class BlobsDirectClientV1 extends DirectClient<any>
    implements IBlobsClientV1, IBlobsChunkyReaderV1, IBlobsChunkyWriterV1 {
    private _chunkSize: number = 10240;
            
    public constructor(config?: any) {
        super();
        this._dependencyResolver.put('controller', new Descriptor("pip-services-blobs", "controller", "*", "*", "*"))

        if (config != null)
            this.configure(ConfigParams.fromValue(config));
    }

    public configure(config: ConfigParams): void {
        super.configure(config);
        this._chunkSize = config.getAsLongWithDefault('options.chunk_size', this._chunkSize);
    }

    public getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {
        this._controller.getBlobsByFilter(correlationId, filter, paging, callback);
    }

    public getBlobsByIds(correlationId: string, blobIds: string[],
        callback: (err: any, blobs: BlobInfoV1[]) => void): void {
        this._controller.getBlobsByIds(correlationId, blobIds, callback);
    }

    public getBlobById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        this._controller.getBlobById(correlationId, blobId, callback);
    }

    public createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        BlobsUriProcessorV1.createBlobFromUri(correlationId, blob, this, uri, callback);
    }

    public getBlobUriById(correlationId: string, blobId: string,
        callback: (err: any, uri: string) => void): void {
        this._controller.getBlobUriById(correlationId, blobId, callback);
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
        this._controller.beginBlobWrite(correlationId, blob, callback);
    }

    public writeBlobChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {
        this._controller.writeBlobChunk(correlationId, token, chunk, callback);
    }

    public endBlobWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        this._controller.endBlobWrite(correlationId, token, chunk, callback);
    }

    public abortBlobWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        this._controller.abortBlobWrite(correlationId, token, callback);
    }
    
    public beginBlobRead(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        this._controller.beginBlobRead(correlationId, blobId, callback);
    }

    public readBlobChunk(correlationId: string, blobId: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {
        this._controller.readBlobChunk(correlationId, blobId, skip, take, callback);
    }
    
    public endBlobRead(correlationId: string, blobId: string, 
        callback?: (err: any) => void): void {
        this._controller.endBlobRead(correlationId, blobId, callback);
    }

    public updateBlobInfo(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, item: BlobInfoV1) => void): void {
        this._controller.updateBlobInfo(correlationId, blob, callback);
    }

    public markBlobsCompleted(correlationId: string, blobIds: string[],
        callback: (err: any) => void): void {
        this._controller.markBlobsCompleted(correlationId, blobIds, callback);
    }

    public deleteBlobById(correlationId: string, blobId: string,
        callback?: (err: any) => void): void {
        this._controller.deleteBlobById(correlationId, blobId, callback);
    }

    public deleteBlobsByIds(correlationId: string, blobIds: string[],
        callback?: (err: any) => void): void {
        this._controller.deleteBlobsByIds(correlationId, blobIds, callback);
    }

}