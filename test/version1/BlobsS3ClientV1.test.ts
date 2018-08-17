import { ConfigParams } from 'pip-services-commons-node';

import { BlobsS3ClientV1 } from '../../src/version1/BlobsS3ClientV1';
import { BlobsClientFixtureV1 } from './BlobsClientFixtureV1';

suite('BlobsS3ClientV1', ()=> {
    let client: BlobsS3ClientV1;
    let fixture: BlobsClientFixtureV1;

    let S3_ARN = process.env["S3_ARN"] || "";
    let AWS_ACCESS_ID = process.env["AWS_ACCESS_ID"] || "";
    let AWS_ACCESS_KEY = process.env["AWS_ACCESS_KEY"] || "";

    if (S3_ARN == "" || AWS_ACCESS_ID == "" || AWS_ACCESS_KEY == "")
        return;

    let dbConfig = ConfigParams.fromTuples(
        "connection.arn", S3_ARN,
        "credential.access_id", AWS_ACCESS_ID,
        "credential.access_key", AWS_ACCESS_KEY
    );

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