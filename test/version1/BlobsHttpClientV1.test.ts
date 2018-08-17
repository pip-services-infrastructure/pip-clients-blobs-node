let assert = require('chai').assert;
let async = require('async');

import { Descriptor } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { References } from 'pip-services-commons-node';
import { ConsoleLogger } from 'pip-services-components-node';

import { BlobsMemoryPersistence } from 'pip-services-blobs-node';
import { BlobsController } from 'pip-services-blobs-node';
import { BlobsHttpServiceV1 } from 'pip-services-blobs-node';
import { IBlobsClientV1 } from '../../src/version1/IBlobsClientV1';
import { BlobsHttpClientV1 } from '../../src/version1/BlobsHttpClientV1';
import { BlobsClientFixtureV1 } from './BlobsClientFixtureV1';

var httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

suite('BlobsHttpClientV1', ()=> {
    let service: BlobsHttpServiceV1;
    let client: BlobsHttpClientV1;
    let fixture: BlobsClientFixtureV1;

    suiteSetup((done) => {
        let logger = new ConsoleLogger();
        let persistence = new BlobsMemoryPersistence();
        let controller = new BlobsController();

        service = new BlobsHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services', 'logger', 'console', 'default', '1.0'), logger,
            new Descriptor('pip-services-blobs', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-blobs', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-blobs', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        client = new BlobsHttpClientV1();
        client.setReferences(references);
        client.configure(httpConfig);

        fixture = new BlobsClientFixtureV1(client);

        service.open(null, (err) => {
            client.open(null, done);
        });
    });
    
    suiteTeardown((done) => {
        client.close(null);
        service.close(null, done);
    });

    test('Read / write chunks', (done) => {
        fixture.testReadWriteChunks(done);
    });

    test('Read / write data', (done) => {
        fixture.testReadWriteData(done);
    });

    test('Read / write stream', (done) => {
        fixture.testReadWriteStream(done);
    });

});
