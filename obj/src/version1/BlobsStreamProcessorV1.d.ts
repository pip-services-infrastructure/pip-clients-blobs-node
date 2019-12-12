import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobInfoV1 } from './BlobInfoV1';
export declare class BlobsStreamProcessorV1 {
    static createBlobFromStream(correlationId: string, blob: BlobInfoV1, writer: IBlobsChunkyWriterV1, callback?: (err: any, blob: BlobInfoV1) => void): any;
    static getBlobStreamById(correlationId: string, blobId: string, reader: IBlobsChunkyReaderV1, chunkSize: number, callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any;
}
