import { IBlobsChunkyReaderV1 } from './IBlobsChunkyReaderV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobInfoV1 } from './BlobInfoV1';
export declare class BlobsDataProcessorV1 {
    static createBlobFromData(correlationId: string, blob: BlobInfoV1, writer: IBlobsChunkyWriterV1, data: any, chunkSize: number, callback?: (err: any, blob: BlobInfoV1) => void): void;
    static getBlobDataById(correlationId: string, blobId: string, reader: IBlobsChunkyReaderV1, chunkSize: number, callback?: (err: any, blob: BlobInfoV1, buffer: any) => void): any;
}
