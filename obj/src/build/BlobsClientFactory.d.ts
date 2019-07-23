import { Descriptor } from 'pip-services3-commons-node';
import { Factory } from 'pip-services3-components-node';
export declare class BlobsClientFactory extends Factory {
    static Descriptor: Descriptor;
    static NullClientV1Descriptor: Descriptor;
    static DirectClientV1Descriptor: Descriptor;
    static HttpClientV1Descriptor: Descriptor;
    static LambdaClientV1Descriptor: Descriptor;
    static S3ClientV1Descriptor: Descriptor;
    static CommandableGrpcClientV1Descriptor: Descriptor;
    static GrpcClientV1Descriptor: Descriptor;
    constructor();
}
