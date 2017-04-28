import { YamlConfigReader } from 'pip-services-commons-node';
import { BlobsClientFixtureV1 } from './BlobsClientFixtureV1';
import { BlobsLambdaClientV1 } from '../../src/version1/BlobsLambdaClientV1';

suite('BlobsLambdaClient', ()=> {
    let config = YamlConfigReader.readConfig(null, './config/test_connections.yaml', null);
    let lambdaConfig = config.getSection('lambda');

    // Skip if connection is not configured
    if (lambdaConfig.getAsNullableString("connection.protocol") != "aws")
        return;

    let client: BlobsLambdaClientV1;
    let fixture: BlobsClientFixtureV1;

    setup((done) => {
        client = new BlobsLambdaClientV1();
        client.configure(lambdaConfig);

        fixture = new BlobsClientFixtureV1(client);

        client.open(null, done);
    });

    teardown((done) => {
        client.close(null, done);
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