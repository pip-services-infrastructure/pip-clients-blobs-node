import { Descriptor } from 'pip-services-commons-node';
import { Factory } from 'pip-services-components-node';

import { BlobsNullClientV1 } from '../version1/BlobsNullClientV1';
import { BlobsDirectClientV1 } from '../version1/BlobsDirectClientV1';
import { BlobsHttpClientV1 } from '../version1/BlobsHttpClientV1';
import { BlobsSenecaClientV1 } from '../version1/BlobsSenecaClientV1';
import { BlobsS3ClientV1 } from '../version1/BlobsS3ClientV1';

export class BlobsClientFactory extends Factory {
	public static Descriptor: Descriptor = new Descriptor('pip-services-blobs', 'factory', 'default', 'default', '1.0');
	public static NullClientV1Descriptor = new Descriptor('pip-services-blobs', 'client', 'null', 'default', '1.0');
	public static DirectClientV1Descriptor = new Descriptor('pip-services-blobs', 'client', 'direct', 'default', '1.0');
	public static HttpClientV1Descriptor = new Descriptor('pip-services-blobs', 'client', 'http', 'default', '1.0');
	public static SenecaClientV1Descriptor = new Descriptor('pip-services-blobs', 'client', 'seneca', 'default', '1.0');
	public static S3ClientV1Descriptor = new Descriptor('pip-services-blobs', 'client', 's3', 'default', '1.0');
	
	constructor() {
		super();

		this.registerAsType(BlobsClientFactory.NullClientV1Descriptor, BlobsNullClientV1);
		this.registerAsType(BlobsClientFactory.DirectClientV1Descriptor, BlobsDirectClientV1);
		this.registerAsType(BlobsClientFactory.HttpClientV1Descriptor, BlobsHttpClientV1);
		this.registerAsType(BlobsClientFactory.SenecaClientV1Descriptor, BlobsSenecaClientV1);
		this.registerAsType(BlobsClientFactory.S3ClientV1Descriptor, BlobsS3ClientV1);
	}
	
}
