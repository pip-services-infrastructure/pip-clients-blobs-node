import { BlobInfoV1 } from './BlobInfoV1';

export interface IBlobsChunkyWriterV1 {
    beginBlobWrite(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, token: string) => void): void;
    writeBlobChunk(correlationId: string, token: string, chunk: string,
        callback: (err: any, token: string) => void): void;
    endBlobWrite(correlationId: string, token: string, chunk: string,
        callback?: (err: any, blob: BlobInfoV1) => void): void;
    abortBlobWrite(correlationId: string, token: string,
        callback?: (err: any) => void): void;
}
