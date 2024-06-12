import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const PROTO_PATH = path.resolve(__dirname, './proto/video.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const videoProto = protoDescriptor.VideoService;

const grpcAddress = process.env.GRPC_SERVER_ADDRESS || 'localhost:3001';
const client = new videoProto(grpcAddress, grpc.credentials.createInsecure());

export default client;
