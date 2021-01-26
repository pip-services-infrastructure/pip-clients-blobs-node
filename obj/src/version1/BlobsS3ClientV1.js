"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlobsS3ClientV1 = void 0;
let _ = require('lodash');
let async = require('async');
let fs = require('fs');
let stream = require('stream');
let querystring = require('querystring');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_components_node_2 = require("pip-services3-components-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const pip_services3_commons_node_6 = require("pip-services3-commons-node");
const pip_services3_commons_node_7 = require("pip-services3-commons-node");
const pip_services3_commons_node_8 = require("pip-services3-commons-node");
const pip_services3_aws_node_1 = require("pip-services3-aws-node");
const BlobsUriProcessorV1_1 = require("./BlobsUriProcessorV1");
class BlobsS3ClientV1 {
    constructor(config) {
        this._opened = false;
        this._connectTimeout = 30000;
        this._minChunkSize = 5 * 1024 * 1024;
        this._maxBlobSize = 100 * 1024;
        this._reducedRedundancy = true;
        this._maxPageSize = 100;
        this._connectionResolver = new pip_services3_aws_node_1.AwsConnectionResolver();
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        this._counters = new pip_services3_components_node_2.CompositeCounters();
        if (config != null)
            this.configure(pip_services3_commons_node_1.ConfigParams.fromValue(config));
    }
    configure(config) {
        this._connectionResolver.configure(config);
        this._minChunkSize = config.getAsLongWithDefault('options.min_chunk_size', this._minChunkSize);
        this._maxBlobSize = config.getAsLongWithDefault('options.max_blob_size', this._maxBlobSize);
        this._reducedRedundancy = config.getAsBooleanWithDefault('options.reduced_redundancy', this._reducedRedundancy);
        this._maxPageSize = config.getAsIntegerWithDefault("options.max_page_size", this._maxPageSize);
        this._connectTimeout = config.getAsIntegerWithDefault("options.connect_timeout", this._connectTimeout);
    }
    setReferences(references) {
        this._logger.setReferences(references);
        this._counters.setReferences(references);
        this._connectionResolver.setReferences(references);
    }
    isOpen() {
        return this._opened;
    }
    open(correlationId, callback) {
        if (this.isOpen()) {
            if (callback)
                callback();
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
    close(correlationId, callback) {
        this._opened = false;
        if (callback)
            callback(null);
    }
    normalizeName(name) {
        if (name == null)
            return null;
        name = name.replace('\\', '/');
        let pos = name.lastIndexOf('/');
        if (pos >= 0)
            name = name.substring(pos + 1);
        return name;
    }
    dataToInfo(id, data) {
        if (data == null)
            return null;
        let metadata = data.Metadata;
        return {
            id: id || data.Key,
            group: this.decodeString(metadata.group),
            name: this.decodeString(metadata.name),
            size: data.ContentLength,
            content_type: data.ContentType,
            create_time: data.LastModified,
            expire_time: data.Expires,
            completed: pip_services3_commons_node_4.BooleanConverter.toBoolean(metadata.completed)
        };
    }
    encodeString(value) {
        if (value == null)
            return null;
        return querystring.escape(value);
    }
    decodeString(value) {
        if (value == null)
            return null;
        return querystring.unescape(value);
    }
    matchString(value, search) {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }
    matchSearch(item, search) {
        search = search.toLowerCase();
        if (this.matchString(item.name, search))
            return true;
        if (this.matchString(item.group, search))
            return true;
        return false;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_6.FilterParams();
        let search = this.encodeString(filter.getAsNullableString('search'));
        let id = filter.getAsNullableString('id');
        let name = this.encodeString(filter.getAsNullableString('name'));
        let group = this.encodeString(filter.getAsNullableString('group'));
        let completed = filter.getAsNullableBoolean('completed');
        let expired = filter.getAsNullableBoolean('expired');
        let fromCreateTime = filter.getAsNullableDateTime('from_create_time');
        let toCreateTime = filter.getAsNullableDateTime('to_create_time');
        let now = new Date();
        return (item) => {
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
    getBlobsByFilter(correlationId, filter, paging, callback) {
        let filterCurl = this.composeFilter(filter);
        paging = paging || new pip_services3_commons_node_7.PagingParams();
        let skip = paging.getSkip(0);
        let take = paging.getTake(this._maxPageSize);
        let result = [];
        let token = null;
        let completed = false;
        async.whilst(() => completed == false && result.length < take, (callback) => {
            let params = {
                Bucket: this._bucket,
                ContinuationToken: token,
                MaxKeys: this._maxPageSize
            };
            this._s3.listObjectsV2(params, (err, data) => {
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
            });
        }, (err) => {
            let page = err == null ? new pip_services3_commons_node_8.DataPage(result, null) : null;
            callback(err, page);
        });
    }
    getBlobsByIds(correlationId, blobIds, callback) {
        let blobs = [];
        async.each(blobIds, (blobId, callback) => {
            this.getBlobById(correlationId, blobId, (err, blob) => {
                if (blob)
                    blobs.push(blob);
                callback(err);
            });
        }, (err) => {
            callback(err, err == null ? blobs : null);
        });
    }
    getBlobById(correlationId, blobId, callback) {
        let params = {
            Bucket: this._bucket,
            Key: blobId
        };
        this._s3.headObject(params, (err, data) => {
            if (err && err.code == "NotFound")
                err = null;
            if (err == null && data != null) {
                let item = this.dataToInfo(blobId, data);
                callback(null, item);
            }
            else
                callback(err, null);
        });
    }
    createBlobFromUri(correlationId, blob, uri, callback) {
        blob.id = blob.id || pip_services3_commons_node_2.IdGenerator.nextLong();
        blob.name = this.normalizeName(blob.name);
        BlobsUriProcessorV1_1.BlobsUriProcessorV1.getUriStream(correlationId, blob, uri, (err, rs) => {
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
    getBlobUriById(correlationId, blobId, callback) {
        let params = {
            Bucket: this._bucket,
            Key: blobId
        };
        this._s3.getSignedUrl('getObject', params, callback);
    }
    createBlobFromData(correlationId, blob, buffer, callback) {
        blob.id = blob.id || pip_services3_commons_node_2.IdGenerator.nextLong();
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
            Expires: pip_services3_commons_node_5.DateTimeConverter.toNullableDateTime(blob.expire_time),
            Metadata: {
                name: blob.name || blob.id,
                group: blob.group || "",
                completed: pip_services3_commons_node_3.StringConverter.toString(blob.completed)
            },
            Body: buffer
        };
        this._s3.upload(params, (err, data) => {
            if (callback) {
                if (err)
                    callback(err, null);
                else
                    this.getBlobById(correlationId, blob.id, callback);
            }
        });
    }
    getBlobDataById(correlationId, blobId, callback) {
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
    createBlobFromStream(correlationId, blob, callback) {
        blob.id = blob.id || pip_services3_commons_node_2.IdGenerator.nextLong();
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
            Expires: pip_services3_commons_node_5.DateTimeConverter.toNullableDateTime(blob.expire_time),
            Metadata: {
                name: blob.name || blob.id,
                group: blob.group || "",
                completed: pip_services3_commons_node_3.StringConverter.toString(blob.completed)
            },
            Body: ws
        };
        this._s3.upload(params, (err, data) => {
            if (callback) {
                if (err)
                    callback(err, null);
                else
                    this.getBlobById(correlationId, blob.id, callback);
            }
        });
        return ws;
    }
    getBlobStreamById(correlationId, blobId, callback) {
        let params = {
            Bucket: this._bucket,
            Key: blobId
        };
        let completed = false;
        let rs = this._s3.getObject(params, (err, data) => {
            // Avoid double exit which may happen on errors
            if (completed)
                return;
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
    updateBlobInfo(correlationId, blob, callback) {
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
            Expires: pip_services3_commons_node_5.DateTimeConverter.toNullableDateTime(blob.expire_time),
            Metadata: {
                name: blob.name,
                group: blob.group,
                completed: pip_services3_commons_node_3.StringConverter.toString(blob.completed)
            },
            MetadataDirective: "REPLACE"
        };
        this._s3.copyObject(params, (err, data) => {
            blob = err == null ? blob : null;
            callback(err, blob);
        });
    }
    markBlobsCompleted(correlationId, ids, callback) {
        async.each(ids, (id, callback) => {
            this.getBlobById(correlationId, id, (err, item) => {
                if (err != null || item == null || item.completed) {
                    callback(err, item);
                }
                else {
                    item.completed = true;
                    this.updateBlobInfo(correlationId, item, callback);
                }
            });
        }, callback);
    }
    deleteBlobById(correlationId, blobId, callback) {
        let params = {
            Bucket: this._bucket,
            Key: blobId
        };
        this._s3.deleteObject(params, callback);
    }
    deleteBlobsByIds(correlationId, blobIds, callback) {
        let params = {
            Bucket: this._bucket,
            Delete: {
                Objects: []
            }
        };
        _.each(blobIds, (blobId) => {
            params.Delete.Objects.push({ Key: blobId });
        });
        this._s3.deleteObjects(params, callback);
    }
    clear(correlationId, callback) {
        let params = {
            Bucket: this._bucket,
        };
        this._s3.listObjects(params, (err, data) => {
            if (err != null || data.Contents.length == 0) {
                if (callback)
                    callback(err);
                return;
            }
            let params = {
                Bucket: this._bucket,
                Delete: {
                    Objects: []
                }
            };
            _.each(data.Contents, (c) => {
                params.Delete.Objects.push({ Key: c.Key });
            });
            this._s3.deleteObjects(params, callback);
        });
    }
}
exports.BlobsS3ClientV1 = BlobsS3ClientV1;
//# sourceMappingURL=BlobsS3ClientV1.js.map