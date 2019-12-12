"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let http = require('http');
let https = require('https');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const BlobsStreamProcessorV1_1 = require("./BlobsStreamProcessorV1");
class BlobsUriProcessorV1 {
    static getUriStream(correlationId, blob, uri, callback) {
        // Download file from url and pass it to createFile
        let transport = null;
        if (uri.substring(0, 7) == 'http://')
            transport = http;
        else if (uri.substring(0, 8) == 'https://')
            transport = https;
        else {
            callback(new pip_services3_commons_node_1.BadRequestException(correlationId, 'UNSUPPORTED_TRANSPORT', 'Unsupported transport in ' + uri)
                .withDetails('uri', uri), null);
            return;
        }
        transport.get(uri, (response) => {
            if (response.statusCode >= 400) {
                callback(new pip_services3_commons_node_1.BadRequestException(correlationId, 'BAD_URI', 'Uri ' + uri + ' cannot be opened')
                    .withDetails('uri', uri), null);
                return;
            }
            callback(null, response);
        });
    }
    static createBlobFromUri(correlationId, blob, writer, uri, callback) {
        BlobsUriProcessorV1.getUriStream(correlationId, blob, uri, (err, rs) => {
            if (err) {
                callback(err, null);
                return;
            }
            blob.content_type = blob.content_type || rs.headers['content-type'];
            blob.size = blob.size || rs.headers['content-length'];
            // convert blob.size to number
            blob.size = +blob.size;
            let ws = BlobsStreamProcessorV1_1.BlobsStreamProcessorV1.createBlobFromStream(correlationId, blob, writer, callback);
            rs.pipe(ws);
        });
    }
}
exports.BlobsUriProcessorV1 = BlobsUriProcessorV1;
//# sourceMappingURL=BlobsUriProcessorV1.js.map