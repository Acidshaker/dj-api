import { configs } from '../config/index';
import { s3 } from '../config/s3';
import path from 'path';

export const uploadCompanyLogo = async (
  fileBuffer: Buffer,
  fileName: string,
  userEmail: string,
  mimeType: string
): Promise<string> => {
  const key = `${userEmail}/logos/${Date.now()}-${path.basename(fileName)}`;

  const params = {
    Bucket: configs.api.aws.bucketName!,
    Key: key,
    Body: fileBuffer,
    ContentType: mimeType,
    ACL: 'public-read',
  };

  await s3.upload(params).promise();

  return `https://${configs.api.aws.bucketName}.s3.${configs.api.aws.region}.amazonaws.com/${key}`;
};

export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  if (!fileUrl.includes('.amazonaws.com/')) return;

  const key = fileUrl.split('.amazonaws.com/')[1];

  await s3
    .deleteObject({
      Bucket: configs.api.aws.bucketName!,
      Key: key,
    })
    .promise();
};
