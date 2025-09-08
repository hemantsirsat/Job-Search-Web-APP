// lib/s3Upload.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadPdfToS3(fileBuffer: Buffer, originalName: string): Promise<{ key: string, bucket: string, url: string }> {
  const fileExtension = path.extname(originalName) || '.pdf';
  const key = `resumes/${uuidv4()}${fileExtension}`;
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: fileBuffer,
    ContentType: 'application/pdf',
  });

  await s3.send(command);

  return {
    bucket: bucketName,
    key,
    url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
  };
}

