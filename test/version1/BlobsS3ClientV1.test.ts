import { YamlConfigReader } from 'pip-services-commons-node';

import { BlobsS3ClientV1 } from '../../src/version1/BlobsS3ClientV1';
import { BlobsClientFixtureV1 } from './BlobsClientFixtureV1';

suite('BlobsS3ClientV1', ()=> {
    let client: BlobsS3ClientV1;
    let fixture: BlobsClientFixtureV1;

    let config = YamlConfigReader.readConfig(null, './config/test_connections.yaml', null);
    let dbConfig = config.getSection('s3');
    if (dbConfig.length() == 0)
        return;

    setup((done) => {
        client = new BlobsS3ClientV1();
        client.configure(dbConfig);

        fixture = new BlobsClientFixtureV1(client);

        client.open(null, (err: any) => {
            client.clear(null, (err) => {
                done(err);
            });
        });
    });
    
    teardown((done) => {
        client.close(null, done);
    });

    test('Read / write data', (done) => {
        fixture.testReadWriteData(done);
    });

    test('Read / write stream', (done) => {
        fixture.testReadWriteStream(done);
    });

});