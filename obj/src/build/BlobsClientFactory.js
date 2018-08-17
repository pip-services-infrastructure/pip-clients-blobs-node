"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_components_node_1 = require("pip-services-components-node");
const BlobsNullClientV1_1 = require("../version1/BlobsNullClientV1");
const BlobsDirectClientV1_1 = require("../version1/BlobsDirectClientV1");
const BlobsHttpClientV1_1 = require("../version1/BlobsHttpClientV1");
const BlobsSenecaClientV1_1 = require("../version1/BlobsSenecaClientV1");
const BlobsS3ClientV1_1 = require("../version1/BlobsS3ClientV1");
class BlobsClientFactory extends pip_services_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(BlobsClientFactory.NullClientV1Descriptor, BlobsNullClientV1_1.BlobsNullClientV1);
        this.registerAsType(BlobsClientFactory.DirectClientV1Descriptor, BlobsDirectClientV1_1.BlobsDirectClientV1);
        this.registerAsType(BlobsClientFactory.HttpClientV1Descriptor, BlobsHttpClientV1_1.BlobsHttpClientV1);
        this.registerAsType(BlobsClientFactory.SenecaClientV1Descriptor, BlobsSenecaClientV1_1.BlobsSenecaClientV1);
        this.registerAsType(BlobsClientFactory.S3ClientV1Descriptor, BlobsS3ClientV1_1.BlobsS3ClientV1);
    }
}
BlobsClientFactory.Descriptor = new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'factory', 'default', 'default', '1.0');
BlobsClientFactory.NullClientV1Descriptor = new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'client', 'null', 'default', '1.0');
BlobsClientFactory.DirectClientV1Descriptor = new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'client', 'direct', 'default', '1.0');
BlobsClientFactory.HttpClientV1Descriptor = new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'client', 'http', 'default', '1.0');
BlobsClientFactory.SenecaClientV1Descriptor = new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'client', 'seneca', 'default', '1.0');
BlobsClientFactory.S3ClientV1Descriptor = new pip_services_commons_node_1.Descriptor('pip-services-blobs', 'client', 's3', 'default', '1.0');
exports.BlobsClientFactory = BlobsClientFactory;
//# sourceMappingURL=BlobsClientFactory.js.map