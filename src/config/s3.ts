import { S3Client } from '@aws-sdk/client-s3';
import { configs } from './index';

export const s3Client = new S3Client({
  region: configs.api.aws.region!,
  credentials: {
    accessKeyId: configs.api.aws.accessKeyId!,
    secretAccessKey: configs.api.aws.secretAccessKey!,
  },
});
