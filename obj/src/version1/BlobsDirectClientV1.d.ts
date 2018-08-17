import { ConfigParams } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { DataPage } from 'pip-services-commons-node';
import { DirectClient } from 'pip-services-rpc-node';
import { BlobInfoV1 } from './BlobInfoV1';
import { IBlobsClientV1 } from './IBlobsClientV1';
import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
export declare class BlobsDirectClientV1 extends DirectClient<any> implements IBlobsClientV1, IBlobsChunkyReaderV1, IBlobsChunkyWriterV1 {
    private _chunkSize;
    constructor(config?: any);
    configure(config: ConfigParams): void;
    getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<BlobInfoV1>) => void): void;
    getBlobsByIds(correlationId: string, blobIds: string[], callback: (err: any, blobs: BlobInfoV1[]) => void): void;
    getBlobById(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string, callback?: (err: any, blob: BlobInfoV1) => void): void;
    getBlobUriById(correlationId: string, blobId: string, callback: (err: any, uri: string) => void): void;
    createBlobFromData(correlationId: string, blob: BlobInfoV1, buffer: any, callback?: (err: any, blob: BlobInfoV1) => void): void;
    getBlobDataById(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1, buffer: any) => void): void;
    createBlobFromStream(correlationId: string, blob: BlobInfoV1, callback?: (err: any, blob: BlobInfoV1) => void): any;
    getBlobStreamById(correlationId: string, blobId: string, callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any;
    beginBlobWrite(correlationId: string, blob: BlobInfoV1, callback: (err: any, token: string) => void): void;
    writeBlobChunk(correlationId: string, token: string, chunk: string, callback: (err: any, token: string) => void): void;
    endBlobWrite(correlationId: string, token: string, chunk: string, callback?: (err: any, blob: BlobInfoV1) => void): void;
    abortBlobWrite(correlationId: string, token: string, callback?: (err: any) => void): void;
    beginBlobRead(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    readBlobChunk(correlationId: string, blobId: string, skip: number, take: number, callback: (err: any, chunk: string) => void): void;
    endBlobRead(correlationId: string, blobId: string, callback?: (err: any) => void): void;
    updateBlobInfo(correlationId: string, blob: BlobInfoV1, callback: (err: any, item: BlobInfoV1) => void): void;
    markBlobsCompleted(correlationId: string, blobIds: string[], callback: (err: any) => void): void;
    deleteBlobById(correlationId: string, blobId: string, callback?: (err: any) => void): void;
    deleteBlobsByIds(correlationId: string, blobIds: string[], callback?: (err: any) => void): void;
}
