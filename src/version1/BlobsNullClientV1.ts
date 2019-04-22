let stream = require('stream');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { BlobInfoV1 } from './BlobInfoV1';
import { IBlobsClientV1 } from './IBlobsClientV1';
import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';

export class BlobsNullClientV1
    implements IBlobsClientV1, IBlobsChunkyReaderV1, IBlobsChunkyWriterV1 {
    constructor(config?: any) {}
        
    public getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {
        callback(null, new DataPage<BlobInfoV1>([], 0));
    }

    public getBlobsByIds(correlationId: string, blobIds: string[],
        callback: (err: any, blobs: BlobInfoV1[]) => void): void {
        callback(null, []);
    }

    public getBlobById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        callback(null, null);
    }

    public createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        if (callback) callback(null, null);
    }

    public getBlobUriById(correlationId: string, blobId: string,
        callback: (err: any, uri: string) => void): void {
        callback(null, null);
    }

    public createBlobFromData(correlationId: string, blob: BlobInfoV1, buffer: any,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        if (callback) callback(null, null);
    }

    public getBlobDataById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1, buffer: any) => void): void {
        callback(null, null, new Buffer(0));
    }

    public createBlobFromStream(correlationId: string, blob: BlobInfoV1,
        callback?: (err: any, blob: BlobInfoV1) => void): any {
        if (callback) {
            setTimeout(() => {
                callback(null, blob);
            }, 0);
        }
        return stream.Stream();
    }

    public getBlobStreamById(correlationId: string, blobId: string,
        callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any {
        let rs = stream.Readable();
        if (callback) {
            setTimeout(() => {
                rs.push(null);
                callback(null, null, rs);
            }, 0);
        }
        return rs;
    }

    public beginBlobWrite(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, token: string) => void): void {
        callback(null, null);
    }

    public writeBlobChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void {
        callback(null, token);
    }

    public endBlobWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void {
        callback(null, null);
    }

    public abortBlobWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void {
        callback(null);
    }
    
    public beginBlobRead(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {
        callback(null, null);
    }

    public readBlobChunk(correlationId: string, blobId: string, skip: number, take: number,
        callback: (err: any, chunk: string) => void): void {
        callback(null, null);
    }
    
    public endBlobRead(correlationId: string, blobId: string, 
        callback?: (err: any) => void): void {
        callback(null);
    }

    public updateBlobInfo(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, item: BlobInfoV1) => void): void {
        callback(null, blob);
    }

    public markBlobsCompleted(correlationId: string, blobIds: string[],
        callback: (err: any) => void): void {
        callback(null);
    }

    public deleteBlobById(correlationId: string, blobId: string,
        callback?: (err: any) => void): void {
        callback(null);
    }

    public deleteBlobsByIds(correlationId: string, blobIds: string[],
        callback?: (err: any) => void): void {
        callback(null);
    }

}
