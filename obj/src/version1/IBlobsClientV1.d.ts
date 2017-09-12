import { DataPage } from 'pip-services-commons-node';
import { FilterParams } from 'pip-services-commons-node';
import { PagingParams } from 'pip-services-commons-node';
import { BlobInfoV1 } from './BlobInfoV1';
export interface IBlobsClientV1 {
    getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<BlobInfoV1>) => void): void;
    getBlobsByIds(correlationId: string, blobIds: string[], callback: (err: any, blobs: BlobInfoV1[]) => void): void;
    getBlobById(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string, callback?: (err: any, blob: BlobInfoV1) => void): any;
    getBlobUriById(correlationId: string, blobId: string, callback: (err: any, uri: string) => void): void;
    createBlobFromData(correlationId: string, blob: BlobInfoV1, buffer: any, callback?: (err: any, blob: BlobInfoV1) => void): void;
    getBlobDataById(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1, buffer: any) => void): void;
    createBlobFromStream(correlationId: string, blob: BlobInfoV1, callback?: (err: any, blob: BlobInfoV1) => void): any;
    getBlobStreamById(correlationId: string, blobId: string, callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any;
    updateBlobInfo(correlationId: string, blob: BlobInfoV1, callback: (err: any, item: BlobInfoV1) => void): void;
    markBlobsCompleted(correlationId: string, blobIds: string[], callback: (err: any) => void): void;
    deleteBlobById(correlationId: string, blobId: string, callback?: (err: any) => void): void;
    deleteBlobsByIds(correlationId: string, blobIds: string[], callback?: (err: any) => void): void;
}
