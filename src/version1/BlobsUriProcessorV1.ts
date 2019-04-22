let http = require('http');
let https = require('https');

import { BadRequestException } from 'pip-services3-commons-node';

import { BlobInfoV1 } from './BlobInfoV1';
import { IBlobsChunkyWriterV1 } from './IBlobsChunkyWriterV1';
import { BlobsStreamProcessorV1 } from './BlobsStreamProcessorV1';

export class BlobsUriProcessorV1 {

    public static getUriStream(correlationId: string, blob: BlobInfoV1,
        uri: string, callback?: (err: any, rs: any) => void): any {

        // Download file from url and pass it to createFile
        let transport = null;
                
        if (uri.substring(0, 7) == 'http://') 
            transport = http;
        else if (uri.substring(0, 8) == 'https://') 
            transport = https;
        else {
            callback(
                new BadRequestException(
                    correlationId,
                    'UNSUPPORTED_TRANSPORT',
                    'Unsupported transport in ' + uri
                )
                .withDetails('uri', uri),
                null
            );
            return;
        }

        transport.get(uri, (response) => {
            if (response.statusCode >= 400) {
                callback(
                    new BadRequestException(
                        correlationId,
                        'BAD_URI',
                        'Uri ' + uri + ' cannot be opened'
                    )
                    .withDetails('uri', uri),
                    null
                );
                return;
            }

            callback(null, response);
        });
    }

    public static createBlobFromUri(correlationId: string, blob: BlobInfoV1,
        writer: IBlobsChunkyWriterV1, uri: string, callback?: (err: any, blob: BlobInfoV1) => void): any {

        BlobsUriProcessorV1.getUriStream(correlationId, blob, uri, (err, rs: any) => {
            if (err) {
                callback(err, null);
                return;
            }

            blob.content_type = blob.content_type || rs.headers['content-type'];
            blob.size = blob.size || rs.headers['content-length'];

            let ws = BlobsStreamProcessorV1.createBlobFromStream(correlationId, blob, writer, callback);
            rs.pipe(ws);
        });
    }

}