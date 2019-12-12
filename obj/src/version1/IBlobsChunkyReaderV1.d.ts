import { BlobInfoV1 } from './BlobInfoV1';
export interface IBlobsChunkyReaderV1 {
    beginBlobRead(correlationId: string, blobId: string, callback: (err: any, blob: BlobInfoV1) => void): void;
    readBlobChunk(correlationId: string, blobId: string, skip: number, take: number, callback: (err: any, chunk: string) => void): void;
    endBlobRead(correlationId: string, blobId: string, callback?: (err: any) => void): void;
}
