let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;
let stream = require('stream');
let fs = require('fs');

import { IdGenerator, FilterParams } from 'pip-services3-commons-node';

import { BlobInfoV1 } from '../../src/version1/BlobInfoV1';
import { IBlobsClientV1 } from '../../src/version1/IBlobsClientV1';

export class BlobsClientFixtureV1 {
    private _client: IBlobsClientV1;
    
    constructor(client: IBlobsClientV1) {
        this._client = client;
    }
        
    public testReadWriteChunks(done) {
        let blobId = IdGenerator.nextLong();
        let token: string = null;
        let client: any = this._client;

        async.series([
        // Start writing blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'file-' + blobId + '.dat',  6, 'application/binary'
                );

                client.beginBlobWrite(
                    null, blob,
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Write blob
            (callback) => {
                let chunk = Buffer.from([1, 2, 3]).toString('base64');

                client.writeBlobChunk(
                    null, token, chunk, 
                    (err, tok) => {
                        assert.isNull(err);
                        token = tok;
                        callback();
                    }
                );
            },
        // Finish writing blob
            (callback) => {
                let chunk = Buffer.from([4, 5, 6]).toString('base64');

                client.endBlobWrite(
                    null, token, chunk,
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Start reading
            (callback) => {
                client.beginBlobRead(
                    null, blobId,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Read first chunk
            (callback) => {
                client.readBlobChunk(
                    null, blobId, 0, 3,
                    (err, chunk) => {
                        assert.isNull(err);

                        assert.isString(chunk);

                        let buffer = Buffer.from(chunk, 'base64');
                        assert.lengthOf(buffer, 3);
                        assert.equal(1, buffer[0]);
                        assert.equal(2, buffer[1]);
                        assert.equal(3, buffer[2]);

                        callback();
                    }
                );
            },
        // Get blobs
            (callback) => {
                this._client.getBlobsByFilter(
                    null,
                    FilterParams.fromTuples(
                        'group', 'test', 
                        'expired', true
                    ),
                    null, 
                    (err, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            },
        // Delete blob
            (callback) => {
                this._client.deleteBlobsByIds(
                    null, [blobId],
                    (err) => {
                        assert.isNull(err);
                        callback();
                    }
                );
            },
        // Try to get deleted blob
            (callback) => {
                this._client.getBlobById(
                    null, blobId, (err, blob) => {
                        assert.isNull(err);
                        assert.isNull(blob);
                        callback();
                    }
                )
            }
        ], done);
    }

    public testReadWriteData(done) {
        let blobId = IdGenerator.nextLong();
        let token: string = null;

        async.series([
        // Create blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', 'file-' + blobId + '.dat',  6, 'application/binary'
                );
                let data = Buffer.from([1, 2, 3, 4, 5, 6]);

                this._client.createBlobFromData(
                    null, blob, data,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal(6, blob.size);

                        callback();
                    }
                );
            },
        // Get blob info
            (callback) => {
                this._client.getBlobById(
                    null, blobId, (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal(6, blob.size);

                        callback();
                    }
                )
            },
        // Read blob
            (callback) => {
                this._client.getBlobDataById(
                    null, blobId,
                    (err, blob, data) => {
                        assert.isNull(err);

                        assert.equal(6, blob.size);
                        assert.lengthOf(data, 6);
                        assert.equal(1, data[0]);
                        assert.equal(2, data[1]);
                        assert.equal(3, data[2]);
                        assert.equal(4, data[3]);
                        assert.equal(5, data[4]);
                        assert.equal(6, data[5]);

                        callback();
                    }
                );
            }
        ], done);
    }

    public testReadWriteStream(done) {
        let blobId = IdGenerator.nextLong();
        let token: string = null;
        let sample: string = fs.readFileSync('./data/file.txt').toString();

        async.series([
        // Create blob
            (callback) => {
                let blob = new BlobInfoV1(
                    blobId, 'test', './data/file.txt'
                );
                let rs = fs.createReadStream('./data/file.txt');

                let ws = this._client.createBlobFromStream(
                    null, blob,
                    (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal('file.txt', blob.name);
                        assert.equal(sample.length, blob.size);

                        callback();
                    }
                );
                rs.pipe(ws);
            },
        // Get blob info
            (callback) => {
                this._client.getBlobById(
                    null, blobId, (err, blob) => {
                        assert.isNull(err);

                        assert.isObject(blob);
                        assert.equal('file.txt', blob.name);
                        assert.equal(sample.length, blob.size);

                        callback();
                    }
                )
            },
        // Read blob
            (callback) => {
                if (fs.existsSync('./data/file.tmp'))
                    fs.unlinkSync('./data/file.tmp');

                let ws = fs.createWriteStream(
                    './data/file.tmp',
                    {
                        flags: 'w',
                        autoClose: true
                    }
                );

                let rs = this._client.getBlobStreamById(
                    null, blobId,
                    (err, blob, rs) => {
                        // Wait until file cache is written
                        setTimeout(() => {
                            assert.isNull(err);

                            let sample1 = fs.readFileSync('./data/file.tmp').toString();
                            fs.unlinkSync('./data/file.tmp');
                            assert.equal(sample1, sample);

                            callback();
                        }, 100);
                    }
                );
                rs.pipe(ws);
            }
        ], done);
    }

    public testGetUriForMissingBlob(done) {
        this._client.getBlobUriById(null, '123', (err, uri) => {
            assert.isNull(err);
            done();
        });
    }


}
