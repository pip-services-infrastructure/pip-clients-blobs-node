let _ = require('lodash');
let async = require('async');
let fs = require('fs');
let stream = require('stream');
let querystring = require('querystring');

import { IOpenable } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';
import { CompositeCounters } from 'pip-services3-components-node';
import { Timing } from 'pip-services3-components-node';
import { IdGenerator } from 'pip-services3-commons-node';
import { NotFoundException } from 'pip-services3-commons-node';
import { BadRequestException } from 'pip-services3-commons-node';
import { InvocationException } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { StringConverter } from 'pip-services3-commons-node';
import { IntegerConverter } from 'pip-services3-commons-node';
import { BooleanConverter } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { AwsConnectionResolver } from 'pip-services3-aws-node';
import { AwsConnectionParams } from 'pip-services3-aws-node';

import { BlobInfoV1 } from './BlobInfoV1';
import { IBlobsClientV1 } from './IBlobsClientV1';
import { BlobsUriProcessorV1 } from './BlobsUriProcessorV1';

export class BlobsS3ClientV1
    implements IOpenable, IConfigurable, IReferenceable, IBlobsClientV1 {

    protected _s3: any;
    protected _opened: boolean = false;
    protected _connection: AwsConnectionParams;
    protected _bucket: string;
 
    protected _connectTimeout: number = 30000;
    protected _minChunkSize: number = 5 * 1024 * 1024;
    protected _maxBlobSize: number = 100 * 1024;
    protected _reducedRedundancy: boolean = true;
    protected _maxPageSize: number = 100;

    protected _connectionResolver: AwsConnectionResolver = new AwsConnectionResolver();
    protected _logger: CompositeLogger = new CompositeLogger();
    protected _counters: CompositeCounters = new CompositeCounters();

    public constructor(config?: any) {
        if (config != null)
            this.configure(ConfigParams.fromValue(config));
    }

    public configure(config: ConfigParams): void {
        this._connectionResolver.configure(config);

        this._minChunkSize = config.getAsLongWithDefault('options.min_chunk_size', this._minChunkSize);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._reducedRedundancy = config.getAsBooleanWithDefault('options.reduced_redundancy', this._reducedRedundancy);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
        this._connectTimeout = config.getAsIntegerWithDefault("options.connect_timeout", this._connectTimeout);
    }

    public setReferences(references: IReferences): void {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
    }

    public isOpen(): boolean {
        return this._opened;
    }

    public open(correlationId: string, callback: (err?: any) => void): void {
        if (this.isOpen()) {
            if (callback) callback();
            return;
        }

        async.series([
            (callback) => {
                this._connectionResolver.resolve(correlationId, (err, connection) => {
                    this._connection = connection;
                    callback(err);
                });
            },
            (callback) => {
                let aws = require('aws-sdk');
                
                aws.config.update({
                    accessKeyId: this._connection.getAccessId(),
                    secretAccessKey: this._connection.getAccessKey(),
                    region: this._connection.getRegion()
                });

                aws.config.httpOptions = {
                    timeout: this._connectTimeout
                };

                this._s3 = new aws.S3();
                this._bucket = this._connection.getResource();

                this._opened = true;
                this._logger.debug(correlationId, "S3 persistence connected to %s", this._connection.getArn());

                callback();
            }
        ], callback);
    }

    public close(correlationId: string, callback?: (err?: any) => void): void {
        this._opened = false;
        if (callback) callback(null);
    }

    private normalizeName(name: string): string {
        if (name == null) return null;

        name = name.replace('\\', '/');
        let pos = name.lastIndexOf('/');
        if (pos >= 0)
            name = name.substring(pos + 1);

        return name;
    }

    private dataToInfo(id: string, data: any): BlobInfoV1 {
        if (data == null) return null;

        let metadata = data.Metadata;
        return <BlobInfoV1>{
            id: id || data.Key,
            group: this.decodeString(metadata.group),
            name: this.decodeString(metadata.name),
            size: data.ContentLength,
            content_type: data.ContentType,
            create_time: data.LastModified,
            expire_time: data.Expires,
            completed: BooleanConverter.toBoolean(metadata.completed)
        };
    }

    private encodeString(value: string): string {
        if (value == null) return null;
        return querystring.escape(value);
    }

    private decodeString(value: string): string {
        if (value == null) return null;
        return querystring.unescape(value);
    }

    private matchString(value: string, search: string): boolean {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }

    private matchSearch(item: BlobInfoV1, search: string): boolean {
        search = search.toLowerCase();
        if (this.matchString(item.name, search))
            return true;
        if (this.matchString(item.group, search))
            return true;
        return false;
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();
        let search = this.encodeString(filter.getAsNullableString('search'));
        let id = filter.getAsNullableString('id');
        let name = this.encodeString(filter.getAsNullableString('name'));
        let group = this.encodeString(filter.getAsNullableString('group'));
        let completed = filter.getAsNullableBoolean('completed');
        let expired = filter.getAsNullableBoolean('expired');
        let fromCreateTime = filter.getAsNullableDateTime('from_create_time');
        let toCreateTime = filter.getAsNullableDateTime('to_create_time');

        let now = new Date();

        return (item: BlobInfoV1) => {
            if (search != null && !this.matchSearch(item, search))
                return false;
            if (id != null && id != item.id)
                return false;
            if (name != null && name != item.name)
                return false;
            if (group != null && group != item.group)
                return false;
            if (completed != null && completed != item.completed)
                return false;
            if (expired != null && expired == true && item.expire_time > now)
                return false;
            if (expired != null && expired == false && item.expire_time <= now)
                return false;
            if (fromCreateTime != null && item.create_time >= fromCreateTime)
                return false;
            if (toCreateTime != null && item.create_time < toCreateTime)
                return false;
            return true;
        };
    }

    public getBlobsByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<BlobInfoV1>) => void): void {

        let filterCurl = this.composeFilter(filter);

        paging = paging || new PagingParams();
        let skip = paging.getSkip(0);
        let take = paging.getTake(this._maxPageSize);

        let result: BlobInfoV1[] = [];
        let token = null;
        let completed = false;

        async.whilst(
            () => completed == false && result.length < take,
            (callback) => {
                let params = {
                    Bucket: this._bucket,
                    ContinuationToken: token,
                    MaxKeys: this._maxPageSize
                };

                this._s3.listObjectsV2(
                    params,
                    (err, data) => {
                        if (err) {
                            callback(err);
                            return;
                        }

                        // Set token to continue
                        token = data.ContinuationToken;
                        completed = token == null;

                        // If nothing is returned then exit
                        if (data.Contents == null || data.Contents.length == 0) {
                            completed = true;
                            callback();
                            return;
                        }

                        // Extract ids and retrieve objects
                        let blobIds = _.map(data.Contents, c => c.Key);
                        this.getBlobsByIds(correlationId, blobIds, (err, blobs) => {
                            if (err) {
                                callback(err);
                                return;
                            }

                            // Filter items using provided criteria
                            blobs = _.filter(blobs, filterCurl);

                            // Continue if skipped completely
                            if (blobs.length <= skip) {
                                skip -= blobs.length;
                                callback();
                                return;
                            }

                            // Truncate by skip number
                            if (skip > 0 && blobs.length >= skip) {
                                skip = 0;
                                blobs = blobs.splice(0, skip);
                            }

                            // Include items until page is over
                            for (let blob of blobs) {
                                if (take > 0) {
                                    result.push(blob);
                                    take--;
                                }
                            }

                            callback();
                        });
                    } 
                );    
            },
            (err) => {
                let page = err == null ? new DataPage<BlobInfoV1>(result, null) : null;
                callback(err, page);
            }
        )
    }

    public getBlobsByIds(correlationId: string, blobIds: string[],
        callback: (err: any, blobs: BlobInfoV1[]) => void): void {
        let blobs: BlobInfoV1[] = [];
        async.each(
            blobIds, 
            (blobId, callback) => {
                this.getBlobById(correlationId, blobId, (err, blob) => {
                    if (blob) blobs.push(blob);
                    callback(err);
                });
            }, 
            (err) => {
                callback(err, err == null ? blobs: null);
            }
        );
    }

    public getBlobById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1) => void): void {

        let params = {
            Bucket: this._bucket,
            Key: blobId
        };

         this._s3.headObject(
             params,
             (err, data) => {
                if (err && err.code == "NotFound") err = null;

                if (err == null && data != null) {
                    let item = this.dataToInfo(blobId, data);
                    callback(null, item);
                } else callback(err, null);
             } 
        );    
    }

    public createBlobFromUri(correlationId: string, blob: BlobInfoV1, uri: string,
        callback?: (err: any, blob: BlobInfoV1) => void): any {

        blob.id = blob.id || IdGenerator.nextLong();
        blob.name = this.normalizeName(blob.name);

        BlobsUriProcessorV1.getUriStream(correlationId, blob, uri, (err, rs: any) => {
            if (err) {
                callback(err, null);
                return;
            }

            blob.content_type = blob.content_type || rs.headers['content-type'];
            blob.size = blob.size || rs.headers['content-length'];

            let ws = this.createBlobFromStream(correlationId, blob, callback);
            rs.pipe(ws);
        });
    }

    public getBlobUriById(correlationId: string, blobId: string,
        callback: (err: any, uri: string) => void): void {
        let params = {
            Bucket: this._bucket,
            Key: blobId
        };

        this._s3.getSignedUrl('getObject', params, callback);
    }

    public createBlobFromData(correlationId: string, blob: BlobInfoV1, buffer: any,
        callback?: (err: any, blob: BlobInfoV1) => void): void {

        blob.id = blob.id || IdGenerator.nextLong();
        blob.group = this.encodeString(blob.group);
        blob.name = this.normalizeName(blob.name);
        blob.name = this.encodeString(blob.name);
        let filename = blob.name || (blob.id + '.dat');

        let params = {
            Bucket: this._bucket,
            Key: blob.id,
            ACL: 'public-read',
            ContentDisposition: 'inline; filename=' + filename,
            ContentType: blob.content_type,
            StorageClass: this._reducedRedundancy ? 'REDUCED_REDUNDANCY' : 'STANDARD',
            Expires: DateTimeConverter.toNullableDateTime(blob.expire_time),
            Metadata: {
                name: blob.name || blob.id,
                group: blob.group || "",
                completed: StringConverter.toString(blob.completed)
            },
            Body: buffer
        };

        this._s3.upload(params, (err, data) => {
            if (callback) {
                if (err) callback(err, null)
                else this.getBlobById(correlationId, blob.id, callback);
            }
        });
    }

    public getBlobDataById(correlationId: string, blobId: string,
        callback: (err: any, blob: BlobInfoV1, buffer: any) => void): void {

        let params = {
            Bucket: this._bucket,
            Key: blobId
        };

        this._s3.getObject(params, (err, data) => {
            let blob = this.dataToInfo(blobId, data);
            let buffer = data != null ? data.Body : null;
            callback(err, blob, buffer);
        });
    }

    public createBlobFromStream(correlationId: string, blob: BlobInfoV1,
        callback?: (err: any, blob: BlobInfoV1) => void): any {

        blob.id = blob.id || IdGenerator.nextLong();
        blob.group = this.encodeString(blob.group);
        blob.name = this.normalizeName(blob.name);
        blob.name = this.encodeString(blob.name);
        let filename = blob.name || (blob.id + '.dat');

        let ws = stream.PassThrough();

        let params = {
            Bucket: this._bucket,
            Key: blob.id,
            ACL: 'public-read',
            ContentDisposition: 'inline; filename=' + filename,
            ContentType: blob.content_type,
            StorageClass: this._reducedRedundancy ? 'REDUCED_REDUNDANCY' : 'STANDARD',
            Expires: DateTimeConverter.toNullableDateTime(blob.expire_time),
            Metadata: {
                name: blob.name || blob.id,
                group: blob.group || "",
                completed: StringConverter.toString(blob.completed)
            },
            Body: ws
        };

        this._s3.upload(params, (err, data) => {
            if (callback) {
                if (err) callback(err, null)
                else this.getBlobById(correlationId, blob.id, callback);
            }
        });

        return ws;
    }

    public getBlobStreamById(correlationId: string, blobId: string,
        callback?: (err: any, blob: BlobInfoV1, stream: any) => void): any {

        let params = {
            Bucket: this._bucket,
            Key: blobId
        };
        let completed = false;

        let rs = this._s3.getObject(params, (err, data) => {
            // Avoid double exit which may happen on errors
            if (completed) return;
            completed = true;
            let blob = this.dataToInfo(blobId, data);
            callback(err, blob, rs);
        }).createReadStream();

        rs.on('error', (err) => {
            // Hack: ignore error "read after end""
            if (!completed)
                this._logger.error(correlationId, err, 'Failed to read blob ' + blobId);
        });

        return rs;
    }

    public updateBlobInfo(correlationId: string, blob: BlobInfoV1,
        callback: (err: any, blob: BlobInfoV1) => void): void {

        blob.group = this.encodeString(blob.group);
        blob.name = this.normalizeName(blob.name);
        blob.name = this.encodeString(blob.name);
        let filename = blob.name || (blob.id + '.dat');

        let params = {
            Bucket: this._bucket,
            Key: blob.id,
            CopySource: this._bucket + '/' + blob.id,
            ACL: 'public-read',
            ContentDisposition: 'inline; filename=' + filename,
            ContentType: blob.content_type,
            StorageClass: this._reducedRedundancy ? 'REDUCED_REDUNDANCY' : 'STANDARD',
            Expires: DateTimeConverter.toNullableDateTime(blob.expire_time),
            Metadata: {
                name: blob.name,
                group: blob.group,
                completed: StringConverter.toString(blob.completed)
            }
        };

         this._s3.copyObject(
             params,
             (err, data) => {
                 blob = err == null ? blob : null;
                 callback(err, blob);
             } 
        );
    }

    public markBlobsCompleted(correlationId: string, ids: string[],
        callback: (err: any) => void): void {
        async.each(ids, (id, callback) => {
            this.getBlobById(correlationId, id, (err, item) => {
                if (err != null || item == null || item.completed) {
                    callback(err, item);
                } else {
                    item.completed = true;
                    this.updateBlobInfo(correlationId, item, callback);
                }
            });
        }, callback);
    }


    public deleteBlobById(correlationId: string, blobId: string,
        callback?: (err: any) => void): void {
        let params = {
            Bucket: this._bucket,
            Key: blobId
        };

        this._s3.deleteObject(params, callback);
    }

    public deleteBlobsByIds(correlationId: string, blobIds: string[],
        callback?: (err: any) => void): void {
    
        let params = {
            Bucket: this._bucket,
            Delete: {
                Objects: []
            }
        };

        _.each(blobIds, (blobId) => {
            params.Delete.Objects.push({ Key: blobId });
        })

        this._s3.deleteObjects(params, callback);
    }

    public clear(correlationId: string, callback?: (err: any) => void): void {
        let params = {
            Bucket: this._bucket,
        };

         this._s3.listObjects(
             params,
             (err, data) => {
                if (err != null || data.Contents.length == 0) {
                    if (callback) callback(err);
                    return;
                }

                let params = {
                    Bucket: this._bucket,
                    Delete: {
                        Objects: []
                    }
                };

                _.each(data.Contents, (c) => {
                    params.Delete.Objects.push({ Key: c.Key })
                })

                this._s3.deleteObjects(params, callback);
             } 
        );    

    }

}