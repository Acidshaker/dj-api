import { CompanyData } from '../models/CompanyData';
import { configs } from '../config/index';
import { s3Client } from '../config/s3';
import path from 'path';
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

export const uploadCompanyLogo = async (
  fileBuffer: Buffer,
  fileName: string,
  userEmail: string,
  mimeType: string
): Promise<string> => {
  const key = `logos/${userEmail}/${Date.now()}-${path.basename(fileName)}`;
  console.log('🔑 Key generada:', key);

  try {
    const stream = Readable.from(fileBuffer); // ✅ convierte Buffer a stream

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: configs.api.aws.bucketName!,
        Key: key,
        Body: stream,
        ContentType: mimeType,
        // ACL: 'public-read',
      },
    });
    const result = await upload.done();
    console.log('✅ Resultado de subida:', result);
    return `https://${configs.api.aws.bucketName}.s3.${configs.api.aws.region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('❌ Error al subir a S3:', error);
    throw new Error('Falló la subida del logo a S3');
  }
};

export const deleteFileFromS3 = async (fileUrl: string): Promise<void> => {
  if (!fileUrl.includes('.amazonaws.com/')) return;

  const key = fileUrl.split('.amazonaws.com/')[1];

  const command = new DeleteObjectCommand({
    Bucket: configs.api.aws.bucketName!,
    Key: key,
  });

  await s3Client.send(command);
};
